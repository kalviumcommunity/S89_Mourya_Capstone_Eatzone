/**
 * Image Performance Monitoring and Optimization Utilities
 * Ensures all images load within seconds for optimal user experience
 */

class ImagePerformanceMonitor {
  constructor() {
    this.loadTimes = new Map();
    this.failedImages = new Set();
    this.totalImages = 0;
    this.loadedImages = 0;
    this.startTime = Date.now();
    this.targetLoadTime = 3000; // 3 seconds target
  }

  /**
   * Start monitoring an image load
   * @param {string} src - Image source URL
   * @param {string} type - Image type (restaurant, food, category)
   */
  startLoad(src, type = 'unknown') {
    this.totalImages++;
    this.loadTimes.set(src, {
      startTime: Date.now(),
      type,
      status: 'loading'
    });
    
    console.log(`📊 Starting load for ${type} image: ${src.substring(0, 50)}...`);
  }

  /**
   * Mark an image as successfully loaded
   * @param {string} src - Image source URL
   */
  markLoaded(src) {
    const loadData = this.loadTimes.get(src);
    if (loadData) {
      const loadTime = Date.now() - loadData.startTime;
      loadData.loadTime = loadTime;
      loadData.status = 'loaded';
      this.loadedImages++;

      const status = loadTime <= 1000 ? '🚀' : loadTime <= 2000 ? '✅' : '⚠️';
      console.log(`${status} Image loaded in ${loadTime}ms (${loadData.type}): ${src.substring(0, 50)}...`);

      // Check if we've reached our performance target
      this.checkPerformanceTarget();
    }
  }

  /**
   * Mark an image as failed to load
   * @param {string} src - Image source URL
   * @param {Error} error - Error details
   */
  markFailed(src, error) {
    const loadData = this.loadTimes.get(src);
    if (loadData) {
      loadData.status = 'failed';
      loadData.error = error;
      this.failedImages.add(src);
      
      console.error(`❌ Image failed to load (${loadData.type}): ${src.substring(0, 50)}...`, error);
    }
  }

  /**
   * Check if we're meeting our performance targets
   */
  checkPerformanceTarget() {
    const totalTime = Date.now() - this.startTime;
    const loadedPercentage = (this.loadedImages / this.totalImages) * 100;

    if (totalTime > this.targetLoadTime && loadedPercentage < 90) {
      console.warn(`⚠️ Performance Warning: ${loadedPercentage.toFixed(1)}% images loaded in ${totalTime}ms (target: ${this.targetLoadTime}ms)`);
    } else if (loadedPercentage >= 90) {
      console.log(`🎉 Performance Target Met: ${loadedPercentage.toFixed(1)}% images loaded in ${totalTime}ms`);
    }
  }

  /**
   * Get performance statistics
   * @returns {Object} Performance stats
   */
  getStats() {
    const totalTime = Date.now() - this.startTime;
    const loadedPercentage = (this.loadedImages / this.totalImages) * 100;
    
    const avgLoadTime = Array.from(this.loadTimes.values())
      .filter(data => data.loadTime)
      .reduce((sum, data, _, arr) => sum + data.loadTime / arr.length, 0);

    return {
      totalImages: this.totalImages,
      loadedImages: this.loadedImages,
      failedImages: this.failedImages.size,
      loadedPercentage: loadedPercentage.toFixed(1),
      totalTime,
      avgLoadTime: Math.round(avgLoadTime),
      targetMet: totalTime <= this.targetLoadTime && loadedPercentage >= 90
    };
  }

  /**
   * Log performance summary
   */
  logSummary() {
    const stats = this.getStats();
    console.log('📊 Image Performance Summary:', stats);
    
    if (stats.targetMet) {
      console.log('🎯 Performance target achieved! All images loading within seconds.');
    } else {
      console.warn('⚠️ Performance target not met. Consider optimizing image loading strategy.');
    }
  }
}

// Global performance monitor instance
export const imagePerformanceMonitor = new ImagePerformanceMonitor();

/**
 * Enhanced image preloading with performance monitoring
 * @param {string[]} imageUrls - Array of image URLs to preload
 * @param {string} type - Type of images being preloaded
 * @returns {Promise<Array>} Preload results
 */
export const preloadImagesWithMonitoring = async (imageUrls, type = 'unknown') => {
  if (!imageUrls || imageUrls.length === 0) return [];

  console.log(`🚀 Starting monitored preload of ${imageUrls.length} ${type} images...`);

  const preloadPromises = imageUrls.map(url => {
    return new Promise((resolve, reject) => {
      imagePerformanceMonitor.startLoad(url, type);
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        imagePerformanceMonitor.markLoaded(url);
        resolve({ url, status: 'loaded', img });
      };
      
      img.onerror = (error) => {
        imagePerformanceMonitor.markFailed(url, error);
        reject({ url, status: 'failed', error });
      };
      
      img.src = url;
    });
  });

  try {
    const results = await Promise.allSettled(preloadPromises);
    const successful = results.filter(result => result.status === 'fulfilled').length;
    
    console.log(`✅ Monitored preload completed: ${successful}/${imageUrls.length} ${type} images successful`);
    
    // Log performance summary after each batch
    setTimeout(() => imagePerformanceMonitor.logSummary(), 100);
    
    return results;
  } catch (error) {
    console.error(`❌ Error in monitored preload for ${type} images:`, error);
    return [];
  }
};

/**
 * Initialize performance monitoring for the application
 */
export const initializeImagePerformanceMonitoring = () => {
  console.log('📊 Initializing image performance monitoring...');
  console.log('🎯 Target: All images visible within 3 seconds');
  
  // Monitor overall page load performance
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      setTimeout(() => {
        imagePerformanceMonitor.logSummary();
      }, 1000);
    });
  }
};

/**
 * Get current performance status
 * @returns {Object} Current performance metrics
 */
export const getCurrentPerformanceStatus = () => {
  return imagePerformanceMonitor.getStats();
};
