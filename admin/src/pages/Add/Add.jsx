import React, { useState, useEffect } from "react";
import "./Add.css";
import { assets } from "../../assets/assets";
import axios from "axios"
import { toast } from "react-toastify";

// Enhanced Cloudinary upload function with better error handling
const uploadToCloudinary = async (file, folder = 'eatzone', options = {}) => {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    console.log('Uploading file to Cloudinary:', {
      name: file.name,
      size: file.size,
      type: file.type,
      folder: folder
    });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'eatzone_admin');

    if (folder) {
      formData.append('folder', folder);
    }

    // Add tags if provided
    if (options.tags && Array.isArray(options.tags)) {
      formData.append('tags', options.tags.join(','));
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dodxdudew/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary upload error:', errorData);
      throw new Error((errorData.error && errorData.error.message) || `Upload failed with status ${response.status}`);
    }

    const result = await response.json();
    console.log('Cloudinary upload successful:', result);

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const Add = ({url}) => {

  const [image,setImage] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [cloudinaryUrl, setCloudinaryUrl] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [data,setData] = useState({
    name:"",
    description:"",
    price:"",
    category:"",
    restaurantId:"",
    discountPercentage:"",
    discountLabel:"",
    isPopular:false,
    isFeatured:false,
    tags:""
  })

  // Fetch restaurants and categories on component mount
  useEffect(() => {
    fetchRestaurants();
    fetchCategories();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(`${url}/api/restaurant/list`);
      if (response.data.success) {
        setRestaurants(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      toast.error("Failed to load restaurants");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${url}/api/category/list`);
      if (response.data.success) {
        setCategories(response.data.data);
        // Set default category to first available category
        if (response.data.data.length > 0 && !data.category) {
          setData(prev => ({ ...prev, category: response.data.data[0].name }));
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  const onChangeHandler = (event) => {
      const name = event.target.name;
      const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
      setData(data=>({...data,[name]:value}))
  }

  // Handle image upload to Cloudinary
  const handleImageUpload = async (file) => {
    if (!file) return;

    setImageUploading(true);
    toast.info("Uploading image to Cloudinary...");

    try {
      const uploadResult = await uploadToCloudinary(file, 'eatzone/food', {
        tags: ['food', 'menu']
      });

      if (uploadResult.success) {
        console.log("Cloudinary upload successful:", uploadResult.url);
        setCloudinaryUrl(uploadResult.url);
        // Clear the local file since we now have Cloudinary URL
        setImage(false);
        toast.success("Image uploaded successfully!");
      } else {
        console.error("Cloudinary upload failed:", uploadResult.error);
        toast.error(uploadResult.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setImageUploading(false);
    }
  };

  const onSubmitHandler = async(event)=>{
    event.preventDefault();

    try {
      // Validate form data
      if (!cloudinaryUrl) {
        toast.error("Please upload an image to Cloudinary first");
        return;
      }

      if (!data.name || !data.description || !data.price) {
        toast.error("Please fill all required fields");
        return;
      }

      console.log("Form submission data:", {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        cloudinaryUrl: cloudinaryUrl,
        restaurantId: data.restaurantId
      });

      // If image is selected but not uploaded to Cloudinary, upload it first
      if (image && !cloudinaryUrl) {
        toast.error("Please upload the image to Cloudinary first by clicking the 'Upload to Cloudinary' button");
        return;
      }

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", Number(data.price));
      formData.append("category", data.category);
      formData.append("restaurantId", data.restaurantId);
      formData.append("image", cloudinaryUrl); // Use Cloudinary URL instead of file

      // Add discount fields
      if (data.discountPercentage) {
        formData.append("discountPercentage", Number(data.discountPercentage));
      }
      if (data.discountLabel) {
        formData.append("discountLabel", data.discountLabel);
      }
      formData.append("isPopular", data.isPopular);
      formData.append("isFeatured", data.isFeatured);
      if (data.tags) {
        formData.append("tags", data.tags);
      }

      // Show loading toast
      toast.info("Adding food item...");

      const response = await axios.post(`${url}/api/food/add`, formData);

      if(response.data.success){
        setData({
          name: "",
          description: "",
          price: "",
          category: categories.length > 0 ? categories[0].name : "",
          restaurantId: "",
          discountPercentage: "",
          discountLabel: "",
          isPopular: false,
          isFeatured: false,
          tags: ""
        });
        setImage(false);
        setCloudinaryUrl("");
        toast.success(response.data.message || "Food item added successfully!");
      } else {
        toast.error(response.data.message || "Failed to add food item");
      }
    } catch (error) {
      console.error("Error adding food item:", error);
      toast.error((error.response && error.response.data && error.response.data.message) || "An error occurred while adding the food item");
    }
  }

  return (
    <div className="add">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Add New Food Item</h2>
          <p className="card-subtitle">Create a new menu item for your restaurant</p>
        </div>

        <form onSubmit={onSubmitHandler}>
          <div className="add-img-upload">
            <label className="form-label required">Food Image</label>
            <label htmlFor="image">
              {cloudinaryUrl ? (
                <img
                  src={cloudinaryUrl}
                  alt="Food preview from Cloudinary"
                  onError={(e) => {
                    console.error("Failed to load Cloudinary image:", cloudinaryUrl);
                    e.target.style.display = 'none';
                    const fallbackElement = e.target.nextElementSibling;
                    if (fallbackElement) {
                      fallbackElement.style.display = 'block';
                    }
                  }}
                  onLoad={() => {
                    console.log("Cloudinary image loaded successfully:", cloudinaryUrl);
                  }}
                />
              ) : image ? (
                <img
                  src={URL.createObjectURL(image)}
                  alt="Food preview"
                  onError={(e) => {
                    console.error("Failed to load local image preview");
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="upload-text">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21,15 16,10 5,21"></polyline>
                  </svg>
                  <h3>Upload Food Image</h3>
                  <p>Click to browse or drag and drop your image here</p>
                  <p>Recommended: 400x400px, JPG or PNG</p>
                </div>
              )}
              {cloudinaryUrl && (
                <div className="error-fallback" style={{display: 'none'}}>
                  <div className="upload-text">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21,15 16,10 5,21"></polyline>
                    </svg>
                    <h3>Image Upload Complete</h3>
                    <p>Image uploaded to Cloudinary but preview failed to load</p>
                    <p>The image will display correctly on the website</p>
                  </div>
                </div>
              )}
            </label>
            <input
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  console.log("File selected:", file.name, file.size, file.type);
                  setImage(file);
                  // Clear any previous Cloudinary URL when new file is selected
                  setCloudinaryUrl("");
                }
              }}
              type="file"
              id="image"
              accept="image/*"
              hidden
              required
            />
            {image && !cloudinaryUrl && (
              <div className="upload-actions">
                <button
                  type="button"
                  onClick={() => handleImageUpload(image)}
                  disabled={imageUploading}
                  className="upload-btn"
                >
                  {imageUploading ? "Uploading..." : "Upload to Cloudinary"}
                </button>
              </div>
            )}
            {cloudinaryUrl && (
              <div className="upload-success">
                <span className="success-text">✅ Image uploaded to Cloudinary successfully!</span>
                <div className="cloudinary-url">
                  <small>URL: {cloudinaryUrl}</small>
                </div>
                <div className="test-actions">
                  <button
                    type="button"
                    onClick={() => {
                      window.open(cloudinaryUrl, '_blank');
                    }}
                    className="test-btn"
                  >
                    🔗 Test Image URL
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Force reload the image
                      const img = document.querySelector('.add-img-upload img');
                      if (img) {
                        img.src = cloudinaryUrl + '?t=' + Date.now();
                      }
                    }}
                    className="test-btn"
                  >
                    🔄 Refresh Preview
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="add-product-name">
              <label className="form-label required">Product Name</label>
              <input
                onChange={onChangeHandler}
                value={data.name}
                type="text"
                name="name"
                placeholder="Enter food item name"
                required
              />
            </div>
            <div className="add-category">
              <label className="form-label required">Category</label>
              <select onChange={onChangeHandler} name="category" value={data.category} required>
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <small className="form-help">
                  No categories available. Please add categories first in the Categories section.
                </small>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="add-restaurant">
              <label className="form-label">Restaurant (Optional)</label>
              <select
                onChange={onChangeHandler}
                name="restaurantId"
                value={data.restaurantId}
              >
                <option value="">Select Restaurant (Optional)</option>
                {restaurants.map((restaurant) => (
                  <option key={restaurant._id} value={restaurant._id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
              <small className="form-help">
                Leave empty to add as general food item, or select a restaurant to associate this item with a specific restaurant.
              </small>
            </div>
          </div>

          <div className="add-product-description">
            <label className="form-label required">Description</label>
            <textarea
              onChange={onChangeHandler}
              value={data.description}
              name="description"
              rows="4"
              placeholder="Describe your food item, ingredients, and special features..."
              required
            ></textarea>
          </div>

          <div className="add-category-price">
            <div className="add-price">
              <label className="form-label required">Price (INR)</label>
              <input
                onChange={onChangeHandler}
                value={data.price}
                type="number"
                name="price"
                placeholder="₹0"
                min="1"
                required
              />
            </div>
            <div className="add-discount">
              <label className="form-label">Discount (%)</label>
              <input
                onChange={onChangeHandler}
                value={data.discountPercentage}
                type="number"
                name="discountPercentage"
                placeholder="0"
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="add-discount-label">
              <label className="form-label">Discount Label</label>
              <input
                onChange={onChangeHandler}
                value={data.discountLabel}
                type="text"
                name="discountLabel"
                placeholder="e.g., MEGA SALE, LIMITED TIME"
              />
            </div>
            <div className="add-tags">
              <label className="form-label">Tags</label>
              <input
                onChange={onChangeHandler}
                value={data.tags}
                type="text"
                name="tags"
                placeholder="e.g., Bestseller, New, Spicy (comma separated)"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="add-checkboxes">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isPopular"
                  checked={data.isPopular}
                  onChange={onChangeHandler}
                />
                <span className="checkmark"></span>
                Mark as Popular Item
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={data.isFeatured}
                  onChange={onChangeHandler}
                />
                <span className="checkmark"></span>
                Mark as Featured Item
              </label>
            </div>
          </div>

          <div className="form-submit">
            <button type="submit" className="add-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              Add Food Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add;
