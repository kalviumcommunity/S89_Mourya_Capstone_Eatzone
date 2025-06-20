# Cloudinary Setup for Eatzone Admin

This document explains how to set up Cloudinary for image storage in the Eatzone admin application.

## Prerequisites

1. Create a free Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Get your Cloudinary credentials from the dashboard

## Setup Steps

### 1. Configure Environment Variables

Update the `.env` file in the admin folder with your Cloudinary credentials:

```env
VITE_CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
VITE_CLOUDINARY_API_KEY=your-actual-api-key
```

**Note**: API Secret is not needed for frontend uploads when using unsigned upload presets.

### 2. Create Upload Preset

1. Go to your Cloudinary dashboard
2. Navigate to Settings > Upload
3. Scroll down to "Upload presets"
4. Click "Add upload preset"
5. Set the following:
   - Preset name: `eatzone_admin`
   - Signing Mode: `Unsigned`
   - Folder: `eatzone` (optional)
   - Allowed formats: `jpg,png,jpeg,webp`
   - Max file size: `5000000` (5MB)
   - Image transformations: Enable auto optimization

### 3. How It Works

- **Admin Upload**: Images are uploaded directly from the admin interface to Cloudinary
- **Storage**: Images are stored in Cloudinary with organized folder structure:
  - `eatzone/food/` - Food item images
  - `eatzone/restaurants/` - Restaurant images
- **Database**: Only Cloudinary URLs are stored in MongoDB (not file paths)
- **Frontend**: Client applications access images directly from Cloudinary URLs

### 4. Features

- **Auto Optimization**: Images are automatically optimized for web delivery
- **Responsive Images**: Cloudinary provides responsive image transformations
- **CDN Delivery**: Fast global content delivery
- **Backup**: Images are safely stored in the cloud
- **Admin Only**: Only admin users can upload images

### 5. Usage

1. Select an image file in the admin interface
2. Click "Upload to Cloudinary" button
3. Wait for upload confirmation
4. Submit the form to save the Cloudinary URL to database

### 6. Fallback

The system maintains backward compatibility:
- Existing local images continue to work
- New uploads use Cloudinary
- Image utilities handle both local and Cloudinary URLs

## Security Notes

- Upload preset is configured for admin use only
- File size and format restrictions are enforced
- Images are organized in folders for better management
- API secrets are kept secure in environment variables
