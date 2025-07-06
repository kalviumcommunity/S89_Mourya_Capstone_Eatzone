/**
 * Auto-reload functionality for real-time updates when admin makes changes
 */

class AutoReloadManager {
  constructor() {
    this.isEnabled = true;
    this.pollInterval = 30000; // 30 seconds
    this.lastUpdateTimes = {
      categories: null,
      restaurants: null,
      foodItems: null
    };
    this.intervalIds = new Map();
    this.callbacks = new Map();
  }

  /**
   * Start monitoring for changes
   * @param {string} type - Type to monitor (categories, restaurants, foodItems)
   * @param {Function} callback - Callback to execute when changes detected
   */
  startMonitoring(type, callback) {
    if (!this.isEnabled) return;

    console.log(`🔄 Starting auto-reload monitoring for ${type}`);
    
    this.callbacks.set(type, callback);
    
    // Clear existing interval if any
    if (this.intervalIds.has(type)) {
      clearInterval(this.intervalIds.get(type));
    }

    // Start polling for changes
    const intervalId = setInterval(() => {
      this.checkForUpdates(type);
    }, this.pollInterval);

    this.intervalIds.set(type, intervalId);

    // Initial check
    this.checkForUpdates(type);
  }

  /**
   * Stop monitoring for a specific type
   * @param {string} type - Type to stop monitoring
   */
  stopMonitoring(type) {
    if (this.intervalIds.has(type)) {
      clearInterval(this.intervalIds.get(type));
      this.intervalIds.delete(type);
      this.callbacks.delete(type);
      console.log(`⏹️ Stopped auto-reload monitoring for ${type}`);
    }
  }

  /**
   * Stop all monitoring
   */
  stopAllMonitoring() {
    for (const [type, intervalId] of this.intervalIds) {
      clearInterval(intervalId);
    }
    this.intervalIds.clear();
    this.callbacks.clear();
    console.log('⏹️ Stopped all auto-reload monitoring');
  }

  /**
   * Check for updates by comparing timestamps
   * @param {string} type - Type to check
   */
  async checkForUpdates(type) {
    try {
      const apiUrl = this.getApiUrl(type);
      const response = await fetch(apiUrl, {
        method: 'HEAD', // Only get headers to check last-modified
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (response.ok) {
        const lastModified = response.headers.get('last-modified');
        const etag = response.headers.get('etag');
        const currentTime = new Date().toISOString();
        
        // Use ETag or last-modified or current time as update indicator
        const updateIndicator = etag || lastModified || currentTime;
        
        if (this.lastUpdateTimes[type] && this.lastUpdateTimes[type] !== updateIndicator) {
          console.log(`🔄 Changes detected for ${type}, triggering reload...`);
          this.triggerReload(type);
        }
        
        this.lastUpdateTimes[type] = updateIndicator;
      }
    } catch (error) {
      console.warn(`⚠️ Failed to check for updates for ${type}:`, error);
    }
  }

  /**
   * Get API URL for different types
   * @param {string} type - Type to get URL for
   * @returns {string} API URL
   */
  getApiUrl(type) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "https://eatzone.onrender.com";
    
    switch (type) {
      case 'categories':
        return `${baseUrl}/api/category/list`;
      case 'restaurants':
        return `${baseUrl}/api/restaurant/list`;
      case 'foodItems':
        return `${baseUrl}/api/food/list`;
      default:
        throw new Error(`Unknown type: ${type}`);
    }
  }

  /**
   * Trigger reload for specific type
   * @param {string} type - Type that was updated
   */
  triggerReload(type) {
    const callback = this.callbacks.get(type);
    if (callback) {
      console.log(`✅ Auto-reloading ${type} data...`);
      callback();
      
      // Show user notification
      this.showUpdateNotification(type);
    }
  }

  /**
   * Show notification to user about updates
   * @param {string} type - Type that was updated
   */
  showUpdateNotification(type) {
    // Create a subtle notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>🔄</span>
        <span>${this.getUpdateMessage(type)}</span>
      </div>
    `;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      }, 300);
    }, 3000);
  }

  /**
   * Get update message for different types
   * @param {string} type - Type that was updated
   * @returns {string} Update message
   */
  getUpdateMessage(type) {
    switch (type) {
      case 'categories':
        return 'Categories updated!';
      case 'restaurants':
        return 'Restaurants updated!';
      case 'foodItems':
        return 'Menu updated!';
      default:
        return 'Content updated!';
    }
  }

  /**
   * Enable auto-reload
   */
  enable() {
    this.isEnabled = true;
    console.log('✅ Auto-reload enabled');
  }

  /**
   * Disable auto-reload
   */
  disable() {
    this.isEnabled = false;
    this.stopAllMonitoring();
    console.log('❌ Auto-reload disabled');
  }

  /**
   * Set poll interval
   * @param {number} interval - Interval in milliseconds
   */
  setPollInterval(interval) {
    this.pollInterval = interval;
    console.log(`⏱️ Auto-reload poll interval set to ${interval}ms`);
  }
}

// Global instance
export const autoReloadManager = new AutoReloadManager();

/**
 * Hook for React components to use auto-reload
 * @param {string} type - Type to monitor
 * @param {Function} reloadCallback - Function to call when reload needed
 */
export const useAutoReload = (type, reloadCallback) => {
  const startMonitoring = () => {
    autoReloadManager.startMonitoring(type, reloadCallback);
  };

  const stopMonitoring = () => {
    autoReloadManager.stopMonitoring(type);
  };

  return { startMonitoring, stopMonitoring };
};

export default autoReloadManager;
