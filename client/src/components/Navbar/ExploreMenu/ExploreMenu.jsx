import React, { useState, useEffect } from 'react'
import './ExploreMenu.css'
import axios from 'axios'

const ExploreMenu = ({category,setCategory}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get API URL from environment or use default
  const url = process.env.REACT_APP_API_URL || 'http://localhost:4000';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${url}/api/category/list`);
      if (response.data.success) {
        setCategories(response.data.data);
      } else {
        console.error("Failed to fetch categories:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='explore-menu' id='explore-menu'>
        <h1>Explore our menu</h1>
        <p className='explore-menu-text'>Loading categories...</p>
      </div>
    );
  }

  return (
    <div className='explore-menu' id='explore-menu'>
        <h1>Explore our menu</h1>
        <p className='explore-menu-text'>Choose from a diverse menu featuring a delection array of dishes crafted with the finest ingredients and carvings and elevate your dining experience,one delicious meal at a time.</p>
        <div className="explore-menu-list">
            {categories.map((item)=>{
                return(
                    <div onClick={()=>setCategory(prev=>prev===item.name?"All":item.name)} key={item._id} className='explore-menu-list-item'>
                        <img
                          className={category===item.name?"active":""}
                          src={item.image.startsWith('http') ? item.image : `${url}/images/${item.image}`}
                          alt={item.name}
                          onError={(e) => {
                            e.target.src = '/placeholder-food.jpg'; // Fallback image
                          }}
                        />
                        <p>{item.name}</p>
                    </div>
                )
            })}
        </div>
        <hr />
    </div>
  )
}

export default ExploreMenu