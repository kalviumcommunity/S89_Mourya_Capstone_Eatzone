import React, { useState, useEffect } from "react";
import "./Add.css";
import { assets } from "../../assets/assets";
import axios from "axios"
import { toast } from "react-toastify";

// Temporary simple upload function
const uploadToCloudinary = async (file, folder = 'eatzone', options = {}) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'eatzone_admin');

    if (folder) {
      formData.append('folder', folder);
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
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const result = await response.json();
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
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
  const [data,setData] = useState({
    name:"",
    description:"",
    price:"",
    category:"Rolls",
    restaurantId:"",
    discountPercentage:"",
    discountLabel:"",
    isPopular:false,
    isFeatured:false,
    tags:""
  })

  // Fetch restaurants on component mount
  useEffect(() => {
    fetchRestaurants();
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
        setCloudinaryUrl(uploadResult.url);
        toast.success("Image uploaded successfully!");
      } else {
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
      if (!image && !cloudinaryUrl) {
        toast.error("Please select and upload an image");
        return;
      }

      if (!data.name || !data.description || !data.price) {
        toast.error("Please fill all required fields");
        return;
      }

      // If image is selected but not uploaded to Cloudinary, upload it first
      if (image && !cloudinaryUrl) {
        await handleImageUpload(image);
        toast.info("Please submit again after image upload completes");
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
          category: "Rolls",
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
      toast.error(error.response?.data?.message || "An error occurred while adding the food item");
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
                <img src={cloudinaryUrl} alt="Food preview from Cloudinary" />
              ) : image ? (
                <img src={URL.createObjectURL(image)} alt="Food preview" />
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
            </label>
            <input
              onChange={(e) => setImage(e.target.files[0])}
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
                <option value="Rolls">Rolls</option>
                <option value="Salad">Salad</option>
                <option value="Deserts">Deserts</option>
                <option value="Sandwich">Sandwich</option>
                <option value="Cake">Cake</option>
                <option value="Veg">Veg</option>
                <option value="Main Course">Main Course</option>
                <option value="Appetizer">Appetizer</option>
                <option value="Dessert">Dessert</option>
                <option value="Pizza">Pizza</option>
                <option value="Sushi">Sushi</option>
                <option value="Sashimi">Sashimi</option>
                <option value="Soup">Soup</option>
                <option value="Tacos">Tacos</option>
                <option value="Burritos">Burritos</option>
                <option value="Pasta">Pasta</option>
                <option value="Noodles">Noodles</option>
              </select>
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
