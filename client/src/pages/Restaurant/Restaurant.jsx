import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../../components/FoodItem/FoodItem';
import { getImageUrl, handleImageError } from '../../utils/imageUtils';
import './Restaurant.css';

const Restaurant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { url } = useContext(StoreContext);
  
  const [restaurant, setRestaurant] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchRestaurantData();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchFoodItems();
    }
  }, [id, selectedCategory]);

  const fetchRestaurantData = async () => {
    try {
      const [restaurantRes, categoriesRes] = await Promise.all([
        fetch(`${url}/api/restaurant/${id}`),
        fetch(`${url}/api/restaurant/${id}/categories`)
      ]);

      const restaurantData = await restaurantRes.json();
      const categoriesData = await categoriesRes.json();

      if (restaurantData.success) {
        setRestaurant(restaurantData.data);
      } else {
        setError('Restaurant not found');
      }

      if (categoriesData.success) {
        setCategories(['All', ...categoriesData.data]);
      }
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
      setError('Failed to load restaurant');
    }
  };

  const fetchFoodItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${url}/api/restaurant/${id}/food-items${selectedCategory !== 'All' ? `?category=${selectedCategory}` : ''}`
      );
      const data = await response.json();

      if (data.success) {
        setFoodItems(data.data);
      } else {
        setError('Failed to load food items');
      }
    } catch (error) {
      console.error('Error fetching food items:', error);
      setError('Failed to load food items');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="restaurant-error-page">
        <div className="error-content">
          <h2>😕 {error}</h2>
          <button onClick={() => navigate('/')} className="back-home-btn">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="restaurant-loading-page">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading restaurant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurant-page">
      {/* Restaurant Header */}
      <div className="restaurant-header">
        <div className="restaurant-banner">
          <img
            src={getImageUrl(restaurant.image)}
            alt={restaurant.name}
            onError={handleImageError}
          />
          <div className="restaurant-overlay">
            <div className="restaurant-info">
              <h1 className="restaurant-title">{restaurant.name}</h1>
              <p className="restaurant-desc">{restaurant.description}</p>
              
              <div className="restaurant-meta">
                <div className="meta-item">
                  <span className="meta-icon">⭐</span>
                  <span>{restaurant.rating}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">🕒</span>
                  <span>{restaurant.deliveryTime}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">🚚</span>
                  <span>{restaurant.deliveryFee === 0 ? 'Free Delivery' : `₹${restaurant.deliveryFee}`}</span>
                </div>
                {restaurant.minimumOrder > 0 && (
                  <div className="meta-item">
                    <span className="meta-icon">💰</span>
                    <span>Min ₹{restaurant.minimumOrder}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      {categories.length > 1 && (
        <div className="category-filter">
          <div className="category-container">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Food Items */}
      <div className="restaurant-menu">
        <div className="menu-container">
          <h2 className="menu-title">
            {selectedCategory === 'All' ? 'All Items' : selectedCategory}
            <span className="item-count">({foodItems.length} items)</span>
          </h2>

          {loading ? (
            <div className="menu-loading">
              <div className="loading-grid">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="food-item-skeleton">
                    <div className="skeleton-image"></div>
                    <div className="skeleton-content">
                      <div className="skeleton-title"></div>
                      <div className="skeleton-description"></div>
                      <div className="skeleton-price"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : foodItems.length === 0 ? (
            <div className="no-items">
              <p>🍽️ No items available in this category</p>
              <p>Try selecting a different category</p>
            </div>
          ) : (
            <div className="food-items-grid">
              {foodItems.map((item) => (
                <FoodItem
                  key={item._id}
                  id={item._id}
                  name={item.name}
                  description={item.description}
                  price={item.price}
                  image={item.image}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Restaurant;
