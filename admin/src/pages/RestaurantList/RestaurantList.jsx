import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './RestaurantList.css';

const RestaurantList = ({ url, token }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${url}/api/restaurant/list`);
      const data = await response.json();

      if (data.success) {
        setRestaurants(data.data);
      } else {
        toast.error("Error fetching restaurants");
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      toast.error("Error fetching restaurants");
    } finally {
      setLoading(false);
    }
  };

  const removeRestaurant = async (restaurantId, restaurantName) => {
    // Add confirmation dialog
    if (!window.confirm(`Are you sure you want to delete "${restaurantName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${url}/api/restaurant/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Use proper admin token
        },
        body: JSON.stringify({
          id: restaurantId
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Restaurant removed successfully");
        fetchRestaurants(); // Refresh the list
      } else {
        toast.error(data.message || "Error removing restaurant");
      }
    } catch (error) {
      console.error("Error removing restaurant:", error);
      toast.error("Error removing restaurant");
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  if (loading) {
    return (
      <div className="restaurant-list">
        <p>Loading restaurants...</p>
      </div>
    );
  }

  return (
    <div className='restaurant-list'>
      <div className="restaurant-list-header">
        <h2>All Restaurants</h2>
        <p>Total: {restaurants.length} restaurants</p>
      </div>

      {restaurants.length === 0 ? (
        <div className="no-restaurants">
          <p>No restaurants found. Add your first restaurant!</p>
        </div>
      ) : (
        <div className="restaurant-list-table">
          <div className="restaurant-list-table-format title">
            <b>Image</b>
            <b>Name</b>
            <b>Description</b>
            <b>Address</b>
            <b>Delivery</b>
            <b>Rating</b>
            <b>Action</b>
          </div>
          
          {restaurants.map((restaurant, index) => (
            <div key={index} className='restaurant-list-table-format'>
              <img 
                src={`${url}/images/${restaurant.image}`} 
                alt={restaurant.name}
                onError={(e) => {
                  e.target.src = "/api/placeholder/50/50";
                }}
              />
              <p>{restaurant.name}</p>
              <p className="description">{restaurant.description}</p>
              <p className="address">{restaurant.address}</p>
              <div className="delivery-info">
                <p>{restaurant.deliveryTime}</p>
                <p>₹{restaurant.deliveryFee}</p>
              </div>
              <div className="rating">
                <span>⭐ {restaurant.rating}</span>
              </div>
              <p
                onClick={() => removeRestaurant(restaurant._id, restaurant.name)}
                className='cursor'
                title={`Delete ${restaurant.name}`}
              >
                ❌
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantList;
