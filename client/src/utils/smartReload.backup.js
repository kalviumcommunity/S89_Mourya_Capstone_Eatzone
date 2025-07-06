/**
 * Smart reload system that loads data efficiently without continuous polling
 */

class SmartReloadManager {
  constructor() {
    this.isInitialized = false;
    this.callbacks = new Map();
    this.lastLoadTimes = new Map();
    this.minReloadInterval = 5000; // Minimum 5 seconds between reloads
  }

  /**
   * Register a callback for a specific data type
   * @param {string} type - Data type (categories, restaurants, foodItems)
   * @param {Function} callback - Callback function to reload data
   */
  register(type, callback) {
    this.callbacks.set(type, callback);
    console.log(`📝 Registered reload callback for ${type}`);
  }

  /**
   * Unregister a callback
   * @param {string} type - Data type to unregister
   */
  unregister(type) {
    this.callbacks.delete(type);
    this.lastLoadTimes.delete(type);
    console.log(`🗑️ Unregistered reload callback for ${type}`);
  }

  /**
   * Trigger reload for a specific type with rate limiting
   * @param {string} type - Data type to reload
   * @param {boolean} force - Force reload even if recently loaded
   */
  async reload(type, force = false) {
    const callback = this.callbacks.get(type);
    if (!callback) {
      console.warn(`⚠️ No callback registered for ${type}`);
      return;
    }

    // Rate limiting - prevent too frequent reloads
    const lastLoad = this.lastLoadTimes.get(type);
    const now = Date.now();
    
    if (!force && lastLoad && (now - lastLoad) < this.minReloadInterval) {
      console.log(`⏱️ Rate limited reload for ${type}, skipping`);
      return;
    }

    try {
      console.log(`🔄 Smart reloading ${type}...`);
      await callback();
      this.lastLoadTimes.set(type, now);
      console.log(`✅ Successfully reloaded ${type}`);
    } catch (error) {
      console.error(`❌ Error reloading ${type}:`, error);
    }
  }

  /**
   * Reload all registered data types
   * @param {boolean} force - Force reload even if recently loaded
   */
  async reloadAll(force = false) {
    console.log('🔄 Smart reloading all data...');
    const promises = Array.from(this.callbacks.keys()).map(type => 
      this.reload(type, force)
    );
    await Promise.all(promises);
    console.log('✅ All data reloaded');
  }

  /**
   * Initialize the smart reload system
   */
  initialize() {
    if (this.isInitialized) return;

    // Listen for custom events from admin panel
    window.addEventListener('adminDataUpdated', (event) => {
      const { type } = event.detail || {};
      if (type) {
        console.log(`📡 Received admin update signal for ${type}`);
        this.reload(type, true);
      } else {
        console.log('📡 Received admin update signal for all data');
        this.reloadAll(true);
      }
    });

    // Listen for page visibility changes to reload when user returns
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        console.log('👁️ Page became visible, checking for updates...');
        // Only reload if page was hidden for more than 30 seconds
        setTimeout(() => {
          this.reloadAll(false);
        }, 1000);
      }
    });

    this.isInitialized = true;
    console.log('✅ Smart reload system initialized');
  }

  /**
   * Clean up the smart reload system
   */
  cleanup() {
    this.callbacks.clear();
    this.lastLoadTimes.clear();
    this.isInitialized = false;
    console.log('🧹 Smart reload system cleaned up');
  }
}

// Global instance
export const smartReloadManager = new SmartReloadManager();

/**
 * React hook for smart reload functionality
 * @param {string} type - Data type to manage
 * @param {Function} reloadCallback - Function to call when reload needed
 */
export const useSmartReload = (type, reloadCallback) => {
  const register = () => {
    smartReloadManager.register(type, reloadCallback);
  };

  const unregister = () => {
    smartReloadManager.unregister(type);
  };

  const reload = (force = false) => {
    return smartReloadManager.reload(type, force);
  };

  return { register, unregister, reload };
};

export default smartReloadManager;
