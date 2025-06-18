import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { toast } from 'react-toastify';
import './AddRestaurant.css';

const AddRestaurant = ({ url }) => {
  const { admin } = useAdmin();
  const [image, setImage] = useState(null);
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

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    
    if (!image) {
      toast.error("Please select a restaurant image");
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
    formData.append("image", image);
    formData.append("firebaseUID", admin?.firebaseUID || "admin-uid");

    try {
      const response = await fetch(`${url}/api/restaurant/add`, {
        method: 'POST',
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
              src={image ? URL.createObjectURL(image) : "/api/placeholder/150/150"} 
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
