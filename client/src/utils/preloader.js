/**
 * Preloader utility for optimizing component loading
 */

// Component import functions for preloading
const componentImports = {
  Cart: () => import('../pages/Cart/Cart'),
  PlaceOrder: () => import('../pages/PlaceOrder/PlaceOrder'),
  Profile: () => import('../pages/Profile/Profile'),
  Orders: () => import('../pages/Orders/Orders'),
  Restaurant: () => import('../pages/Restaurant/Restaurant'),
  Verify: () => import('../pages/Verify/Verify'),
  AuthSuccess: () => import('../components/AuthSuccess/AuthSuccess'),
  ChatbotPage: () => import('../pages/chatbot/ChatbotPage')
};

/**
 * Preload components based on user interaction patterns
 */
class ComponentPreloader {
  constructor() {
    this.preloadedComponents = new Set();
    this.preloadQueue = [];
    this.isPreloading = false;
  }

  /**
   * Preload a specific component
   * @param {string} componentName - Name of the component to preload
   * @returns {Promise}
   */
  async preloadComponent(componentName) {
    if (this.preloadedComponents.has(componentName)) {
      console.log(`📦 Component ${componentName} already preloaded`);
      return;
    }

    const importFn = componentImports[componentName];
    if (!importFn) {
      console.warn(`⚠️ Component ${componentName} not found in preloader`);
      return;
    }

    try {
      console.log(`🚀 Preloading component: ${componentName}`);
      await importFn();
      this.preloadedComponents.add(componentName);
      console.log(`✅ Component ${componentName} preloaded successfully`);
    } catch (error) {
      console.error(`❌ Failed to preload component ${componentName}:`, error);
    }
  }

  /**
   * Preload multiple components
   * @param {string[]} componentNames - Array of component names to preload
   */
  async preloadComponents(componentNames) {
    const promises = componentNames.map(name => this.preloadComponent(name));
    await Promise.allSettled(promises);
  }

  /**
   * Preload components based on user behavior patterns
   */
  async preloadCriticalComponents() {
    // Preload most commonly accessed components
    const criticalComponents = ['Cart', 'Restaurant', 'Orders'];
    await this.preloadComponents(criticalComponents);
  }

  /**
   * Preload components on user interaction (hover, focus, etc.)
   * @param {string} componentName - Component to preload
   * @param {HTMLElement} triggerElement - Element that triggers preload
   */
  preloadOnInteraction(componentName, triggerElement) {
    if (!triggerElement) return;

    const preload = () => {
      this.preloadComponent(componentName);
      // Remove listeners after first trigger
      triggerElement.removeEventListener('mouseenter', preload);
      triggerElement.removeEventListener('focus', preload);
    };

    triggerElement.addEventListener('mouseenter', preload, { once: true });
    triggerElement.addEventListener('focus', preload, { once: true });
  }

  /**
   * Preload components when browser is idle
   */
  preloadOnIdle() {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.preloadCriticalComponents();
      }, { timeout: 5000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        this.preloadCriticalComponents();
      }, 2000);
    }
  }

  /**
   * Preload components based on route patterns
   * @param {string} currentRoute - Current route path
   */
  preloadByRoute(currentRoute) {
    const routePreloadMap = {
      '/': ['Cart', 'Restaurant'], // Home page users likely to visit
      '/cart': ['PlaceOrder'], // Cart users likely to checkout
      '/restaurant': ['Cart'], // Restaurant viewers likely to add to cart
      '/profile': ['Orders'], // Profile users likely to check orders
    };

    const componentsToPreload = routePreloadMap[currentRoute];
    if (componentsToPreload) {
      this.preloadComponents(componentsToPreload);
    }
  }

  /**
   * Get preload statistics
   * @returns {Object}
   */
  getStats() {
    return {
      preloadedCount: this.preloadedComponents.size,
      preloadedComponents: Array.from(this.preloadedComponents),
      totalComponents: Object.keys(componentImports).length
    };
  }
}

// Create singleton instance
const preloader = new ComponentPreloader();

/**
 * Hook for using component preloader in React components
 */
export const useComponentPreloader = () => {
  return {
    preloadComponent: (name) => preloader.preloadComponent(name),
    preloadComponents: (names) => preloader.preloadComponents(names),
    preloadOnInteraction: (name, element) => preloader.preloadOnInteraction(name, element),
    preloadByRoute: (route) => preloader.preloadByRoute(route),
    getStats: () => preloader.getStats()
  };
};

/**
 * Initialize preloader with optimal settings
 */
export const initializePreloader = () => {
  // Start preloading on idle
  preloader.preloadOnIdle();

  // Preload based on connection speed
  if ('connection' in navigator) {
    const connection = navigator.connection;
    if (connection.effectiveType === '4g' && !connection.saveData) {
      // Fast connection, preload more aggressively
      setTimeout(() => {
        preloader.preloadComponents(['Cart', 'Restaurant', 'Orders', 'Profile']);
      }, 1000);
    }
  }

  console.log('🚀 Component preloader initialized');
};

export default preloader;
