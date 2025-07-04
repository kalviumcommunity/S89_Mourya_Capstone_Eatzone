/**
 * Performance monitoring utilities for EatZone
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = [];
    this.isEnabled = process.env.NODE_ENV === 'development' || 
                     localStorage.getItem('eatzone_debug') === 'true';
  }

  /**
   * Start timing a performance metric
   * @param {string} name - Metric name
   */
  startTiming(name) {
    if (!this.isEnabled) return;
    
    this.metrics.set(name, {
      startTime: performance.now(),
      endTime: null,
      duration: null
    });
  }

  /**
   * End timing a performance metric
   * @param {string} name - Metric name
   */
  endTiming(name) {
    if (!this.isEnabled) return;
    
    const metric = this.metrics.get(name);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      
      console.log(`⏱️ ${name}: ${metric.duration.toFixed(2)}ms`);
      
      // Log slow operations
      if (metric.duration > 1000) {
        console.warn(`🐌 Slow operation detected: ${name} took ${metric.duration.toFixed(2)}ms`);
      }
    }
  }

  /**
   * Measure function execution time
   * @param {string} name - Metric name
   * @param {Function} fn - Function to measure
   * @returns {any} Function result
   */
  async measure(name, fn) {
    this.startTiming(name);
    try {
      const result = await fn();
      this.endTiming(name);
      return result;
    } catch (error) {
      this.endTiming(name);
      throw error;
    }
  }

  /**
   * Monitor image loading performance
   * @param {HTMLImageElement} img - Image element
   * @param {string} name - Metric name
   */
  monitorImageLoad(img, name) {
    if (!this.isEnabled) return;
    
    const startTime = performance.now();
    
    const onLoad = () => {
      const duration = performance.now() - startTime;
      console.log(`🖼️ Image loaded: ${name} - ${duration.toFixed(2)}ms`);

      // Track image loading statistics
      this.trackImageLoadTime(duration);

      if (duration > 3000) {
        console.warn(`🐌 Slow image load: ${name} took ${duration.toFixed(2)}ms`);
      }

      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
    };
    
    const onError = () => {
      const duration = performance.now() - startTime;
      console.error(`❌ Image failed to load: ${name} after ${duration.toFixed(2)}ms`);
      
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
    };
    
    img.addEventListener('load', onLoad);
    img.addEventListener('error', onError);
  }

  /**
   * Track image loading statistics
   * @param {number} loadTime - Load time in milliseconds
   */
  trackImageLoadTime(loadTime) {
    if (!this.imageStats) {
      this.imageStats = {
        totalImages: 0,
        totalLoadTime: 0,
        fastLoads: 0, // < 1 second
        slowLoads: 0  // > 3 seconds
      };
    }

    this.imageStats.totalImages++;
    this.imageStats.totalLoadTime += loadTime;

    if (loadTime < 1000) {
      this.imageStats.fastLoads++;
    } else if (loadTime > 3000) {
      this.imageStats.slowLoads++;
    }

    // Log stats every 10 images
    if (this.imageStats.totalImages % 10 === 0) {
      const avgLoadTime = this.imageStats.totalLoadTime / this.imageStats.totalImages;
      console.log(`📊 Image Loading Stats:`, {
        totalImages: this.imageStats.totalImages,
        averageLoadTime: `${avgLoadTime.toFixed(2)}ms`,
        fastLoads: this.imageStats.fastLoads,
        slowLoads: this.imageStats.slowLoads
      });
    }
  }

  /**
   * Monitor API call performance
   * @param {string} endpoint - API endpoint
   * @param {Promise} promise - API call promise
   * @returns {Promise}
   */
  async monitorApiCall(endpoint, promise) {
    if (!this.isEnabled) return promise;
    
    const startTime = performance.now();
    
    try {
      const result = await promise;
      const duration = performance.now() - startTime;
      
      console.log(`🌐 API call: ${endpoint} - ${duration.toFixed(2)}ms`);
      
      if (duration > 5000) {
        console.warn(`🐌 Slow API call: ${endpoint} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`❌ API call failed: ${endpoint} after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  }

  /**
   * Monitor component render performance
   * @param {string} componentName - Component name
   */
  monitorComponentRender(componentName) {
    if (!this.isEnabled) return { start: () => {}, end: () => {} };
    
    let startTime;
    
    return {
      start: () => {
        startTime = performance.now();
      },
      end: () => {
        if (startTime) {
          const duration = performance.now() - startTime;
          console.log(`⚛️ Component render: ${componentName} - ${duration.toFixed(2)}ms`);
          
          if (duration > 100) {
            console.warn(`🐌 Slow component render: ${componentName} took ${duration.toFixed(2)}ms`);
          }
        }
      }
    };
  }

  /**
   * Get Core Web Vitals
   */
  getCoreWebVitals() {
    if (!this.isEnabled) return;
    
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log(`📊 LCP: ${lastEntry.startTime.toFixed(2)}ms`);
      });
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
      
      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          console.log(`📊 FID: ${entry.processingStart - entry.startTime}ms`);
        });
      });
      
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
      
      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        let clsValue = 0;
        
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        if (clsValue > 0) {
          console.log(`📊 CLS: ${clsValue.toFixed(4)}`);
        }
      });
      
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    }
  }

  /**
   * Get performance summary
   * @returns {Object}
   */
  getSummary() {
    if (!this.isEnabled) return {};
    
    const summary = {
      totalMetrics: this.metrics.size,
      metrics: {},
      navigation: performance.getEntriesByType('navigation')[0],
      memory: performance.memory ? {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      } : null
    };
    
    // Convert metrics to plain object
    this.metrics.forEach((value, key) => {
      summary.metrics[key] = value;
    });
    
    return summary;
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics.clear();
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  /**
   * Enable/disable monitoring
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    if (enabled) {
      localStorage.setItem('eatzone_debug', 'true');
    } else {
      localStorage.removeItem('eatzone_debug');
    }
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Initialize Core Web Vitals monitoring
if (typeof window !== 'undefined') {
  performanceMonitor.getCoreWebVitals();
}

export default performanceMonitor;
