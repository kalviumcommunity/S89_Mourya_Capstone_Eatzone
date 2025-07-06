/**
 * Utility function to construct proper image URLs for food items
 * Handles both static assets and server-uploaded images
 */

/**
 * Get optimized image URL with Cloudinary transformations for better performance
 * @param {string} image - Image path or URL
 * @param {string} serverUrl - Server base URL
 * @param {Object} options - Optimization options
 * @returns {string} Optimized image URL
 */
export const getImageUrl = (image, serverUrl = import.meta.env.VITE_API_BASE_URL || "https://eatzone.onrender.com", options = {}) => {
  // Handle null or undefined images
  if (!image) {
    console.log('🔍 getImageUrl: No image provided, using default');
    return getDefaultFoodImage();
  }

  // Convert to string if it's not already
  const imageStr = String(image).trim();

  // Additional safety check
  if (!imageStr) {
    console.log('🔍 getImageUrl: Empty image string, using default');
    return getDefaultFoodImage();
  }

  // Check if it's already a complete URL (Cloudinary, external URLs, etc.)
  if (imageStr.startsWith('http://') || imageStr.startsWith('https://')) {
    // If it's a Cloudinary URL, always apply aggressive optimizations for fastest loading
    if (imageStr.includes('cloudinary.com')) {
      // Apply aggressive optimizations for fastest loading
      const defaultOptions = {
        format: 'auto',
        quality: 'auto:good', // Better quality than 'auto' but still optimized
        width: options.width || 400,
        height: options.height || 300,
        crop: 'fill',
        gravity: 'auto',
        ...options
      };
      return optimizeCloudinaryUrl(imageStr, defaultOptions);
    }
    // Return other external URLs as-is
    return imageStr;
  }

  // Check if it's a data URL
  if (imageStr.startsWith('data:')) {
    return imageStr;
  }

  // Check if it's an absolute path starting with /
  if (imageStr.startsWith('/')) {
    return imageStr;
  }

  // Handle server uploaded image filename - construct server URL
  if (imageStr.includes('.png') || imageStr.includes('.jpg') || imageStr.includes('.jpeg') || imageStr.includes('.webp') || imageStr.includes('.gif')) {
    const cleanImagePath = imageStr.startsWith('/') ? imageStr.substring(1) : imageStr;
    const fullUrl = `${serverUrl}/images/${cleanImagePath}`;
    return fullUrl;
  }

  // If none of the above, return default
  console.warn(`Unknown image format: ${imageStr}, using default fallback`);
  return getDefaultFoodImage();
};

/**
 * Get a reliable default food image
 * @returns {string} Default food image URL
 */
export const getDefaultFoodImage = () => {
  return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop&crop=center&auto=format&q=80';
};

/**
 * Optimize Cloudinary URL with transformations for better performance
 * @param {string} cloudinaryUrl - Original Cloudinary URL
 * @param {Object} options - Optimization options
 * @returns {string} Optimized Cloudinary URL
 */
export const optimizeCloudinaryUrl = (cloudinaryUrl, options = {}) => {
  // Safety check
  if (!cloudinaryUrl || typeof cloudinaryUrl !== 'string') {
    console.error('❌ optimizeCloudinaryUrl: Invalid URL provided', cloudinaryUrl);
    return cloudinaryUrl || '';
  }

  const {
    width = 400,
    height = 300,
    quality = 'auto:good',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto'
  } = options;

  // If it's already optimized, return as-is
  if (cloudinaryUrl.includes('/w_') || cloudinaryUrl.includes('/q_')) {
    return cloudinaryUrl;
  }

  // Extract the base URL and image path
  const urlParts = cloudinaryUrl.split('/upload/');
  if (urlParts.length !== 2) {
    console.log('🔍 optimizeCloudinaryUrl: Cannot parse URL, returning original', cloudinaryUrl);
    return cloudinaryUrl; // Return original if can't parse
  }

  const [baseUrl, imagePath] = urlParts;

  // Build aggressive transformation string for fastest loading
  const transformations = [
    `w_${width}`,
    `h_${height}`,
    `c_${crop}`,
    `g_${gravity}`,
    `q_${quality}`,
    `f_${format}`,
    `fl_progressive`, // Progressive JPEG for faster perceived loading
    `fl_immutable_cache`, // Enable browser caching
    `fl_awebp`, // Auto WebP format when supported
    `dpr_auto` // Auto device pixel ratio
  ].join(',');

  return `${baseUrl}/upload/${transformations}/${imagePath}`;
};

/**
 * Handle image loading errors with intelligent fallbacks
 */
export const handleImageError = (event) => {
  const img = event.target;
  const currentSrc = img.src;

  console.warn(`❌ Failed to load image: ${currentSrc}`);

  // Prevent infinite error loops
  if (img.dataset.errorCount) {
    img.dataset.errorCount = String(parseInt(img.dataset.errorCount) + 1);
  } else {
    img.dataset.errorCount = '1';
  }

  const errorCount = parseInt(img.dataset.errorCount);
  console.log(`Image error attempt ${errorCount} for: ${currentSrc}`);

  // Stop after 3 attempts to prevent infinite loops
  if (errorCount > 3) {
    console.error('❌ Too many image load failures, using final fallback');
    img.src = getDefaultFoodImage();
    return;
  }

  // First fallback: If it's a Cloudinary image that failed, try default Cloudinary image
  if (currentSrc.includes('cloudinary.com') && !img.dataset.cloudinaryFallback) {
    console.log('🔄 Cloudinary image failed, trying default fallback');
    img.dataset.cloudinaryFallback = 'true';
    img.src = getDefaultFoodImage();
    return;
  }

  // Second fallback: If it's a server image that failed, try Cloudinary fallback
  if (currentSrc.includes('/images/') && !img.dataset.fallbackAttempted) {
    console.log('🔄 Server image failed, trying Cloudinary fallback');
    img.dataset.fallbackAttempted = 'true';
    img.src = getDefaultFoodImage();
    return;
  }

  // Final fallback: Use a reliable default food image
  if (!img.dataset.finalFallback) {
    console.log('🔄 Using final fallback image');
    img.dataset.finalFallback = 'true';
    img.src = getDefaultFoodImage();
  }
};

/**
 * Preload critical images for better performance
 */
export const preloadCriticalImages = async () => {
  // Import the preload function from imageCache
  const { preloadCriticalImages: preloadFromCache } = await import('./imageCache.js');
  preloadFromCache();
};
