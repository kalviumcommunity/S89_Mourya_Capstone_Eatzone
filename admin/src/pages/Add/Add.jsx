import React, { useState } from "react";
import "./Add.css";
import { assets } from "../../assets/assets";
import axios from "axios"
import { toast } from "react-toastify";

const Add = ({url}) => {

  const [image,setImage] = useState(false);
  const [data,setData] = useState({
    name:"",
    description:"",
    price:"",
    category:"Salad"
  })

  const onChangeHandler = (event) => {
      const name = event.target.name;
      const value = event.target.value;
      setData(data=>({...data,[name]:value}))
  }

  const onSubmitHandler = async(event)=>{
    event.preventDefault();

    try {
      // Validate form data
      if (!image) {
        toast.error("Please upload an image");
        return;
      }

      if (!data.name || !data.description || !data.price) {
        toast.error("Please fill all required fields");
        return;
      }

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", Number(data.price));
      formData.append("category", data.category);
      formData.append("image", image);

      // Show loading toast
      toast.info("Adding food item...");

      const response = await axios.post(`${url}/api/food/add`, formData);

      if(response.data.success){
        setData({
          name: "",
          description: "",
          price: "",
          category: "Salad"
        });
        setImage(false);
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
              {image ? (
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
                <option value="Salad">Salad</option>
                <option value="Rolls">Rolls</option>
                <option value="Deserts">Deserts</option>
                <option value="Sandwich">Sandwich</option>
                <option value="Cake">Cake</option>
                <option value="Pure Veg">Pure Veg</option>
                <option value="Pasta">Pasta</option>
                <option value="Noodles">Noodles</option>
              </select>
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
            <div style={{ display: 'flex', alignItems: 'end' }}>
              <button type="submit" className="add-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                Add Food Item
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add;
