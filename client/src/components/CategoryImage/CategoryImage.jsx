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
        console.log(`Primary URL was:`, primaryImageUrl);
        console.log(`Fallback URL is:`, fallbackImageUrl);
        setLoading(false);

        if (!imageError && primaryImageUrl !== fallbackImageUrl) {
            // First error - try fallback image
            console.log(`🔄 Trying fallback image for ${categoryName}`);
            setImageError(true);
            e.target.src = fallbackImageUrl;
        } else {
            // Fallback also failed - show placeholder with category initial
            console.log(`❌ Fallback also failed for ${categoryName}, showing placeholder`);
            setImageError(true);
            if (onError) onError(e);
        }
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
            <OptimizedImage
                src={primaryImageUrl}
                alt={alt || categoryName}
                width={80}
                height={80}
                quality="auto"
                lazy={true}
                className="category-image"
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{
                    borderRadius: '50%'
                }}
            />
        </div>
    );
};

export default CategoryImage;
