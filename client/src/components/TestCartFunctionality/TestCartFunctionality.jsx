import React, { useContext, useState } from 'react';
import { StoreContext } from '../../context/StoreContext';

const TestCartFunctionality = () => {
  const { 
    cartItems, 
    addToCart, 
    removeFromCart, 
    foodData, 
    token, 
    user 
  } = useContext(StoreContext);
  
  const [testResults, setTestResults] = useState([]);

  const runCartTest = async () => {
    const results = [];
    
    // Test 1: Check if food data is loaded
    results.push({
      test: "Food Data Loaded",
      result: foodData.length > 0 ? "✅ PASS" : "❌ FAIL",
      details: `${foodData.length} food items loaded`
    });

    // Test 2: Check authentication state
    results.push({
      test: "Authentication State",
      result: token && user ? "✅ AUTHENTICATED" : "⚠️ GUEST MODE",
      details: user ? `User: ${user.name}` : "No user logged in"
    });

    // Test 3: Test adding item to cart
    if (foodData.length > 0) {
      const testItemId = foodData[0]._id;
      const initialCount = cartItems[testItemId] || 0;
      
      try {
        await addToCart(testItemId);
        
        // Wait a moment for state to update
        setTimeout(() => {
          const newCount = cartItems[testItemId] || 0;
          results.push({
            test: "Add to Cart",
            result: newCount > initialCount ? "✅ PASS" : "❌ FAIL",
            details: `Count changed from ${initialCount} to ${newCount}`
          });
          
          setTestResults([...results]);
        }, 500);
      } catch (error) {
        results.push({
          test: "Add to Cart",
          result: "❌ ERROR",
          details: error.message
        });
      }
    }

    setTestResults(results);
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '350px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#ff6b35' }}>Cart Test Panel</h4>
      
      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={runCartTest}
          style={{
            background: '#ff6b35',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '8px'
          }}
        >
          Run Tests
        </button>
        <button 
          onClick={clearTestResults}
          style={{
            background: '#666',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear
        </button>
      </div>

      <div>
        <strong>Current Cart Items:</strong> {Object.keys(cartItems).length}
      </div>
      
      {testResults.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <strong>Test Results:</strong>
          {testResults.map((result, index) => (
            <div key={index} style={{ 
              margin: '5px 0', 
              padding: '5px', 
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '3px'
            }}>
              <div><strong>{result.test}:</strong> {result.result}</div>
              <div style={{ fontSize: '10px', color: '#ccc' }}>{result.details}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestCartFunctionality;
