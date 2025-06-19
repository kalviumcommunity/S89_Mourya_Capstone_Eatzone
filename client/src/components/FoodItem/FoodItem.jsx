import { useContext } from 'react';
import './FoodItem.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import { getImageUrl, handleImageError } from '../../utils/imageUtils'
import { formatINR } from '../../utils/currencyUtils';

const FoodItem = ({id,name,price,description,image}) => {
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
                <p className="food-item-price">{formatINR(price)}</p>
            </div>
        </div>
    );
};

export default FoodItem;