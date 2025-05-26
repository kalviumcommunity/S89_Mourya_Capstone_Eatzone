import React, { useState } from 'react';
import { testCorsConfig } from '../../utils/corsTest';

const CorsTest = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTestCors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await testCorsConfig();
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '5px', margin: '20px' }}>
      <h2>CORS Test</h2>
      <button 
        onClick={handleTestCors}
        style={{ 
          padding: '10px 15px', 
          backgroundColor: '#ff4d00', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
        disabled={loading}
      >
        {loading ? 'Testing...' : 'Test CORS Configuration'}
      </button>
      
      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          <p>Error: {error}</p>
        </div>
      )}
      
      {result && (
        <div style={{ marginTop: '10px' }}>
          <p>Status: {result.success ? 'Success' : 'Failed'}</p>
          {result.data && (
            <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
              {JSON.stringify(result.data, null, 2)}
            </pre>
          )}
          {result.error && <p>Error: {result.error}</p>}
        </div>
      )}
    </div>
  );
};

export default CorsTest;
