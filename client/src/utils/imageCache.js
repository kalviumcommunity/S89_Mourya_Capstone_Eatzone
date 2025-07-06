/**
 * High-performance image cache utility optimized for instant loading
 * Ensures all images are visible within seconds
 */

import { IMAGE_OPTIMIZATION_CONFIG } from './imageOptimizationConfig.js';

class ImageCache {
  constructor() {
    this.cache = new Map();
    this.preloadQueue = new Set();
    this.maxCacheSize = IMAGE_OPTIMIZATION_CONFIG.CACHE_SIZE;
    this.preloadBatchSize = IMAGE_OPTIMIZATION_CONFIG.PRELOAD_BATCH_SIZE;
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
   * Preload multiple images with high-performance batching
   * @param {string[]} urls - Array of image URLs
   * @returns {Promise<HTMLImageElement[]>}
   */
  async preloadMultiple(urls) {
    if (!urls || urls.length === 0) return [];

    console.log(`🚀 Starting high-performance batch preload of ${urls.length} images...`);

    // Process in batches for better performance
    const batches = [];
    for (let i = 0; i < urls.length; i += this.preloadBatchSize) {
      batches.push(urls.slice(i, i + this.preloadBatchSize));
    }

    const allResults = [];

    for (const batch of batches) {
      const batchPromises = batch.map(url =>
        this.preload(url).catch(error => {
          console.warn(`⚠️ Failed to preload ${url}:`, error);
          return { error, url };
        })
      );

      try {
        const batchResults = await Promise.allSettled(batchPromises);
        allResults.push(...batchResults);

        // Small delay between batches to prevent overwhelming the browser
        if (batches.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 25));
        }
      } catch (error) {
        console.error('❌ Batch preload error:', error);
      }
    }

    const successful = allResults.filter(result => result.status === 'fulfilled').length;
    console.log(`✅ High-performance batch preload completed: ${successful}/${urls.length} successful`);
    return allResults;
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
 * Preload restaurant images immediately for fastest loading
 */
export const preloadRestaurantImages = async (restaurants = []) => {
  if (!restaurants.length) return;

  const restaurantImages = restaurants
    .filter(restaurant => restaurant.image)
    .map(restaurant => {
      if (restaurant.image.includes('cloudinary.com')) {
        // Use exact display dimensions for restaurants
        return restaurant.image.replace('/upload/', '/upload/f_auto,q_auto:good,w_320,h_200,c_fill,fl_progressive,fl_awebp,dpr_auto/');
      }
      return restaurant.image;
    });

  if (restaurantImages.length > 0) {
    console.log(`🏪 Preloading ${restaurantImages.length} restaurant images for instant loading...`);

    try {
      const results = await imageCache.preloadMultiple(restaurantImages);
      const successful = results.filter(result => result.status === 'fulfilled').length;
      console.log(`✅ Preloaded ${successful}/${restaurantImages.length} restaurant images`);
    } catch (error) {
      console.warn('⚠️ Some restaurant images failed to preload:', error);
    }
  }
};

/**
 * Preload food item images immediately for fastest loading
 */
export const preloadFoodImages = async (foodItems = []) => {
  if (!foodItems.length) return;

  const foodImages = foodItems
    .filter(item => item.image)
    .map(item => {
      if (item.image.includes('cloudinary.com')) {
        // Use exact display dimensions for food items
        return item.image.replace('/upload/', '/upload/f_auto,q_auto:good,w_280,h_200,c_fill,fl_progressive,fl_awebp,dpr_auto/');
      }
      return item.image;
    });

  if (foodImages.length > 0) {
    console.log(`🍕 Preloading ${foodImages.length} food images for instant loading...`);

    try {
      const results = await imageCache.preloadMultiple(foodImages);
      const successful = results.filter(result => result.status === 'fulfilled').length;
      console.log(`✅ Preloaded ${successful}/${foodImages.length} food images`);
    } catch (error) {
      console.warn('⚠️ Some food images failed to preload:', error);
    }
  }
};

/**
 * Preload category images immediately for fastest loading
 */
export const preloadCategoryImages = async (categories = []) => {
  if (!categories.length) return;

  const categoryImages = categories
    .filter(category => category.image)
    .map(category => {
      if (category.image.includes('cloudinary.com')) {
        // Use exact display dimensions for categories
        return category.image.replace('/upload/', '/upload/f_auto,q_auto:good,w_80,h_80,c_fill,fl_progressive,fl_awebp,dpr_auto/');
      }
      return category.image;
    });

  if (categoryImages.length > 0) {
    console.log(`🏷️ Preloading ${categoryImages.length} category images for instant loading...`);

    try {
      const results = await imageCache.preloadMultiple(categoryImages);
      const successful = results.filter(result => result.status === 'fulfilled').length;
      console.log(`✅ Preloaded ${successful}/${categoryImages.length} category images`);
    } catch (error) {
      console.warn('⚠️ Some category images failed to preload:', error);
    }
  }
};

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

  // Add ALL food item images with priority (no limit for instant loading)
  foodItems.forEach(item => {
    if (item.image) {
      // Add optimized version for food items with exact display dimensions
      if (item.image.includes('cloudinary.com')) {
        // Use exact display dimensions (280x200) for faster loading
        apiImages.push(item.image.replace('/upload/', '/upload/f_auto,q_auto:good,w_280,h_200,c_fill,fl_progressive,fl_awebp,dpr_auto/'));
      } else {
        apiImages.push(item.image);
      }
    }
  });

  // Add ALL restaurant images with priority (restaurants load first for better UX)
  restaurants.forEach(restaurant => {
    if (restaurant.image) {
      // Add optimized version for restaurants with exact display dimensions
      if (restaurant.image.includes('cloudinary.com')) {
        // Use exact display dimensions (320x200) for faster loading
        apiImages.unshift(restaurant.image.replace('/upload/', '/upload/f_auto,q_auto:good,w_320,h_200,c_fill,fl_progressive,fl_awebp,dpr_auto/'));
      } else {
        apiImages.unshift(restaurant.image);
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
