// Utility functions for category management

/**
 * Trigger a category refresh event across the application
 */
export const triggerCategoryRefresh = () => {
    // Dispatch custom event for same-origin scenarios
    window.dispatchEvent(new CustomEvent('categoryUpdated', {
        detail: { timestamp: Date.now() }
    }));
    
    // Also try to notify parent window if in iframe
    try {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({ 
                type: 'CATEGORY_UPDATED', 
                timestamp: Date.now() 
            }, '*');
        }
    } catch (error) {
        console.log("Could not notify parent window:", error);
    }
    
    console.log("🔄 Category refresh event triggered");
};

/**
 * Get the appropriate image URL for a category
 */
export const getCategoryImageUrl = (image, baseUrl) => {
    if (!image) return null;
    
    // If it's already a full URL (Cloudinary, Unsplash, etc.), use it directly
    if (image.startsWith('http')) {
        return image;
    }
    
    // If it's a local file, construct the full URL
    return `${baseUrl}/images/${image}`;
};

/**
 * Get fallback image for a category
 */
export const getCategoryFallbackImage = (categoryName) => {
    const fallbackImages = {
        'Rolls': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/rolls.jpg',
        'Salad': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/salad.jpg',
        'Desserts': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/desserts.jpg',
        'Deserts': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/desserts.jpg',
        'Sandwich': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/sandwich.jpg',
        'Sandwiches & Wraps': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/sandwich.jpg',
        'Cake': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/cake.jpg',
        'Veg': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/veg.jpg',
        'Pizza': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/pizza.jpg',
        'Pizzas': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/pizza.jpg',
        'Pasta': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/pasta.jpg',
        'Noodles': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/noodles.jpg',
        'Noodles & Pasta': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/noodles.jpg',
        'Main Course': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/main-course.jpg',
        'Appetizer': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/appetizer.jpg',
        'Sushi': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/sushi.jpg',
        'Burgers': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop',
        'Biryani & Rice': 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400&h=400&fit=crop',
        'Beverages': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop',
        'Salads & Healthy': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop',
        'default': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/default-food.jpg'
    };
    
    // Try exact match first, then partial match, then default
    return fallbackImages[categoryName] || 
           Object.keys(fallbackImages).find(key => 
               categoryName.toLowerCase().includes(key.toLowerCase()) ||
               key.toLowerCase().includes(categoryName.toLowerCase())
           ) && fallbackImages[Object.keys(fallbackImages).find(key => 
               categoryName.toLowerCase().includes(key.toLowerCase()) ||
               key.toLowerCase().includes(categoryName.toLowerCase())
           )] ||
           fallbackImages['default'];
};

/**
 * Validate if an image URL is accessible
 */
export const validateImageUrl = (url) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
        
        // Timeout after 5 seconds
        setTimeout(() => resolve(false), 5000);
    });
};
