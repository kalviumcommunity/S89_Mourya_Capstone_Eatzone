import { useContext } from 'react';
import './FoodItem.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import { getImageUrl, handleImageError } from '../../utils/imageUtils'
import { formatINR } from '../../utils/currencyUtils';

const FoodItem = ({id,name,price,description,image,originalPrice,discountPercentage,isOnSale,discountLabel,isPopular,isFeatured,tags}) => {
    //const [itemCount, setItemCount] = useState(0);
    const {cartItems,addToCart,removeFromCart,url} = useContext(StoreContext);

    // Get proper image URL using utility function
    const imageUrl = getImageUrl(image, url);

    return (
        <div className='food-item'>
            <div className="food-item-img-container">
                <img
                    className='food-item-image'
                    src={imageUrl}
                    alt={name}
                    onError={(e) => handleImageError(e, image)}
                />

                {/* Discount Badge */}
                {isOnSale && discountPercentage > 0 && (
                    <div className={`discount-badge ${discountPercentage >= 25 ? 'mega-deal' : ''}`}>
                        {discountLabel || `${discountPercentage}% OFF`}
                    </div>
                )}

                {/* Popular/Featured Badges */}
                {(isPopular || isFeatured) && (
                    <div className="item-badges">
                        {isPopular && <span className="badge popular">🔥 Popular</span>}
                        {isFeatured && <span className="badge featured">⭐ Featured</span>}
                    </div>
                )}

                {!cartItems[id]
                    ?(<img
                        className='add'
                        onClick={() => addToCart(id)}
                        src={assets.add_icon_white}
                        alt="Add to cart"
                    />
                ) : (
                    <div className='food-item-counter'>
                        <img
                            onClick={() => removeFromCart(id)}
                            src={assets.remove_icon_red}
                            alt="Remove from cart"
                        />
                        <p>{cartItems[id]}</p>
                        <img
                            onClick={() => addToCart(id)}
                            src={assets.add_icon_green}
                            alt="Add more to cart"
                        />
                    </div>
                )}
            </div>
            <div className="food-item-info">
                <div className="food-item-name-rating">
                    <p>{name}</p>
                    <img src={assets.rating_stars} alt="" />
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