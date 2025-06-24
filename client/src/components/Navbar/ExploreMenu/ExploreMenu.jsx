import { useState, useEffect } from 'react'
import './ExploreMenu.css'
import axios from 'axios'
import CategoryImage from '../../CategoryImage/CategoryImage'

const ExploreMenu = ({category,setCategory}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get API URL from environment or use default
  const url = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  const fetchCategories = async () => {
    try {
      console.log("🔄 Fetching categories from:", `${url}/api/category/list`);
      const response = await axios.get(`${url}/api/category/list`);
      if (response.data.success) {
        console.log("✅ Categories loaded:", response.data.data);
        setCategories(response.data.data);
      } else {
        console.error("❌ Failed to fetch categories:", response.data.message);
      }
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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
                        <CategoryImage
                          image={item.image}
                          categoryName={item.name}
                          baseUrl={url}
                          className={category===item.name?"active":""}
                          alt={item.name}
                          onLoad={() => {
                            console.log(`Successfully loaded image for ${item.name}`);
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