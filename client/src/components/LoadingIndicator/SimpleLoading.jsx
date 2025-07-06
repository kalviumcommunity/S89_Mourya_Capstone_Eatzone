
import React from 'react';
import './SimpleLoading.css';

const SimpleLoading = ({ text = 'Loading...', size = 'medium' }) => {
  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <div className="simple-spinner"></div>
      <div className="loading-text">{text}</div>
    </div>
  );
};

export default SimpleLoading;
