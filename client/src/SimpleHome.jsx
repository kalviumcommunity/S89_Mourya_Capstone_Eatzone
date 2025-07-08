import React, { useState } from 'react'

const SimpleHome = () => {
  const [category, setCategory] = useState("All")

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#ff6b35', textAlign: 'center' }}>🍕 Welcome to EatZone!</h1>
      
      {/* Simple Header */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '40px 20px', 
        borderRadius: '8px',
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <h2>Order your favourite food here</h2>
        <p>Choose from a diverse menu featuring a delicious array of dishes crafted with the finest ingredients.</p>
        <button style={{
          backgroundColor: '#ff6b35',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}>
          View Menu
        </button>
      </div>

      {/* Simple Restaurant Section */}
      <div style={{ marginBottom: '30px' }}>
        <h2>🏪 Top Restaurants</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: '20px' 
        }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '8px',
              border: '1px solid #dee2e6',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                height: '150px', 
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '15px',
                fontSize: '48px'
              }}>
                🏪
              </div>
              <h3 style={{ margin: '0 0 8px 0' }}>Restaurant {i}</h3>
              <p style={{ margin: '0 0 8px 0', color: '#666' }}>Delicious food and great service</p>
              <p style={{ margin: '0', fontSize: '14px', color: '#999' }}>
                ⏱️ 25-30 mins | 🚚 ₹40 delivery
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Simple Categories Section */}
      <div style={{ marginBottom: '30px' }}>
        <h2>🍽️ Explore Our Menu</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Choose from a diverse menu featuring a selection of dishes.
        </p>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
          gap: '15px',
          marginBottom: '20px'
        }}>
          {[
            { name: 'Burgers', emoji: '🍔' },
            { name: 'Pizza', emoji: '🍕' },
            { name: 'Biryani', emoji: '🍛' },
            { name: 'Salads', emoji: '🥗' },
            { name: 'Noodles', emoji: '🍜' },
            { name: 'Desserts', emoji: '🍦' },
            { name: 'Beverages', emoji: '☕' },
            { name: 'Sandwiches', emoji: '🥪' }
          ].map((cat) => (
            <div 
              key={cat.name}
              onClick={() => setCategory(prev => prev === cat.name ? "All" : cat.name)}
              style={{ 
                backgroundColor: category === cat.name ? '#ff6b35' : 'white',
                color: category === cat.name ? 'white' : '#333',
                padding: '15px', 
                borderRadius: '8px',
                border: '1px solid #dee2e6',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{cat.emoji}</div>
              <div style={{ fontSize: '12px', fontWeight: '500' }}>{cat.name}</div>
            </div>
          ))}
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid #dee2e6' }} />
      </div>

      {/* Simple Food Display */}
      <div style={{ marginBottom: '30px' }}>
        <h2>🍽️ Food Items {category !== "All" && `- ${category}`}</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '20px' 
        }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ 
              backgroundColor: 'white', 
              borderRadius: '8px',
              border: '1px solid #dee2e6',
              overflow: 'hidden',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                height: '120px', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px'
              }}>
                🍽️
              </div>
              <div style={{ padding: '15px' }}>
                <h4 style={{ margin: '0 0 8px 0' }}>Food Item {i}</h4>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                  Delicious and fresh food item
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', color: '#ff6b35' }}>₹{150 + i * 50}</span>
                  <button style={{
                    backgroundColor: '#ff6b35',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simple Footer */}
      <div style={{ 
        backgroundColor: '#333', 
        color: 'white', 
        padding: '40px 20px',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h3>📱 Download EatZone App</h3>
        <p>Get the best food delivery experience on your mobile device</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
          <button style={{
            backgroundColor: '#ff6b35',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            📱 App Store
          </button>
          <button style={{
            backgroundColor: '#ff6b35',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            🤖 Play Store
          </button>
        </div>
      </div>
    </div>
  )
}

export default SimpleHome
