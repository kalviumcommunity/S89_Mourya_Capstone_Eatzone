import React, { useState, useEffect } from 'react'

const DiagnosticApp = () => {
  const [apiStatus, setApiStatus] = useState('Testing...')
  const [categories, setCategories] = useState([])
  const [restaurants, setRestaurants] = useState([])

  useEffect(() => {
    const testAPI = async () => {
      try {
        // Test categories
        const categoriesResponse = await fetch('https://eatzone.onrender.com/api/category/list')
        const categoriesData = await categoriesResponse.json()
        
        if (categoriesData.success) {
          setCategories(categoriesData.data)
          console.log('✅ Categories loaded:', categoriesData.data.length)
        }

        // Test restaurants
        const restaurantsResponse = await fetch('https://eatzone.onrender.com/api/restaurant/list')
        const restaurantsData = await restaurantsResponse.json()
        
        if (restaurantsData.success) {
          setRestaurants(restaurantsData.data)
          console.log('✅ Restaurants loaded:', restaurantsData.data.length)
        }

        setApiStatus('✅ API Working')
      } catch (error) {
        console.error('❌ API Error:', error)
        setApiStatus('❌ API Error: ' + error.message)
      }
    }

    testAPI()
  }, [])

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#ff6b35', textAlign: 'center' }}>🍕 EatZone Diagnostic</h1>
      
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>🔍 System Status</h2>
        <p><strong>API Status:</strong> {apiStatus}</p>
        <p><strong>Categories Count:</strong> {categories.length}</p>
        <p><strong>Restaurants Count:</strong> {restaurants.length}</p>
        <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
        <p><strong>API URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'https://eatzone.onrender.com'}</p>
      </div>

      {categories.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2>🍽️ Categories ({categories.length})</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '15px' 
          }}>
            {categories.slice(0, 8).map((category) => (
              <div key={category._id} style={{ 
                backgroundColor: 'white', 
                padding: '15px', 
                borderRadius: '8px',
                border: '1px solid #dee2e6',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                  {category.emoji || '🍽️'}
                </div>
                <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>{category.name}</h4>
                <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                  {category.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {restaurants.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2>🏪 Restaurants ({restaurants.length})</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
            gap: '15px' 
          }}>
            {restaurants.slice(0, 6).map((restaurant) => (
              <div key={restaurant._id} style={{ 
                backgroundColor: 'white', 
                padding: '15px', 
                borderRadius: '8px',
                border: '1px solid #dee2e6'
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>{restaurant.name}</h4>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                  {restaurant.description}
                </p>
                <p style={{ margin: '0', fontSize: '12px', color: '#999' }}>
                  Delivery: {restaurant.deliveryTime} mins | Fee: ₹{restaurant.deliveryFee}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ 
        backgroundColor: '#e7f3ff', 
        padding: '20px', 
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h3>🎯 Next Steps</h3>
        <p>If you can see this page with data, the API is working correctly.</p>
        <p>The issue might be with specific components in the main app.</p>
        <button 
          onClick={() => window.location.href = '/'}
          style={{
            backgroundColor: '#ff6b35',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          🔄 Back to Main App
        </button>
      </div>
    </div>
  )
}

export default DiagnosticApp
