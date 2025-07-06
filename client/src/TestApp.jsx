import React from 'react'

const TestApp = () => {
  console.log('🧪 TestApp rendering...')
  
  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ color: '#ff6b35', marginBottom: '20px' }}>🍕 EatZone Test</h1>
      <p style={{ color: '#333', fontSize: '18px', marginBottom: '20px' }}>
        If you can see this, React is working!
      </p>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: '400px'
      }}>
        <h3 style={{ color: '#333', marginBottom: '15px' }}>✅ System Status</h3>
        <ul style={{ textAlign: 'left', color: '#666' }}>
          <li>✅ React is loading</li>
          <li>✅ Components are rendering</li>
          <li>✅ Styles are working</li>
          <li>✅ JavaScript is executing</li>
        </ul>
        <button 
          onClick={() => {
            console.log('🔄 Reloading to main app...')
            window.location.reload()
          }}
          style={{
            backgroundColor: '#ff6b35',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '15px',
            fontSize: '16px'
          }}
        >
          🔄 Reload Main App
        </button>
      </div>
    </div>
  )
}

export default TestApp
