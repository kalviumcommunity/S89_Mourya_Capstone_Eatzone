import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './RestaurantList.css';

// Utility function to get proper image URL
const getImageUrl = (image, serverUrl) => {
  if (!image) {
    return '/api/placeholder/50/50'; // Default fallback
  }

  const imageStr = String(image);

  // Check if it's a Cloudinary URL
  if (imageStr.includes('cloudinary.com')) {
    return imageStr; // Return Cloudinary URL as-is
  }

  // Check if image is already a processed URL
  if (imageStr.startsWith('http') || imageStr.startsWith('/') || imageStr.startsWith('data:')) {
    return imageStr;
  }

  // Server uploaded image filename - construct server URL
  if (imageStr.includes('.png') || imageStr.includes('.jpg') || imageStr.includes('.jpeg')) {
    const cleanImagePath = imageStr.startsWith('/') ? imageStr.substring(1) : imageStr;
    return `${serverUrl}/images/${cleanImagePath}`;
  }

  // Fallback - treat as server image
  return `${serverUrl}/images/${imageStr}`;
};

const RestaurantList = ({ url, token }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    deliveryTime: '30-45 mins',
    deliveryFee: '0',
    minimumOrder: '0',
    cuisineTypes: [],
    image: null
  });
  const [cuisineInput, setCuisineInput] = useState('');

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

  const startEdit = (restaurant) => {
    console.log('Starting edit for restaurant:', restaurant);
    setEditingRestaurant(restaurant);
    setEditForm({
      name: restaurant.name || '',
      description: restaurant.description || '',
      address: restaurant.address || '',
      phone: restaurant.phone || '',
      email: restaurant.email || '',
      deliveryTime: restaurant.deliveryTime || '30-45 mins',
      deliveryFee: restaurant.deliveryFee?.toString() || '0',
      minimumOrder: restaurant.minimumOrder?.toString() || '0',
      cuisineTypes: restaurant.cuisineTypes || [],
      image: null
    });
    setCuisineInput(restaurant.cuisineTypes ? restaurant.cuisineTypes.join(', ') : '');
  };

  const cancelEdit = () => {
    setEditingRestaurant(null);
    setEditForm({
      name: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      deliveryTime: '30-45 mins',
      deliveryFee: '0',
      minimumOrder: '0',
      cuisineTypes: [],
      image: null
    });
    setCuisineInput('');
  };

  const handleEditFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setEditForm(prev => ({ ...prev, image: files[0] }));
    } else {
      setEditForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCuisineInputChange = (e) => {
    setCuisineInput(e.target.value);
    // Convert comma-separated string to array
    const cuisineArray = e.target.value
      .split(',')
      .map(cuisine => cuisine.trim())
      .filter(cuisine => cuisine.length > 0);
    setEditForm(prev => ({ ...prev, cuisineTypes: cuisineArray }));
  };

  const updateRestaurant = async (e) => {
    e.preventDefault();

    if (!editForm.name || !editForm.description || !editForm.address) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate delivery fee and minimum order are valid numbers
    if (isNaN(editForm.deliveryFee) || Number(editForm.deliveryFee) < 0) {
      toast.error("Please enter a valid delivery fee");
      return;
    }

    if (isNaN(editForm.minimumOrder) || Number(editForm.minimumOrder) < 0) {
      toast.error("Please enter a valid minimum order amount");
      return;
    }

    try {
      console.log("Updating restaurant:", editingRestaurant._id);
      console.log("Form data:", editForm);

      toast.info("Updating restaurant...", { autoClose: 1000 });

      const formData = new FormData();
      formData.append('id', editingRestaurant._id);
      formData.append('name', editForm.name.trim());
      formData.append('description', editForm.description.trim());
      formData.append('address', editForm.address.trim());
      formData.append('phone', editForm.phone.trim());
      formData.append('email', editForm.email.trim());
      formData.append('deliveryTime', editForm.deliveryTime);
      formData.append('deliveryFee', editForm.deliveryFee);
      formData.append('minimumOrder', editForm.minimumOrder);
      formData.append('cuisineTypes', JSON.stringify(editForm.cuisineTypes));

      if (editForm.image) {
        console.log("Adding image to form data:", editForm.image.name);
        formData.append('image', editForm.image);
      }

      // Log form data for debugging
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const response = await fetch(`${url}/api/restaurant/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      console.log("Update response:", data);

      if (data.success) {
        toast.success(data.message || "Restaurant updated successfully");
        await fetchRestaurants(); // Refresh the list
        cancelEdit(); // Close the edit modal
      } else {
        console.error("Update failed:", data.message);
        toast.error(data.message || "Failed to update restaurant");
      }
    } catch (error) {
      console.error("Error updating restaurant:", error);

      if (error.response?.status === 404) {
        toast.error("Restaurant not found");
      } else if (error.response?.status === 400) {
        toast.error("Invalid data provided");
      } else if (error.response?.status === 403) {
        toast.error("You don't have permission to update this restaurant");
      } else {
        toast.error("Failed to update restaurant. Please try again.");
      }
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
            <b>Actions</b>
          </div>
          
          {restaurants.map((restaurant, index) => (
            <div key={index} className='restaurant-list-table-format'>
              <img
                src={getImageUrl(restaurant.image, url)}
                alt={restaurant.name}
                onError={(e) => {
                  console.error("Failed to load restaurant image:", restaurant.image);
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
              <div className="restaurant-actions">
                <button
                  className="action-btn edit-btn"
                  title="Edit Restaurant"
                  onClick={() => startEdit(restaurant)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button
                  className="action-btn delete-btn"
                  title="Delete Restaurant"
                  onClick={() => removeRestaurant(restaurant._id, restaurant.name)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingRestaurant && (
        <div className="edit-modal-overlay" onClick={cancelEdit}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h3>Edit Restaurant</h3>
              <button className="close-btn" onClick={cancelEdit}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form onSubmit={updateRestaurant} className="edit-form">
              <div className="form-group">
                <label htmlFor="edit-name">Restaurant Name *</label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditFormChange}
                  placeholder="Enter restaurant name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-description">Description *</label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={editForm.description}
                  onChange={handleEditFormChange}
                  placeholder="Enter restaurant description"
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-address">Address *</label>
                <textarea
                  id="edit-address"
                  name="address"
                  value={editForm.address}
                  onChange={handleEditFormChange}
                  placeholder="Enter restaurant address"
                  rows="2"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-phone">Phone</label>
                  <input
                    type="tel"
                    id="edit-phone"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditFormChange}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-email">Email</label>
                  <input
                    type="email"
                    id="edit-email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditFormChange}
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-delivery-time">Delivery Time</label>
                  <input
                    type="text"
                    id="edit-delivery-time"
                    name="deliveryTime"
                    value={editForm.deliveryTime}
                    onChange={handleEditFormChange}
                    placeholder="e.g., 30-45 mins"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-delivery-fee">Delivery Fee (₹)</label>
                  <input
                    type="number"
                    id="edit-delivery-fee"
                    name="deliveryFee"
                    value={editForm.deliveryFee}
                    onChange={handleEditFormChange}
                    placeholder="Enter delivery fee"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-minimum-order">Minimum Order (₹)</label>
                  <input
                    type="number"
                    id="edit-minimum-order"
                    name="minimumOrder"
                    value={editForm.minimumOrder}
                    onChange={handleEditFormChange}
                    placeholder="Enter minimum order amount"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="edit-cuisine-types">Cuisine Types</label>
                <input
                  type="text"
                  id="edit-cuisine-types"
                  value={cuisineInput}
                  onChange={handleCuisineInputChange}
                  placeholder="Enter cuisine types separated by commas (e.g., Indian, Chinese, Italian)"
                />
                <small>Separate multiple cuisines with commas. Current: {editForm.cuisineTypes.length} cuisine(s)</small>
              </div>

              <div className="form-group">
                <label htmlFor="edit-image">Restaurant Image</label>
                <input
                  type="file"
                  id="edit-image"
                  name="image"
                  onChange={handleEditFormChange}
                  accept="image/*"
                />
                <small>Leave empty to keep current image</small>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={cancelEdit}>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Update Restaurant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantList;
