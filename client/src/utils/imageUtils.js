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
    return getDefaultFoodImage(); // Use proper default fallback
  }

  // Convert to string if it's not already
  const imageStr = String(image);

  // Check if it's a Cloudinary URL
  if (imageStr.includes('cloudinary.com')) {
    return optimizeCloudinaryUrl(imageStr, options);
  }

  // Check if image is already a processed URL (from Vite imports or other CDNs)
  if (imageStr.startsWith('http') || imageStr.startsWith('/') || imageStr.startsWith('data:')) {
    // Already a valid URL (from static imports or full URLs)
    return imageStr;
  }

  // Check if it's a server uploaded image filename
  if (imageStr.includes('.png') || imageStr.includes('.jpg') || imageStr.includes('.jpeg')) {
    // Server uploaded image filename - construct server URL
    const cleanImagePath = imageStr.startsWith('/') ? imageStr.substring(1) : imageStr;
    return `${serverUrl}/images/${cleanImagePath}`;
  }

  // Fallback - treat as server image
  return `${serverUrl}/images/${imageStr}`;
};

/**
 * Get a reliable default food image
 * @returns {string} Default food image URL
 */
export const getDefaultFoodImage = () => {
  return 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/default-food.jpg';
};

/**
 * Optimize Cloudinary URL with transformations for better performance
 * @param {string} cloudinaryUrl - Original Cloudinary URL
 * @param {Object} options - Optimization options
 * @returns {string} Optimized Cloudinary URL
 */
export const optimizeCloudinaryUrl = (cloudinaryUrl, options = {}) => {
  const {
    width = 400,
    height = 300,
    quality = 'auto',
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
    return cloudinaryUrl; // Return original if can't parse
  }

  const [baseUrl, imagePath] = urlParts;

  // Build transformation string
  const transformations = [
    `w_${width}`,
    `h_${height}`,
    `c_${crop}`,
    `g_${gravity}`,
    `q_${quality}`,
    `f_${format}`,
    `fl_progressive`,
    `fl_immutable_cache`
  ].join(',');

  return `${baseUrl}/upload/${transformations}/${imagePath}`;
};

/**
 * Handle image loading errors with intelligent fallbacks
 */
export const handleImageError = (event) => {
  const img = event.target;
  const currentSrc = img.src;

  console.warn(`Failed to load image: ${currentSrc}`);

  // Prevent infinite error loops
  if (img.dataset.errorCount) {
    img.dataset.errorCount = String(parseInt(img.dataset.errorCount) + 1);
  } else {
    img.dataset.errorCount = '1';
  }

  // Stop after 2 attempts to prevent infinite loops
  if (parseInt(img.dataset.errorCount) > 2) {
    console.error('Too many image load failures, using final fallback');
    img.src = getDefaultFoodImage();
    return;
  }

  // First fallback: If it's a Cloudinary image that failed, try another Cloudinary image
  if (currentSrc.includes('cloudinary.com') && !img.dataset.cloudinaryFallback) {
    img.dataset.cloudinaryFallback = 'true';
    img.src = getDefaultFoodImage();
    return;
  }

  // Second fallback: If it's a server image that failed, try Cloudinary fallback
  if (currentSrc.includes('/images/') && !img.dataset.fallbackAttempted) {
    img.dataset.fallbackAttempted = 'true';
    img.src = getDefaultFoodImage();
    return;
  }

  // Final fallback: Use a reliable default food image
  if (!img.dataset.finalFallback) {
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
