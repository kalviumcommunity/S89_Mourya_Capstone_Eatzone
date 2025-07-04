import { useState } from 'react';
import './CategoryImage.css';
import { getCategoryImageUrl, getCategoryFallbackImage } from '../../utils/categoryUtils';
import OptimizedImage from '../OptimizedImage/OptimizedImage';

// Use utility functions for better consistency

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

    const primaryImageUrl = getCategoryImageUrl(image, baseUrl);
    const fallbackImageUrl = getCategoryFallbackImage(categoryName);

    const handleImageLoad = () => {
        setLoading(false);
        setImageError(false);
        if (onLoad) onLoad();
    };

    const handleImageError = (e) => {
        console.log(`❌ Failed to load image for ${categoryName}:`, image);
        setLoading(false);
        setImageError(true);
        if (onError) onError(e);
    };

    const currentImageUrl = imageError ? fallbackImageUrl : (primaryImageUrl || fallbackImageUrl);

    // Create placeholder with category initial
    const getPlaceholderContent = () => {
        const initial = categoryName ? categoryName.charAt(0).toUpperCase() : '?';
        return (
            <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #ff6b35, #ff8c42)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                fontWeight: 'bold',
                borderRadius: '50%'
            }}>
                {initial}
            </div>
        );
    };

    return (
        <div className={`category-image-container ${className}`}>
            {imageError ? (
                getPlaceholderContent()
            ) : (
                <OptimizedImage
                    src={currentImageUrl}
                    alt={alt || categoryName}
                    width={80}
                    height={80}
                    quality="auto"
                    lazy={false} // Don't lazy load category images for faster initial load
                    className="category-image"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    style={{
                        borderRadius: '50%'
                    }}
                />
            )}
        </div>
    );
};

export default CategoryImage;
