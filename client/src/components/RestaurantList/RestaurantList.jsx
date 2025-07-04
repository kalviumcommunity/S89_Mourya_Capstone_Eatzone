import React, { useState, useEffect, useContext } from 'react';
import RestaurantCard from '../RestaurantCard/RestaurantCard';
import { StoreContext } from '../../context/StoreContext';
import apiService from '../../services/apiService';
import { SkeletonRestaurant } from '../Skeleton/Skeleton';
import './RestaurantList.css';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use cached API service
      const response = await apiService.getRestaurants();

      if (response.success) {
        setRestaurants(response.data);
        console.log('✅ Restaurants loaded:', response.data.length, 'items');
      } else {
        setError(response.message || 'Failed to fetch restaurants');
      }
    } catch (error) {
      console.error('❌ Error fetching restaurants:', error);
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
        <div className="skeleton-grid restaurant-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonRestaurant key={index} />
          ))}
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
          <p>🍽️ No restaurants available at the moment</p>
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
        <p className="restaurant-subtitle">Discover amazing dining experiences</p>
        <div className="header-bottom">
          <p className="restaurant-count">{restaurants.length} restaurants available</p>
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
