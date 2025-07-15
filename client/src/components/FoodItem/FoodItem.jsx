import { useContext, useState } from 'react';
import './FoodItem.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import { formatINR } from '../../utils/currencyUtils';
import OptimizedImage from '../OptimizedImage/OptimizedImage';


const FoodItem = ({id,name,price,description,image,originalPrice,discountPercentage,isOnSale,discountLabel,isPopular,isFeatured,tags}) => {
    const [imageError, setImageError] = useState(false);
    const {cartItems,addToCart,removeFromCart} = useContext(StoreContext);







    return (
        <div className='food-item'>
            <div className="food-item-img-container">
                <OptimizedImage
                    src={image}
                    alt={name}
                    width={280}
                    height={200}
                    quality="auto:good"
                    lazy={false} // Don't lazy load food items for immediate display
                    className="food-item-image priority-load"
                    onLoad={() => {
                        console.log(`✅ Food item image loaded: ${name}`);
                        setImageError(false);
                    }}
                    onError={(e) => {
                        console.error(`❌ Food item image failed: ${name}`, e);
                        setImageError(true);
                    }}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center'
                    }}
                />

                {/* Professional Discount Badge */}
                {isOnSale && discountPercentage > 0 && (
                    <div className={`discount-badge ${discountPercentage >= 25 ? 'mega-deal' : ''}`}>
                        <span>{discountLabel || `${discountPercentage}% OFF`}</span>
                    </div>
                )}

                {/* Professional Item Badges */}
                {(isPopular || isFeatured) && (
                    <div className="item-badges">
                        {isPopular && <span className="badge popular">Popular</span>}
                        {isFeatured && <span className="badge featured">Featured</span>}
                    </div>
                )}

                {/* Add/Remove buttons - always show when item is available */}
                {!imageError && (() => {
                    const itemCount = cartItems[id] || 0;

                    if (itemCount === 0) {
                        return (
                            <div
                                className='add-button'
                                onClick={() => addToCart(id)}
                            >
                                <span className='add-icon'>+</span>
                            </div>
                        );
                    } else {
                        return (
                            <div className='food-item-counter'>
                                <div
                                    className='counter-button remove-button'
                                    onClick={() => removeFromCart(id)}
                                >
                                    <span>−</span>
                                </div>
                                <span className='counter-number'>{itemCount}</span>
                                <div
                                    className='counter-button add-button-small'
                                    onClick={() => addToCart(id)}
                                >
                                    <span>+</span>
                                </div>
                            </div>
                        );
                    }
                })()}

                {/* Show unavailable message when image fails to load */}
                {imageError && (
                    <div className="item-unavailable-overlay">
                        <span className="unavailable-text">Not Available</span>
                    </div>
                )}
            </div>
            <div className="food-item-info">
                <div className="food-item-name-rating">
                    <p>{name}</p>
                    <img src={assets.rating_starts} alt="" />
                </div>
                <p className="food-item-desc">{description}</p>

                {/* Tags */}
                {tags && tags.length > 0 && (
                    <div className="food-item-tags">
                        {tags.map((tag, index) => (
                            <span key={index} className="tag">{tag}</span>
                        ))}
                    </div>
                )}

                {/* Price with discount */}
                <div className="food-item-price-container">
                    {isOnSale && originalPrice ? (
                        <div className="price-with-discount">
                            <div className="price-row">
                                <div className="price-info">
                                    <span className="original-price">{formatINR(originalPrice)}</span>
                                    <span className="discounted-price">{formatINR(price)}</span>
                                </div>
                                <span className="savings">You Save {formatINR(originalPrice - price)}!</span>
                            </div>
                        </div>
                    ) : (
                        <p className="food-item-price">{formatINR(price)}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FoodItem;