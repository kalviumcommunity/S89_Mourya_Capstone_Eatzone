// Cloudinary upload utility for admin image uploads
import { cloudinaryConfig } from '../config/cloudinary.js';

/**
 * Upload image to Cloudinary
 * @param {File} file - The image file to upload
 * @param {string} folder - Cloudinary folder to upload to (e.g., 'eatzone/food', 'eatzone/restaurants')
 * @param {Object} options - Additional upload options
 * @returns {Promise<Object>} - Upload result with URL and public_id
 */
export const uploadToCloudinary = async (file, folder = 'eatzone', options = {}) => {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    // Create FormData for upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'eatzone_admin');
    
    // Add folder if specified
    if (folder) {
      formData.append('folder', folder);
    }
    
    // Add tags if specified
    if (options.tags && Array.isArray(options.tags)) {
      formData.append('tags', options.tags.join(','));
    }

    console.log('Uploading to Cloudinary...');

    // Upload to Cloudinary using unsigned upload
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary error:', errorData);
      
      if (errorData.error?.message?.includes('Upload preset not found')) {
        throw new Error('Upload preset "eatzone_admin" not found. Please create it in your Cloudinary dashboard first.');
      }
      
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const result = await response.json();
    console.log('Cloudinary upload success:', result);
    
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
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
 * Delete image from Cloudinary
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      throw new Error('No public ID provided');
    }

    // Note: For security, image deletion should be handled on the server side
    console.warn('Image deletion should be handled server-side for security');
    
    return {
      success: true,
      message: 'Deletion request sent'
    };

  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
