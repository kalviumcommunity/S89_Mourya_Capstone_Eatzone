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
    return getDefaultFoodImage();
  }

  // Convert to string if it's not already
  const imageStr = String(image).trim();

  // Check if it's already a complete URL (Cloudinary, external URLs, etc.)
  if (imageStr.startsWith('http://') || imageStr.startsWith('https://')) {
    // If it's a Cloudinary URL, always apply basic optimizations for faster loading
    if (imageStr.includes('cloudinary.com')) {
      // Apply default optimizations if no specific options provided
      const defaultOptions = {
        format: 'auto',
        quality: 'auto',
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
    console.log(`🔗 Constructed server image URL: ${fullUrl}`);
    console.log(`🔧 Server URL: ${serverUrl}`);
    console.log(`🖼️ Clean image path: ${cleanImagePath}`);

    // For debugging: test if the URL is accessible
    fetch(fullUrl, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          console.log(`✅ Image accessible: ${fullUrl}`);
        } else {
          console.error(`❌ Image not accessible: ${fullUrl} - Status: ${response.status}`);
        }
      })
      .catch(error => {
        console.error(`❌ Image fetch error: ${fullUrl}`, error);
      });

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
