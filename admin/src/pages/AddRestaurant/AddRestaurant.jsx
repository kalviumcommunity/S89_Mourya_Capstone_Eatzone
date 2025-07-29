import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './AddRestaurant.css';
import { uploadToCloudinary, uploadConfigs } from '../../utils/cloudinaryUtils';

// Using centralized Cloudinary utility for consistent image handling

const AddRestaurant = ({ url, token }) => {
  const [image, setImage] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [cloudinaryUrl, setCloudinaryUrl] = useState("");
  const [data, setData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    deliveryTime: "30-45 mins",
    deliveryFee: "0",
    minimumOrder: "0",
    cuisineTypes: []
  });

  const [cuisineInput, setCuisineInput] = useState("");

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }));
  };

  const addCuisine = () => {
    if (cuisineInput.trim() && !data.cuisineTypes.includes(cuisineInput.trim())) {
      setData(data => ({
        ...data,
        cuisineTypes: [...data.cuisineTypes, cuisineInput.trim()]
      }));
      setCuisineInput("");
    }
  };

  const removeCuisine = (cuisine) => {
    setData(data => ({
      ...data,
      cuisineTypes: data.cuisineTypes.filter(c => c !== cuisine)
    }));
  };

  // Handle image upload to Cloudinary
  const handleImageUpload = async (file) => {
    if (!file) return;

    setImageUploading(true);
    toast.info("Uploading restaurant image to Cloudinary...");

    try {
      const uploadResult = await uploadToCloudinary(file, uploadConfigs.restaurant.folder, {
        tags: uploadConfigs.restaurant.tags
      });

      if (uploadResult.success) {
        setCloudinaryUrl(uploadResult.url);
        toast.success("Restaurant image uploaded successfully!");
      } else {
        toast.error(uploadResult.error || "Failed to upload restaurant image");
      }
    } catch (error) {
      console.error("Restaurant image upload error:", error);
      toast.error("Failed to upload restaurant image");
    } finally {
      setImageUploading(false);
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!image && !cloudinaryUrl) {
      toast.error("Please select and upload a restaurant image");
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
    formData.append("address", data.address);
    formData.append("phone", data.phone);
    formData.append("email", data.email);
    formData.append("deliveryTime", data.deliveryTime);
    formData.append("deliveryFee", data.deliveryFee);
    formData.append("minimumOrder", data.minimumOrder);
    formData.append("cuisineTypes", JSON.stringify(data.cuisineTypes));
    formData.append("image", cloudinaryUrl); // Use Cloudinary URL instead of file
    // Remove firebaseUID - it will be set by the server from authenticated admin

    try {
      const response = await fetch(`${url}/api/restaurant/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}` // Add proper admin authentication
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setData({
          name: "",
          description: "",
          address: "",
          phone: "",
          email: "",
          deliveryTime: "30-45 mins",
          deliveryFee: "0",
          minimumOrder: "0",
          cuisineTypes: []
        });
        setImage(null);
        setCloudinaryUrl("");
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error adding restaurant:", error);
      toast.error("Error adding restaurant");
    }
  };

  return (
    <div className='add-restaurant'>
      <form className='flex-col' onSubmit={onSubmitHandler}>
        <div className="add-img-upload flex-col">
          <p>Upload Restaurant Image</p>
          <label htmlFor="image">
            <img
              src={cloudinaryUrl ? cloudinaryUrl : image ? URL.createObjectURL(image) : "/api/placeholder/150/150"}
              alt="Restaurant"
            />
          </label>
          <input
            onChange={(e) => setImage(e.target.files[0])}
            type="file"
            id="image"
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
              <span className="success-text">✅ Restaurant image uploaded to Cloudinary successfully!</span>
            </div>
          )}
        </div>

        <div className="add-restaurant-name flex-col">
          <p>Restaurant Name</p>
          <input 
            onChange={onChangeHandler} 
            value={data.name} 
            type="text" 
            name='name' 
            placeholder='Type here' 
            required 
          />
        </div>

        <div className="add-restaurant-description flex-col">
          <p>Restaurant Description</p>
          <textarea 
            onChange={onChangeHandler} 
            value={data.description} 
            name="description" 
            rows="6" 
            placeholder='Write restaurant description here' 
            required
          ></textarea>
        </div>

        <div className="add-restaurant-address flex-col">
          <p>Restaurant Address</p>
          <input 
            onChange={onChangeHandler} 
            value={data.address} 
            type="text" 
            name='address' 
            placeholder='Restaurant address' 
            required 
          />
        </div>

        <div className="add-restaurant-contact flex-row">
          <div className="flex-col">
            <p>Phone Number</p>
            <input 
              onChange={onChangeHandler} 
              value={data.phone} 
              type="tel" 
              name='phone' 
              placeholder='Phone number' 
            />
          </div>
          <div className="flex-col">
            <p>Email</p>
            <input 
              onChange={onChangeHandler} 
              value={data.email} 
              type="email" 
              name='email' 
              placeholder='Email address' 
            />
          </div>
        </div>

        <div className="add-restaurant-details flex-row">
          <div className="flex-col">
            <p>Delivery Time</p>
            <input 
              onChange={onChangeHandler} 
              value={data.deliveryTime} 
              type="text" 
              name='deliveryTime' 
              placeholder='e.g., 30-45 mins' 
            />
          </div>
          <div className="flex-col">
            <p>Delivery Fee (₹)</p>
            <input 
              onChange={onChangeHandler} 
              value={data.deliveryFee} 
              type="number" 
              name='deliveryFee' 
              placeholder='0' 
              min="0"
            />
          </div>
          <div className="flex-col">
            <p>Minimum Order (₹)</p>
            <input 
              onChange={onChangeHandler} 
              value={data.minimumOrder} 
              type="number" 
              name='minimumOrder' 
              placeholder='0' 
              min="0"
            />
          </div>
        </div>

        <div className="add-cuisine-types flex-col">
          <p>Cuisine Types</p>
          <div className="cuisine-input-container">
            <input 
              value={cuisineInput}
              onChange={(e) => setCuisineInput(e.target.value)}
              type="text" 
              placeholder='e.g., Indian, Chinese, Italian' 
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCuisine())}
            />
            <button type="button" onClick={addCuisine} className="add-cuisine-btn">
              Add
            </button>
          </div>
          
          {data.cuisineTypes.length > 0 && (
            <div className="cuisine-tags">
              {data.cuisineTypes.map((cuisine, index) => (
                <span key={index} className="cuisine-tag">
                  {cuisine}
                  <button 
                    type="button" 
                    onClick={() => removeCuisine(cuisine)}
                    className="remove-cuisine"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <button type='submit' className='add-btn'>ADD RESTAURANT</button>
      </form>
    </div>
  );
};

export default AddRestaurant;
