import React, { useEffect, useState } from 'react'
import './List.css'
import axios from "axios"
import { toast } from "react-toastify"

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

const List = ({ url }) => {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingItem, setEditingItem] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    restaurantId: '',
    image: null,
    discountPercentage: '',
    discountLabel: '',
    isPopular: false,
    isFeatured: false,
    tags: ''
  });

  // Test API connection
  const testApiConnection = async () => {
    try {
      console.log("Testing API connection to:", url);
      const response = await axios.get(`${url}/test`);
      console.log("API test response:", response.data);
      toast.success("API connection successful!", { autoClose: 2000 });
    } catch (error) {
      console.error("API connection test failed:", error);
      toast.error("API connection failed. Check console for details.", { autoClose: 5000 });
    }
  };

  const fetchList = async () => {
    try {
      setLoading(true);
      console.log("Fetching food list from:", `${url}/api/food/list`);
      const response = await axios.get(`${url}/api/food/list`);
      console.log("Food list response:", response.data);

      if (response.data.success) {
        setList(response.data.data);
        setFilteredList(response.data.data);
        console.log("Food items loaded:", response.data.data.length, "items");
        toast.success(`Food items loaded successfully (${response.data.data.length} items)`, { autoClose: 2000 });
      } else {
        console.error("Failed to load food items:", response.data.message);
        toast.error(response.data.message || "Failed to load food items");
      }
    } catch (error) {
      console.error("Error fetching food list:", error);
      console.error("Error details:", error.response?.data);
      toast.error(error.response?.data?.message || "An error occurred while fetching food items");
    } finally {
      setLoading(false);
    }
  }

  const fetchRestaurants = async () => {
    try {
      console.log("Fetching restaurants from:", `${url}/api/restaurant/list`);
      const response = await axios.get(`${url}/api/restaurant/list`);
      console.log("Restaurants response:", response.data);
      if (response.data.success) {
        setRestaurants(response.data.data);
        console.log("Restaurants loaded:", response.data.data.length, "restaurants");
      } else {
        console.error("Failed to load restaurants:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      console.error("Error details:", error.response?.data);
    }
  }

  const removeFood = async (foodId) => {
    if (window.confirm('Are you sure you want to delete this food item?')) {
      try {
        toast.info("Removing food item...", { autoClose: 1000 });

        const response = await axios.post(`${url}/api/food/remove`, { id: foodId });

        if (response.data.success) {
          toast.success(response.data.message || "Food item removed successfully");
          await fetchList(); // Refresh the list
        } else {
          toast.error(response.data.message || "Failed to remove food item");
        }
      } catch (error) {
        console.error("Error removing food item:", error);
        toast.error(error.response?.data?.message || "An error occurred while removing food item");
      }
    }
  }

  const clearAllFood = async () => {
    if (window.confirm("⚠️ WARNING: Are you sure you want to delete ALL food items?\n\nThis action cannot be undone and will remove all items from your database.")) {
      try {
        toast.info("Clearing all food items...", { autoClose: 2000 });

        const response = await axios.post(`${url}/api/food/clear-all`);

        if (response.data.success) {
          toast.success(response.data.message || "All food items cleared successfully");
          await fetchList(); // Refresh the list
        } else {
          toast.error(response.data.message || "Failed to clear food items");
        }
      } catch (error) {
        console.error("Error clearing food items:", error);
        toast.error(error.response?.data?.message || "An error occurred while clearing food items");
      }
    }
  }

  const startEdit = (item) => {
    setEditingItem(item);
    setEditForm({
      name: item.name,
      description: item.description || '',
      price: (item.originalPrice || item.price).toString(), // Use original price if available
      category: item.category,
      restaurantId: item.restaurantId?._id || item.restaurantId || '',
      image: null,
      discountPercentage: item.discountPercentage?.toString() || '',
      discountLabel: item.discountLabel || '',
      isPopular: item.isPopular || false,
      isFeatured: item.isFeatured || false,
      tags: item.tags ? item.tags.join(', ') : ''
    });
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditForm({
      name: '',
      description: '',
      price: '',
      category: '',
      restaurantId: '',
      image: null,
      discountPercentage: '',
      discountLabel: '',
      isPopular: false,
      isFeatured: false,
      tags: ''
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (name === 'image') {
      setEditForm(prev => ({ ...prev, image: files[0] }));
    } else if (type === 'checkbox') {
      setEditForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setEditForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const updateFood = async (e) => {
    e.preventDefault();

    if (!editForm.name || !editForm.price || !editForm.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate price is a positive number
    if (isNaN(editForm.price) || Number(editForm.price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    try {
      console.log("Updating food item:", editingItem._id);
      console.log("Form data:", editForm);

      toast.info("Updating food item...", { autoClose: 1000 });

      const formData = new FormData();
      formData.append('id', editingItem._id);
      formData.append('name', editForm.name.trim());
      formData.append('description', editForm.description.trim());
      formData.append('price', editForm.price);
      formData.append('category', editForm.category);

      // Add restaurant association
      if (editForm.restaurantId && editForm.restaurantId !== 'none') {
        formData.append('restaurantId', editForm.restaurantId);
      } else {
        formData.append('restaurantId', ''); // Remove restaurant association
      }

      // Add discount fields
      if (editForm.discountPercentage) {
        formData.append('discountPercentage', Number(editForm.discountPercentage));
      } else {
        formData.append('discountPercentage', 0); // Remove discount
      }
      if (editForm.discountLabel) {
        formData.append('discountLabel', editForm.discountLabel);
      }
      formData.append('isPopular', editForm.isPopular);
      formData.append('isFeatured', editForm.isFeatured);
      if (editForm.tags) {
        formData.append('tags', editForm.tags);
      }

      if (editForm.image) {
        console.log("Adding image to form data:", editForm.image.name);
        formData.append('image', editForm.image);
      }

      // Log form data for debugging
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const response = await axios.post(`${url}/api/food/update`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout
      });

      console.log("Update response:", response.data);

      if (response.data.success) {
        toast.success(response.data.message || "Food item updated successfully");
        await fetchList(); // Refresh the list
        cancelEdit(); // Close the edit modal
      } else {
        console.error("Update failed:", response.data.message);
        toast.error(response.data.message || "Failed to update food item");
      }
    } catch (error) {
      console.error("Error updating food item:", error);
      console.error("Error response:", error.response?.data);

      if (error.response?.status === 404) {
        toast.error("Food item not found");
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || "Invalid data provided");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An error occurred while updating food item");
      }
    }
  };

  // Filter function
  useEffect(() => {
    let filtered = list;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    setFilteredList(filtered);
  }, [list, searchTerm, categoryFilter]);

  useEffect(() => {
    testApiConnection();
    fetchList();
    fetchRestaurants();
    fetchCategories();
  }, [])

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${url}/api/category/list`);
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  if (loading) {
    return (
      <div className="list">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading food items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='list'>
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Food Items</h2>
            <p className="card-subtitle">Manage your restaurant menu items</p>
          </div>
          <div className="card-actions">
            <button
              className="btn btn-primary"
              onClick={testApiConnection}
              title="Test API connection"
              style={{ marginRight: '1rem' }}
            >
              🔗 Test API
            </button>
            <button
              className="btn btn-danger"
              onClick={clearAllFood}
              title="Clear all food items from database"
            >
              🗑️ Clear All Items
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="list-stats">
          <div className="list-stat">
            <span className="list-stat-value">{list.length}</span>
            <span className="list-stat-label">Total Items</span>
          </div>
          <div className="list-stat">
            <span className="list-stat-value">{categories.length}</span>
            <span className="list-stat-label">Categories</span>
          </div>
          <div className="list-stat">
            <span className="list-stat-value">₹{list.reduce((sum, item) => sum + item.price, 0)}</span>
            <span className="list-stat-label">Total Value</span>
          </div>
        </div>

        {/* Filters */}
        <div className="list-filters">
          <input
            type="text"
            placeholder="Search food items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category.name}>{category.name}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="list-table">
          <div className="list-table-format title">
            <span>Image</span>
            <span>Food Details</span>
            <span>Restaurant</span>
            <span>Category</span>
            <span>Price</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {filteredList.length > 0 ? (
            filteredList.map((item, index) => (
              <div key={index} className='list-table-format'>
                <img
                  src={getImageUrl(item.image, url)}
                  alt={item.name}
                  className="food-image"
                  onError={(e) => {
                    console.error("Failed to load image:", item.image);
                    e.target.src = '/api/placeholder/50/50';
                  }}
                />
                <div className="food-info">
                  <h4 className="food-name">{item.name}</h4>
                  <p className="food-description">{item.description || 'No description available'}</p>
                </div>
                <span className="food-restaurant">
                  {item.restaurantId?.name || 'General Item'}
                </span>
                <span className="food-category">{item.category}</span>
                <div className="food-price-container">
                  {item.isOnSale && item.originalPrice ? (
                    <div className="price-with-discount">
                      <span className="original-price">₹{item.originalPrice}</span>
                      <span className="discounted-price">₹{item.price}</span>
                      <span className="discount-badge-small">{item.discountPercentage}% OFF</span>
                    </div>
                  ) : (
                    <span className="food-price">₹{item.price}</span>
                  )}
                  {item.isPopular && <span className="item-tag popular">🔥 Popular</span>}
                  {item.isFeatured && <span className="item-tag featured">⭐ Featured</span>}
                </div>
                <span className="badge badge-success">Available</span>
                <div className="food-actions">
                  <button
                    className="action-btn edit-btn"
                    title="Edit Item"
                    onClick={() => startEdit(item)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button
                    className="action-btn delete-btn"
                    title="Delete Item"
                    onClick={() => removeFood(item._id)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3,6 5,6 21,6"></polyline>
                      <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-items">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="M21 21l-4.35-4.35"></path>
              </svg>
              <h3>No items found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="edit-modal-overlay" onClick={cancelEdit}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h3>Edit Food Item</h3>
              <button className="close-btn" onClick={cancelEdit}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form onSubmit={updateFood} className="edit-form">
              <div className="form-group">
                <label htmlFor="edit-name">Food Name *</label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditFormChange}
                  placeholder="Enter food name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-description">Description</label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={editForm.description}
                  onChange={handleEditFormChange}
                  placeholder="Enter food description"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-restaurant">Restaurant</label>
                <select
                  id="edit-restaurant"
                  name="restaurantId"
                  value={editForm.restaurantId}
                  onChange={handleEditFormChange}
                >
                  <option value="">No Restaurant (General Item)</option>
                  {restaurants.map((restaurant) => (
                    <option key={restaurant._id} value={restaurant._id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
                <small>Select a restaurant to associate this food item with</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-category">Category *</label>
                  <select
                    id="edit-category"
                    name="category"
                    value={editForm.category}
                    onChange={handleEditFormChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-price">Price (₹) *</label>
                  <input
                    type="number"
                    id="edit-price"
                    name="price"
                    value={editForm.price}
                    onChange={handleEditFormChange}
                    placeholder="Enter price"
                    min="1"
                    required
                  />
                  <small>This is the original price before discount</small>
                </div>
              </div>

              {/* Discount Fields */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-discount">Discount (%)</label>
                  <input
                    type="number"
                    id="edit-discount"
                    name="discountPercentage"
                    value={editForm.discountPercentage}
                    onChange={handleEditFormChange}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                  <small>Enter 0 to remove discount</small>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-discount-label">Discount Label</label>
                  <input
                    type="text"
                    id="edit-discount-label"
                    name="discountLabel"
                    value={editForm.discountLabel}
                    onChange={handleEditFormChange}
                    placeholder="e.g., MEGA SALE, LIMITED TIME"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="edit-tags">Tags</label>
                <input
                  type="text"
                  id="edit-tags"
                  name="tags"
                  value={editForm.tags}
                  onChange={handleEditFormChange}
                  placeholder="e.g., Bestseller, New, Spicy (comma separated)"
                />
              </div>

              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isPopular"
                      checked={editForm.isPopular}
                      onChange={handleEditFormChange}
                    />
                    <span className="checkmark"></span>
                    Mark as Popular Item
                  </label>
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={editForm.isFeatured}
                      onChange={handleEditFormChange}
                    />
                    <span className="checkmark"></span>
                    Mark as Featured Item
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="edit-image">Update Image (Optional)</label>
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
                <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default List