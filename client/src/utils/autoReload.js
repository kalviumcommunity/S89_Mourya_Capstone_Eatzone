/**
 * Auto-reload functionality for real-time updates when admin makes changes
 */

class AutoReloadManager {
  constructor() {
    this.isEnabled = false; // Disabled by default to prevent continuous reloading
    this.pollInterval = 60000; // Increased to 60 seconds to reduce server load
    this.lastUpdateTimes = {
      categories: null,
      restaurants: null,
      foodItems: null
    };
    this.intervalIds = new Map();
    this.callbacks = new Map();
    this.isInitialized = false;
  }

  /**
   * Start monitoring for changes
   * @param {string} type - Type to monitor (categories, restaurants, foodItems)
   * @param {Function} callback - Callback to execute when changes detected
   */
  startMonitoring(type, callback) {
    if (!this.isEnabled) {
      console.log(`⏸️ Auto-reload monitoring disabled for ${type}`);
      return;
    }

    console.log(`🔄 Starting auto-reload monitoring for ${type}`);

    this.callbacks.set(type, callback);

    // Clear existing interval if any
    if (this.intervalIds.has(type)) {
      clearInterval(this.intervalIds.get(type));
    }

    // Start polling for changes with reduced frequency
    const intervalId = setInterval(() => {
      this.checkForUpdates(type);
    }, this.pollInterval);

    this.intervalIds.set(type, intervalId);

    // Skip initial check to prevent immediate reload
    console.log(`✅ Auto-reload monitoring started for ${type} (${this.pollInterval}ms interval)`);
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
   * Show notification to user about updates (disabled to prevent popup spam)
   * @param {string} type - Type that was updated
   */
  showUpdateNotification(type) {
    // Disable popup notifications to prevent continuous popup spam
    // Just log to console for debugging
    console.log(`✅ ${this.getUpdateMessage(type)} (notification disabled)`);
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
