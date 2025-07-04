/**
 * Simple in-memory cache with TTL (Time To Live) support
 */
class Cache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  /**
   * Set a value in cache with optional TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
   */
  set(key, value, ttl = 5 * 60 * 1000) {
    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Set the value
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });

    // Set expiration timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl);

    this.timers.set(key, timer);
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null if not found/expired
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Check if a key exists in cache and is not expired
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Delete a key from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key);
    
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
  }

  /**
   * Clear all cache
   */
  clear() {
    // Clear all timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.cache.clear();
  }

  /**
   * Get cache size
   * @returns {number}
   */
  size() {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   * @returns {Object}
   */
  getStats() {
    const now = Date.now();
    let expired = 0;
    let valid = 0;

    this.cache.forEach((item) => {
      if (now - item.timestamp > item.ttl) {
        expired++;
      } else {
        valid++;
      }
    });

    return {
      total: this.cache.size,
      valid,
      expired
    };
  }
}

// Create a global cache instance
const globalCache = new Cache();

/**
 * Cache wrapper for API calls
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Function that returns a Promise
 * @param {number} ttl - Time to live in milliseconds
 * @returns {Promise} Cached or fresh data
 */
export const cachedFetch = async (key, fetchFn, ttl = 5 * 60 * 1000) => {
  // Try to get from cache first
  const cached = globalCache.get(key);
  if (cached) {
    console.log(`📦 Cache hit for: ${key}`);
    return cached;
  }

  console.log(`🌐 Cache miss, fetching: ${key}`);
  
  try {
    // Fetch fresh data
    const data = await fetchFn();
    
    // Cache the result
    globalCache.set(key, data, ttl);
    
    return data;
  } catch (error) {
    console.error(`❌ Failed to fetch ${key}:`, error);
    throw error;
  }
};

/**
 * Preload data into cache
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Function that returns a Promise
 * @param {number} ttl - Time to live in milliseconds
 */
export const preloadCache = async (key, fetchFn, ttl = 5 * 60 * 1000) => {
  if (!globalCache.has(key)) {
    try {
      const data = await fetchFn();
      globalCache.set(key, data, ttl);
      console.log(`🚀 Preloaded cache for: ${key}`);
    } catch (error) {
      console.error(`❌ Failed to preload ${key}:`, error);
    }
  }
};

/**
 * Invalidate cache for specific keys or patterns
 * @param {string|RegExp} pattern - Key or pattern to invalidate
 */
export const invalidateCache = (pattern) => {
  if (typeof pattern === 'string') {
    globalCache.delete(pattern);
    console.log(`🗑️ Invalidated cache for: ${pattern}`);
  } else if (pattern instanceof RegExp) {
    const keysToDelete = [];
    globalCache.cache.forEach((_, key) => {
      if (pattern.test(key)) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => globalCache.delete(key));
    console.log(`🗑️ Invalidated ${keysToDelete.length} cache entries matching pattern`);
  }
};

export { globalCache };
export default globalCache;
