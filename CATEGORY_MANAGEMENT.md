# Food Category Management System

## Overview

The EatZone application now includes a comprehensive food category management system that allows administrators to dynamically manage food categories. This system replaces the previous hardcoded categories with a flexible, database-driven approach.

## Features

### Admin Features
- **Add New Categories**: Create new food categories with names, descriptions, and images
- **Edit Categories**: Update existing category information including names, descriptions, images, and display order
- **Delete Categories**: Remove categories that are no longer needed
- **Image Management**: Upload category images via Cloudinary integration
- **Display Order**: Control the order in which categories appear
- **Active/Inactive Status**: Enable or disable categories without deleting them

### Client Features
- **Dynamic Category Display**: The "Explore our menu" section automatically loads categories from the database
- **Real-time Updates**: Category changes in admin panel are immediately reflected on the client side
- **Fallback Images**: Graceful handling of missing or broken category images

## Technical Implementation

### Backend Components

#### 1. Category Model (`server/models/categoryModel.js`)
```javascript
{
  name: String (required, unique),
  description: String,
  image: String (required),
  isActive: Boolean (default: true),
  order: Number (default: 0),
  adminId: ObjectId (ref: 'admin'),
  firebaseUID: String
}
```

#### 2. Category Controller (`server/controllers/categoryController.js`)
- `addCategory`: Create new categories
- `listCategories`: Get active categories (for client)
- `listAllCategories`: Get all categories (for admin)
- `updateCategory`: Update existing categories
- `removeCategory`: Delete categories

#### 3. Category Routes (`server/routes/categoryRoute.js`)
- `POST /api/category/add`: Add new category
- `GET /api/category/list`: Get active categories
- `GET /api/category/list-all`: Get all categories
- `POST /api/category/update`: Update category
- `POST /api/category/remove`: Delete category

### Frontend Components

#### 1. Admin Category Management (`admin/src/pages/Categories/Categories.jsx`)
- Full CRUD interface for category management
- Image upload with Cloudinary integration
- Form validation and error handling
- Responsive design with modern UI

#### 2. Dynamic Category Dropdowns
- **Add Food Form**: Uses dynamic categories from database
- **Edit Food Form**: Updates to use dynamic categories
- **Category Filter**: Filters food items by dynamic categories

#### 3. Client Category Display (`client/src/components/Navbar/ExploreMenu/ExploreMenu.jsx`)
- Loads categories from API instead of hardcoded list
- Displays category images from Cloudinary or local storage
- Handles loading states and error scenarios

## Setup Instructions

### 1. Database Setup
Run the default categories script to populate initial categories:
```bash
cd server
npm run create-default-categories
```

### 2. Admin Access
1. Navigate to the admin panel
2. Go to "Food Categories" in the sidebar
3. Start managing categories with the intuitive interface

### 3. Environment Variables
Ensure these environment variables are set:
```
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## API Endpoints

### Public Endpoints (Client)
- `GET /api/category/list` - Get active categories for client display

### Admin Endpoints
- `POST /api/category/add` - Add new category (with image upload)
- `GET /api/category/list-all` - Get all categories (including inactive)
- `POST /api/category/update` - Update existing category
- `POST /api/category/remove` - Delete category

## Usage Examples

### Adding a New Category
1. Go to Admin Panel → Food Categories
2. Click "Add New Category"
3. Fill in category details:
   - Name (required)
   - Description (optional)
   - Upload image (required)
   - Set display order
   - Set active status
4. Click "Add Category"

### Editing a Category
1. Find the category in the categories grid
2. Click "Edit" button
3. Modify the desired fields
4. Upload new image if needed
5. Click "Update Category"

### Category Impact
When you add, edit, or delete categories:
- **Admin Panel**: All dropdowns update immediately
- **Client Side**: "Explore our menu" section updates automatically
- **Food Items**: Existing food items maintain their category associations

## Migration from Hardcoded Categories

The system automatically handles the transition from hardcoded to dynamic categories:

1. **Backward Compatibility**: Existing food items with hardcoded categories continue to work
2. **Default Categories**: Script creates default categories matching the previous hardcoded list
3. **Gradual Migration**: Categories can be updated individually through the admin interface

## Best Practices

### Category Management
- Use descriptive names that customers will understand
- Add meaningful descriptions to help with SEO and user experience
- Use high-quality images (recommended: 400x400px)
- Set appropriate display orders for logical category arrangement

### Image Guidelines
- **Format**: JPG or PNG
- **Size**: Maximum 5MB
- **Dimensions**: 400x400px recommended for consistency
- **Quality**: High-resolution images for better user experience

### Performance Considerations
- Categories are cached on the client side
- Images are served via Cloudinary CDN for optimal performance
- Database queries are optimized with proper indexing

## Troubleshooting

### Common Issues

1. **Categories not showing on client**
   - Check if categories are marked as active
   - Verify API endpoint is accessible
   - Check browser console for errors

2. **Image upload failures**
   - Verify Cloudinary credentials
   - Check file size (max 5MB)
   - Ensure file is a valid image format

3. **Category dropdown empty in admin**
   - Run the default categories script
   - Check database connection
   - Verify API endpoints are working

### Support
For technical support or feature requests related to category management, please refer to the main project documentation or contact the development team.
