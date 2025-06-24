import { useState } from 'react';
import './CategoryImage.css';

// Default category images from Cloudinary
const getDefaultCategoryImage = (categoryName) => {
    const defaultImages = {
        'Rolls': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/rolls.jpg',
        'Salad': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/salad.jpg',
        'Deserts': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/desserts.jpg',
        'Sandwich': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/sandwich.jpg',
        'Cake': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/cake.jpg',
        'Veg': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/veg.jpg',
        'Pizza': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/pizza.jpg',
        'Pasta': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/pasta.jpg',
        'Noodles': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/noodles.jpg',
        'Main Course': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/main-course.jpg',
        'Appetizer': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/appetizer.jpg',
        'Sushi': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/sushi.jpg',
        'default': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/default-food.jpg'
    };
    
    return defaultImages[categoryName] || defaultImages['default'];
};

// Helper function to get proper image URL
const getImageUrl = (imageUrl, baseUrl) => {
    if (!imageUrl) return null;
    
    // If it's already a full URL (Cloudinary), use it directly
    if (imageUrl.startsWith('http')) {
        return imageUrl;
    }
    
    // If it's a local file, construct the full URL
    return `${baseUrl}/images/${imageUrl}`;
};

const CategoryImage = ({ 
    image, 
    categoryName, 
    baseUrl, 
    className = '', 
    alt,
    onLoad,
    onError 
}) => {
    const [imageError, setImageError] = useState(false);
    const [loading, setLoading] = useState(true);

    const primaryImageUrl = getImageUrl(image, baseUrl);
    const fallbackImageUrl = getDefaultCategoryImage(categoryName);

    const handleImageLoad = () => {
        setLoading(false);
        setImageError(false);
        if (onLoad) onLoad();
    };

    const handleImageError = (e) => {
        console.log(`Failed to load image for ${categoryName}:`, image);
        setLoading(false);
        
        if (!imageError && primaryImageUrl !== fallbackImageUrl) {
            // First error - try fallback image
            setImageError(true);
            e.target.src = fallbackImageUrl;
        } else {
            // Fallback also failed - show placeholder
            e.target.style.display = 'none';
            if (onError) onError(e);
        }
    };

    const currentImageUrl = imageError ? fallbackImageUrl : (primaryImageUrl || fallbackImageUrl);

    return (
        <div className={`category-image-container ${className}`}>
            {loading && (
                <div className="image-loading">
                    <div className="loading-spinner"></div>
                </div>
            )}
            
            <img
                src={currentImageUrl}
                alt={alt || categoryName}
                className={`category-image ${loading ? 'loading' : ''}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{ display: loading ? 'none' : 'block' }}
            />
            
            {imageError && !loading && (
                <div className="image-fallback-indicator">
                    <span>📷</span>
                </div>
            )}
        </div>
    );
};

export default CategoryImage;
