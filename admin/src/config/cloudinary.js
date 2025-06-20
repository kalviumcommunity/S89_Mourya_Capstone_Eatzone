// Cloudinary configuration for admin image uploads

// Cloudinary configuration
const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || 'your-api-key',
  uploadPreset: 'eatzone_admin' // This should be created in your Cloudinary dashboard
};

export { cloudinaryConfig };
export default cloudinaryConfig;
