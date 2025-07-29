/**
 * Centralized Cloudinary utility functions for EatZone Admin
 * Provides consistent image upload functionality across all admin components
 */

/**
 * Upload file to Cloudinary with optimized settings for fast loading
 * @param {File} file - The file to upload
 * @param {string} folder - Cloudinary folder path (default: 'eatzone')
 * @param {Object} options - Additional upload options
 * @returns {Promise<Object>} Upload result with success status and URL
 */
export const uploadToCloudinary = async (file, folder = 'eatzone', options = {}) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'eatzone_admin');

    if (folder) {
      formData.append('folder', folder);
    }

    // Add optimization parameters for faster loading
    if (options.tags) {
      formData.append('tags', Array.isArray(options.tags) ? options.tags.join(',') : options.tags);
    }

    // Add transformation for automatic optimization
    // Note: Don't send transformation via FormData as it causes "Invalid transformation component" errors
    // Transformations should be applied via URL parameters or upload preset settings

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dodxdudew/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const result = await response.json();
    
    // Return optimized URL for faster loading
    const optimizedUrl = result.secure_url.replace('/upload/', '/upload/f_auto,q_auto,w_800,h_600,c_fill/');
    
    return {
      success: true,
      url: result.secure_url, // Original URL for storage
      optimizedUrl: optimizedUrl, // Optimized URL for display
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get optimized Cloudinary URL for existing images
 * @param {string} imageUrl - Original Cloudinary URL
 * @param {Object} options - Optimization options
 * @returns {string} Optimized URL
 */
export const getOptimizedCloudinaryUrl = (imageUrl, options = {}) => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }

  const {
    width = 800,
    height = 600,
    quality = 'auto',
    format = 'auto',
    crop = 'fill'
  } = options;

  // Insert optimization parameters
  const optimizedUrl = imageUrl.replace(
    '/upload/',
    `/upload/f_${format},q_${quality},w_${width},h_${height},c_${crop}/`
  );

  return optimizedUrl;
};

/**
 * Upload configurations for different image types
 * Note: Transformations are applied via URL optimization, not during upload
 */
export const uploadConfigs = {
  food: {
    folder: 'eatzone/food',
    tags: ['food', 'menu']
  },
  restaurant: {
    folder: 'eatzone/restaurants',
    tags: ['restaurant', 'cover']
  },
  category: {
    folder: 'eatzone/categories',
    tags: ['category', 'icon']
  }
};

/**
 * Batch upload multiple images with progress tracking
 * @param {File[]} files - Array of files to upload
 * @param {string} type - Upload type (food, restaurant, category)
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object[]>} Array of upload results
 */
export const batchUploadToCloudinary = async (files, type = 'food', onProgress = null) => {
  const config = uploadConfigs[type] || uploadConfigs.food;
  const results = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: files.length,
        fileName: file.name,
        percentage: Math.round(((i + 1) / files.length) * 100)
      });
    }
    
    const result = await uploadToCloudinary(file, config.folder, {
      tags: config.tags
    });
    
    results.push({
      file: file.name,
      ...result
    });
  }
  
  return results;
};

/**
 * Preload critical images for faster app startup
 * @param {string[]} imageUrls - Array of image URLs to preload
 * @returns {Promise<void>}
 */
export const preloadImages = async (imageUrls) => {
  const preloadPromises = imageUrls.map(url => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => reject(new Error(`Failed to preload: ${url}`));
      img.src = getOptimizedCloudinaryUrl(url, { width: 400, height: 300 });
    });
  });

  try {
    await Promise.allSettled(preloadPromises);
    console.log('✅ Critical images preloaded successfully');
  } catch (error) {
    console.warn('⚠️ Some images failed to preload:', error);
  }
};

/**
 * Validate image file before upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export const validateImageFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    minWidth = 100,
    minHeight = 100
  } = options;

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type must be one of: ${allowedTypes.join(', ')}`
    };
  }

  return { valid: true };
};

export default {
  uploadToCloudinary,
  getOptimizedCloudinaryUrl,
  uploadConfigs,
  batchUploadToCloudinary,
  preloadImages,
  validateImageFile
};
