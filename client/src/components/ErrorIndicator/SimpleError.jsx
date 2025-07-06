
import React from 'react';

const SimpleError = ({ message, onRetry }) => {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
      <h3 style={{ margin: '0 0 8px 0', color: '#ff6b35' }}>Something went wrong</h3>
      <p style={{ margin: '0 0 16px 0', color: '#666' }}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
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
      )}
    </div>
  );
};

export default SimpleError;
