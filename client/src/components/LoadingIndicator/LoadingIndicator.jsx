import React from 'react';
import './LoadingIndicator.css';

const LoadingIndicator = ({ 
  type = 'spinner', 
  size = 'medium', 
  color = '#ff6b35',
  text = '',
  className = ''
}) => {
  const getSpinner = () => (
    <div className={`loading-spinner ${size}`} style={{ borderTopColor: color }}>
      <div className="spinner-inner"></div>
    </div>
  );

  const getDots = () => (
    <div className={`loading-dots ${size}`}>
      <div className="dot" style={{ backgroundColor: color }}></div>
      <div className="dot" style={{ backgroundColor: color }}></div>
      <div className="dot" style={{ backgroundColor: color }}></div>
    </div>
  );

  const getPulse = () => (
    <div className={`loading-pulse ${size}`} style={{ backgroundColor: color }}></div>
  );

  const getSkeletonBox = () => (
    <div className={`skeleton-box ${size}`}></div>
  );

  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return getDots();
      case 'pulse':
        return getPulse();
      case 'skeleton':
        return getSkeletonBox();
      default:
        return getSpinner();
    }
  };

  return (
    <div className={`loading-indicator ${className}`}>
      {renderLoader()}
      {text && <span className="loading-text">{text}</span>}
    </div>
  );
};

export default LoadingIndicator;
