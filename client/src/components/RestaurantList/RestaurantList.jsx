import React, { useState, useEffect, useContext } from 'react';
import RestaurantCard from '../RestaurantCard/RestaurantCard';
import { StoreContext } from '../../context/StoreContext';
import './RestaurantList.css';

const RestaurantList = () => {
  const { url } = useContext(StoreContext);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${url}/api/restaurant/list`);
      const data = await response.json();

      if (data.success) {
        setRestaurants(data.data);
      } else {
        setError(data.message || 'Failed to fetch restaurants');
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setError('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="restaurant-list-container">
        <div className="restaurant-list-header">
          <div className="header-icon">🍽️</div>
          <h2>Popular Restaurants </h2>
          <p className="restaurant-subtitle">Loading amazing dining experiences...</p>
        </div>
        <div className="restaurant-loading">
          <div className="loading-grid">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="restaurant-card-skeleton">
                <div className="skeleton-image"></div>
                <div className="skeleton-content">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-description"></div>
                  <div className="skeleton-details"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="restaurant-list-container">
        <h2>Popular Restaurants </h2>
        <div className="restaurant-error">
          <p>😕 {error}</p>
          <button onClick={fetchRestaurants} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="restaurant-list-container">
        <h2>Popular Restaurants</h2>
        <div className="no-restaurants">
          <p>🍽️ No restaurants or hotels available at the moment</p>
          <p>Check back later for delicious options!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurant-list-container" id="restaurants">
      <div className="restaurant-list-header">
        <div className="header-icon"> 🍽️</div>
        <h2>Popular Restaurants </h2>
        <p className="restaurant-subtitle">Discover amazing dining experiences and comfortable stays</p>
        <div className="header-bottom">
          <p className="restaurant-count">{restaurants.length} restaurants & hotels available</p>
          {restaurants.length > 3 && (
            <div className="scroll-hint">
              <span>👈 Scroll to see more 👉</span>
            </div>
          )}
        </div>
      </div>

      <div className="restaurant-grid">
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant._id} restaurant={restaurant} />
        ))}
      </div>

      <div className="section-divider">
        <hr />
      </div>
    </div>
  );
};

export default RestaurantList;
