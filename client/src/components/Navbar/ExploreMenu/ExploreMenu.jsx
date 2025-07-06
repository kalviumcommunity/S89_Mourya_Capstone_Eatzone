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

  // Smart reload functionality for efficient updates
  const { register, unregister } = useSmartReload('categories', fetchCategories);

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

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Fetching categories with caching...");

      // Use cached API service
      const response = await apiService.getCategories();

      console.log("🔍 Categories API response:", response);

      if (response.success) {
        console.log("✅ Categories loaded:", response.data.length, "items");
        setCategories(response.data);

        // If no categories found, show helpful message
        if (response.data.length === 0) {
          console.log("ℹ️ No active categories found");
        }
      } else {
        console.error("❌ Failed to fetch categories:", response.message);
        setError(response.message || "Failed to load categories");
      }
    } catch (error) {
      console.error("❌ Error fetching categories:", error);

      // Provide more specific error messages
      let errorMessage = "Unable to connect to server.";
      if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timed out. Please try again.";
      } else if (error.response) {
        errorMessage = `Server error: ${error.response.status} ${error.response.statusText}`;
      } else if (error.request) {
        errorMessage = "Network error. Please check your internet connection.";
      } else {
        errorMessage = `Error: ${error.message}`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load with smart reload system
  useEffect(() => {
    let mounted = true;

    const initializeCategories = async () => {
      if (mounted) {
        await fetchCategories();
        // Register with smart reload system
        register();
        // Initialize smart reload manager
        smartReloadManager.initialize();
      }
    };

    initializeCategories();

    return () => {
      mounted = false;
      unregister();
    };
  }, [fetchCategories, register, unregister]);

  if (loading) {
    return (
      <div className='explore-menu' id='explore-menu'>
        <h1>Explore our menu</h1>
        <p className='explore-menu-text'>Loading categories...</p>
        <div className="loading-spinner" style={{textAlign: 'center', padding: '20px'}}>
          <div style={{display: 'inline-block', width: '20px', height: '20px', border: '2px solid #f3f3f3', borderTop: '2px solid #ff6b35', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='explore-menu' id='explore-menu'>
        <h1>Explore our menu</h1>
        <p className='explore-menu-text' style={{color: '#ff6b35'}}>
          {error}
        </p>
        <button
          onClick={() => fetchCategories(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ff6b35',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  console.log("🔍 Rendering ExploreMenu with categories:", categories);
  console.log("🔍 Categories length:", categories.length);
  console.log("🔍 Loading state:", loading);
  console.log("🔍 Error state:", error);

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
                            onError={() => {
                              console.log(`Failed to load image for ${item.name}, using fallback`);
                            }}
                          />
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