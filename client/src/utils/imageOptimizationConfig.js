/**
 * Comprehensive Image Optimization Configuration
 * Ensures all images load within seconds across the application
 */

// Global image optimization settings
export const IMAGE_OPTIMIZATION_CONFIG = {
  // Performance targets
  TARGET_LOAD_TIME: 3000, // 3 seconds maximum
  CRITICAL_LOAD_TIME: 1000, // 1 second for critical images
  
  // Cache settings
  CACHE_SIZE: 100,
  PRELOAD_BATCH_SIZE: 10,
  
  // Intersection Observer settings
  ROOT_MARGIN: '500px', // Start loading 500px before viewport
  THRESHOLD: 0.01,
  
  // Cloudinary optimization settings
  CLOUDINARY: {
    QUALITY: 'auto:good',
    FORMAT: 'auto',
    FLAGS: ['progressive', 'immutable_cache', 'awebp'],
    DPR: 'auto'
  },
  
  // Image type specific settings
  RESTAURANT: {
    width: 320,
    height: 200,
    lazy: false, // Always eager load
    priority: 'high'
  },
  
  FOOD: {
    width: 280,
    height: 200,
    lazy: false, // Always eager load
    priority: 'high'
  },
  
  CATEGORY: {
    width: 80,
    height: 80,
    lazy: false, // Always eager load
    priority: 'high'
  },
  
  // Transition settings for different priorities
  TRANSITIONS: {
    high: '0.1s ease-in-out',
    medium: '0.2s ease-in-out',
    low: '0.3s ease-in-out'
  }
};

/**
 * Get optimized Cloudinary URL with all performance enhancements
 * @param {string} url - Original image URL
 * @param {Object} options - Optimization options
 * @returns {string} Optimized URL
 */
export const getOptimizedCloudinaryURL = (url, options = {}) => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const {
    width = 400,
    height = 300,
    quality = IMAGE_OPTIMIZATION_CONFIG.CLOUDINARY.QUALITY,
    format = IMAGE_OPTIMIZATION_CONFIG.CLOUDINARY.FORMAT,
    crop = 'fill',
    gravity = 'auto'
  } = options;

  // Build transformation string with all optimizations
  const transformations = [
    `w_${width}`,
    `h_${height}`,
    `c_${crop}`,
    `g_${gravity}`,
    `q_${quality}`,
    `f_${format}`,
    `fl_progressive`,
    `fl_immutable_cache`,
    `fl_awebp`,
    `dpr_auto`
  ].join(',');

  // Insert transformations into URL
  return url.replace('/upload/', `/upload/${transformations}/`);
};

/**
 * Get image configuration based on type
 * @param {string} type - Image type (restaurant, food, category)
 * @returns {Object} Configuration object
 */
export const getImageConfig = (type) => {
  const config = IMAGE_OPTIMIZATION_CONFIG[type.toUpperCase()];
  if (!config) {
    console.warn(`Unknown image type: ${type}, using default config`);
    return IMAGE_OPTIMIZATION_CONFIG.FOOD;
  }
  return config;
};

/**
 * Create optimized image URL for specific type
 * @param {string} url - Original image URL
 * @param {string} type - Image type
 * @returns {string} Optimized URL
 */
export const createOptimizedImageURL = (url, type) => {
  if (!url) return null;
  
  const config = getImageConfig(type);
  
  if (url.includes('cloudinary.com')) {
    return getOptimizedCloudinaryURL(url, {
      width: config.width,
      height: config.height,
      quality: IMAGE_OPTIMIZATION_CONFIG.CLOUDINARY.QUALITY,
      format: IMAGE_OPTIMIZATION_CONFIG.CLOUDINARY.FORMAT
    });
  }
  
  return url;
};

/**
 * Get all image URLs from data for preloading
 * @param {Object} data - Application data
 * @returns {Object} Categorized image URLs
 */
export const extractImageURLsForPreloading = (data) => {
  const imageURLs = {
    restaurants: [],
    food: [],
    categories: []
  };

  // Extract restaurant images
  if (data.restaurants) {
    imageURLs.restaurants = data.restaurants
      .filter(item => item.image)
      .map(item => createOptimizedImageURL(item.image, 'restaurant'))
      .filter(Boolean);
  }

  // Extract food images
  if (data.food) {
    imageURLs.food = data.food
      .filter(item => item.image)
      .map(item => createOptimizedImageURL(item.image, 'food'))
      .filter(Boolean);
  }

  // Extract category images
  if (data.categories) {
    imageURLs.categories = data.categories
      .filter(item => item.image)
      .map(item => createOptimizedImageURL(item.image, 'category'))
      .filter(Boolean);
  }

  return imageURLs;
};

/**
 * Priority order for image loading
 */
export const IMAGE_LOAD_PRIORITY = [
  'categories', // Load first - small and critical for navigation
  'restaurants', // Load second - important for main page
  'food' // Load third - important but can be slightly delayed
];

/**
 * Get CSS transition based on image priority
 * @param {string} className - CSS class name
 * @returns {string} CSS transition value
 */
export const getTransitionForPriority = (className) => {
  if (className.includes('priority-load') || className.includes('category') || className.includes('restaurant')) {
    return IMAGE_OPTIMIZATION_CONFIG.TRANSITIONS.high;
  }
  if (className.includes('food')) {
    return IMAGE_OPTIMIZATION_CONFIG.TRANSITIONS.medium;
  }
  return IMAGE_OPTIMIZATION_CONFIG.TRANSITIONS.low;
};

/**
 * Check if image should be lazy loaded
 * @param {string} type - Image type
 * @returns {boolean} Whether to lazy load
 */
export const shouldLazyLoad = (type) => {
  const config = getImageConfig(type);
  return config.lazy !== false; // Default to lazy unless explicitly disabled
};

/**
 * Performance optimization recommendations
 */
export const PERFORMANCE_RECOMMENDATIONS = {
  DISABLE_LAZY_LOADING: 'Disable lazy loading for above-the-fold images',
  OPTIMIZE_DIMENSIONS: 'Use exact display dimensions for Cloudinary transformations',
  PRELOAD_CRITICAL: 'Preload critical images immediately on app start',
  BATCH_PRELOADING: 'Use batched preloading to avoid overwhelming the browser',
  MONITOR_PERFORMANCE: 'Monitor image load times and optimize accordingly',
  USE_WEBP: 'Enable automatic WebP format for supported browsers',
  PROGRESSIVE_JPEG: 'Use progressive JPEG for better perceived performance',
  CACHE_AGGRESSIVELY: 'Cache images aggressively for instant subsequent loads'
};

export default IMAGE_OPTIMIZATION_CONFIG;
