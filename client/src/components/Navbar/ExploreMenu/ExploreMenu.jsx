import { useState, useEffect, useCallback } from 'react'
import './ExploreMenu.css'
import CategoryImage from '../../CategoryImage/CategoryImage'
import apiService from '../../../services/apiService'
import { SkeletonCategory } from '../../Skeleton/Skeleton'
import { useSmartReload, smartReloadManager } from '../../../utils/smartReload'

const ExploreMenu = ({category,setCategory}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get API URL - prioritize environment variables, fallback to production URL
  const getApiUrl = () => {
    // In development, use proxy or localhost
    if (import.meta.env.DEV) {
      return import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
    }
    // In production, always use the production server URL
    return import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://eatzone.onrender.com';
  };

  const url = getApiUrl();

  // Debug logging for production troubleshooting
  console.log("🔍 API Configuration:", {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    finalUrl: url,
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD
  });

  // Define fetchCategories function first
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use cached API service
      const response = await apiService.getCategories();

      if (response.success) {
        setCategories(response.data);
      } else {
        setError(response.message || "Failed to load categories");
      }
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
      setError("Unable to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Smart reload functionality for efficient updates
  const { register, unregister } = useSmartReload('categories', fetchCategories);

  // Initial load with smart reload system
  useEffect(() => {
    let mounted = true;

    const initializeCategories = async () => {
      if (mounted) {
        await fetchCategories();
        // Register with smart reload system
        register();
      }
    };

    initializeCategories();

    return () => {
      mounted = false;
      unregister();
    };
  }, [fetchCategories, register, unregister]);

  // Initialize smart reload manager once
  useEffect(() => {
    smartReloadManager.initialize();
  }, []);

  return (
    <div className='explore-menu' id='explore-menu'>
        <h1>Explore our menu</h1>
        <p className='explore-menu-text'>Choose from a diverse menu featuring a delection array of dishes crafted with the finest ingredients and carvings and elevate your dining experience,one delicious meal at a time.</p>

        {loading ? (
          <div className="skeleton-grid category-grid">
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonCategory key={index} />
            ))}
          </div>
        ) : error ? (
          <div style={{textAlign: 'center', padding: '40px 20px', color: '#666'}}>
            <div style={{fontSize: '48px', marginBottom: '16px'}}>⚠️</div>
            <h3 style={{margin: '0 0 8px 0', color: '#ff6b35'}}>Failed to load categories</h3>
            <p style={{margin: '0 0 16px 0', color: '#666'}}>{error}</p>
            <button
              onClick={() => fetchCategories()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ff6b35',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        ) : categories.length === 0 ? (
          <div style={{textAlign: 'center', padding: '40px 20px', color: '#666'}}>
            <div style={{fontSize: '48px', marginBottom: '16px'}}>🍽️</div>
            <h3 style={{margin: '0 0 8px 0', color: '#333'}}>No categories available</h3>
            <p style={{margin: '0', color: '#666'}}>Categories will appear here once they are added by the admin.</p>
          </div>
        ) : (
          <div className="explore-menu-list">
              {categories.map((item)=>{
                  return(
                      <div onClick={()=>setCategory(prev=>prev===item.name?"All":item.name)} key={item._id} className={`explore-menu-list-item ${category===item.name?"active":""}`}>
                          <CategoryImage
                            image={item.image}
                            categoryName={item.name}
                            baseUrl={url}
                            className={category===item.name?"active":""}
                            alt={item.name}
                          />
                          <p className="category-name">{item.name}</p>
                      </div>
                  )
              })}
          </div>
        )}
        <hr />
    </div>
  )
}

export default ExploreMenu