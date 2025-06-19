import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl, handleImageError } from '../../utils/imageUtils';
import './RestaurantCard.css';

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/restaurant/${restaurant._id}`);
  };

  return (
    <div className="restaurant-card" onClick={handleClick}>
      <div className="restaurant-image">
        <img
          src={getImageUrl(restaurant.image)}
          alt={restaurant.name}
          onError={handleImageError}
        />
        <div className="delivery-time">
          <span>{restaurant.deliveryTime}</span>
        </div>
      </div>
      
      <div className="restaurant-info">
        <h3 className="restaurant-name">{restaurant.name}</h3>
        <p className="restaurant-description">{restaurant.description}</p>
        
        <div className="restaurant-details">
          <div className="rating">
            <span className="rating-star">⭐</span>
            <span className="rating-value">{restaurant.rating}</span>
          </div>
          
          <div className="delivery-info">
            <span className="delivery-fee">
              {restaurant.deliveryFee === 0 ? 'Free Delivery' : `₹${restaurant.deliveryFee} delivery`}
            </span>
          </div>
        </div>
        
        {restaurant.cuisineTypes && restaurant.cuisineTypes.length > 0 && (
          <div className="cuisine-types">
            {restaurant.cuisineTypes.slice(0, 3).map((cuisine, index) => (
              <span key={index} className="cuisine-tag">
                {cuisine}
              </span>
            ))}
            {restaurant.cuisineTypes.length > 3 && (
              <span className="cuisine-tag more">+{restaurant.cuisineTypes.length - 3}</span>
            )}
          </div>
        )}
        
        {restaurant.minimumOrder > 0 && (
          <div className="minimum-order">
            <span>Min order: ₹{restaurant.minimumOrder}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantCard;
