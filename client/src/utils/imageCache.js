/**
 * Simple image cache utility for better performance
 */

class ImageCache {
  constructor() {
    this.cache = new Map();
    this.preloadQueue = new Set();
    this.maxCacheSize = 50; // Maximum number of cached images
  }

  /**
   * Check if an image is already cached
   * @param {string} url - Image URL
   * @returns {boolean}
   */
  has(url) {
    return this.cache.has(url);
  }

  /**
   * Get cached image element
   * @param {string} url - Image URL
   * @returns {HTMLImageElement|null}
   */
  get(url) {
    const cached = this.cache.get(url);
    if (cached) {
      // Update access time for LRU
      cached.lastAccessed = Date.now();
      return cached.img;
    }
    return null;
  }

  /**
   * Cache an image
   * @param {string} url - Image URL
   * @param {HTMLImageElement} img - Image element
   */
  set(url, img) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      this.evictOldest();
    }

    this.cache.set(url, {
      img: img,
      cached: Date.now(),
      lastAccessed: Date.now()
    });
  }

  /**
   * Preload an image and cache it
   * @param {string} url - Image URL
   * @returns {Promise<HTMLImageElement>}
   */
  preload(url) {
    return new Promise((resolve, reject) => {
      // Check if already cached
      if (this.has(url)) {
        resolve(this.get(url));
        return;
      }

      // Check if already in preload queue
      if (this.preloadQueue.has(url)) {
        // Wait for existing preload to complete
        const checkInterval = setInterval(() => {
          if (this.has(url)) {
            clearInterval(checkInterval);
            resolve(this.get(url));
          }
        }, 100);
        return;
      }

      this.preloadQueue.add(url);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        this.set(url, img);
        this.preloadQueue.delete(url);
        resolve(img);
      };

      img.onerror = () => {
        this.preloadQueue.delete(url);
        reject(new Error(`Failed to preload image: ${url}`));
      };

      img.src = url;
    });
  }

  /**
   * Preload multiple images
   * @param {string[]} urls - Array of image URLs
   * @returns {Promise<HTMLImageElement[]>}
   */
  preloadMultiple(urls) {
    return Promise.allSettled(urls.map(url => this.preload(url)));
  }

  /**
   * Evict oldest cached images
   */
  evictOldest() {
    let oldestUrl = null;
    let oldestTime = Date.now();

    for (const [url, data] of this.cache.entries()) {
      if (data.lastAccessed < oldestTime) {
        oldestTime = data.lastAccessed;
        oldestUrl = url;
      }
    }

    if (oldestUrl) {
      this.cache.delete(oldestUrl);
    }
  }

  /**
   * Clear the cache
   */
  clear() {
    this.cache.clear();
    this.preloadQueue.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object}
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      maxCacheSize: this.maxCacheSize,
      preloadQueueSize: this.preloadQueue.size,
      cacheHitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0
    };
  }
}

// Create a singleton instance
const imageCache = new ImageCache();

export default imageCache;

/**
 * Preload critical images for the application with aggressive optimizations for instant loading
 */
export const preloadCriticalImages = () => {
  const criticalImages = [
    // Aggressively optimized default and category images with WebP support
    'https://res.cloudinary.com/dodxdudew/image/upload/f_auto,q_auto:good,w_400,h_300,c_fill,fl_progressive,fl_awebp,dpr_auto/v1735055000/eatzone/categories/default-food.jpg',
    'https://res.cloudinary.com/dodxdudew/image/upload/f_auto,q_auto:good,w_200,h_200,c_fill,fl_progressive,fl_awebp,dpr_auto/v1735055000/eatzone/categories/pizza.jpg',
    'https://res.cloudinary.com/dodxdudew/image/upload/f_auto,q_auto:good,w_200,h_200,c_fill,fl_progressive,fl_awebp,dpr_auto/v1735055000/eatzone/categories/burgers.jpg',
    'https://res.cloudinary.com/dodxdudew/image/upload/f_auto,q_auto:good,w_200,h_200,c_fill,fl_progressive,fl_awebp,dpr_auto/v1735055000/eatzone/categories/desserts.jpg',
    'https://res.cloudinary.com/dodxdudew/image/upload/f_auto,q_auto,w_200,h_200,c_fill/v1735055000/eatzone/categories/noodles.jpg',
    'https://res.cloudinary.com/dodxdudew/image/upload/f_auto,q_auto,w_200,h_200,c_fill/v1735055000/eatzone/categories/chinese.jpg',
    'https://res.cloudinary.com/dodxdudew/image/upload/f_auto,q_auto,w_200,h_200,c_fill/v1735055000/eatzone/categories/indian.jpg',
    'https://res.cloudinary.com/dodxdudew/image/upload/f_auto,q_auto,w_200,h_200,c_fill/v1735055000/eatzone/categories/italian.jpg',
    // Optimized external images
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400&h=300&fit=crop&auto=format&q=80'
  ];

  console.log('🚀 Aggressively preloading critical images for instant app startup...');

  // Start preloading immediately without waiting
  imageCache.preloadMultiple(criticalImages)
    .then(results => {
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;
      console.log(`✅ Preloaded ${successful}/${criticalImages.length} critical images (${failed} failed)`);

      // Store preload completion time for performance monitoring
      if (typeof window !== 'undefined') {
        window.eatZoneImagePreloadTime = Date.now();
        window.eatZoneImageCacheReady = true;
      }
    })
    .catch(error => {
      console.error('❌ Error preloading critical images:', error);
    });

  // Also preload on next tick for immediate availability
  setTimeout(() => {
    criticalImages.forEach(url => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
    });
  }, 0);
};

/**
 * Preload images from API data for faster subsequent loads
 */
export const preloadApiImages = async (foodItems = [], restaurants = []) => {
  const apiImages = [];

  // Add food item images (limit to first 10 for performance)
  foodItems.slice(0, 10).forEach(item => {
    if (item.image) {
      // Add optimized version for food items
      if (item.image.includes('cloudinary.com')) {
        apiImages.push(item.image.replace('/upload/', '/upload/f_auto,q_auto,w_400,h_300,c_fill/'));
      } else {
        apiImages.push(item.image);
      }
    }
  });

  // Add restaurant images (limit to first 5 for performance)
  restaurants.slice(0, 5).forEach(restaurant => {
    if (restaurant.image) {
      // Add optimized version for restaurants
      if (restaurant.image.includes('cloudinary.com')) {
        apiImages.push(restaurant.image.replace('/upload/', '/upload/f_auto,q_auto,w_600,h_400,c_fill/'));
      } else {
        apiImages.push(restaurant.image);
      }
    }
  });

  if (apiImages.length > 0) {
    console.log(`🚀 Preloading ${apiImages.length} API images...`);

    try {
      const results = await imageCache.preloadMultiple(apiImages);
      const successful = results.filter(result => result.status === 'fulfilled').length;
      console.log(`✅ Preloaded ${successful}/${apiImages.length} API images`);
    } catch (error) {
      console.warn('⚠️ Some API images failed to preload:', error);
    }
  }
};
