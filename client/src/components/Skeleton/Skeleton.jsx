import React from 'react';
import './Skeleton.css';

const Skeleton = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '4px', 
  className = '',
  variant = 'rectangular',
  animation = 'pulse',
  count = 1,
  style = {}
}) => {
  const skeletonStyle = {
    width,
    height,
    borderRadius: variant === 'circular' ? '50%' : borderRadius,
    ...style
  };

  const skeletonClass = `skeleton ${variant} ${animation} ${className}`;

  if (count === 1) {
    return <div className={skeletonClass} style={skeletonStyle} />;
  }

  return (
    <div className="skeleton-group">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={skeletonClass} style={skeletonStyle} />
      ))}
    </div>
  );
};

// Predefined skeleton components for common use cases
export const SkeletonText = ({ lines = 1, width = '100%', ...props }) => (
  <div className="skeleton-text-container">
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        width={index === lines - 1 ? '70%' : width}
        height="16px"
        {...props}
      />
    ))}
  </div>
);

export const SkeletonImage = ({ width = '100%', height = '200px', ...props }) => (
  <Skeleton
    width={width}
    height={height}
    borderRadius="8px"
    {...props}
  />
);

export const SkeletonCircle = ({ size = '40px', ...props }) => (
  <Skeleton
    width={size}
    height={size}
    variant="circular"
    {...props}
  />
);

export const SkeletonCard = ({ 
  imageHeight = '200px', 
  titleWidth = '80%', 
  textLines = 2,
  className = '',
  ...props 
}) => (
  <div className={`skeleton-card ${className}`} {...props}>
    <SkeletonImage height={imageHeight} />
    <div className="skeleton-card-content">
      <Skeleton width={titleWidth} height="20px" className="skeleton-title" />
      <SkeletonText lines={textLines} />
      <div className="skeleton-card-footer">
        <Skeleton width="60px" height="16px" />
        <Skeleton width="80px" height="16px" />
      </div>
    </div>
  </div>
);

export const SkeletonFoodItem = () => (
  <div className="skeleton-food-item">
    <SkeletonImage height="200px" />
    <div className="skeleton-food-content">
      <Skeleton width="90%" height="18px" className="skeleton-food-title" />
      <SkeletonText lines={2} />
      <div className="skeleton-food-footer">
        <Skeleton width="60px" height="20px" />
        <Skeleton width="30px" height="30px" variant="circular" />
      </div>
    </div>
  </div>
);

export const SkeletonRestaurant = () => (
  <div className="skeleton-restaurant">
    <SkeletonImage height="160px" />
    <div className="skeleton-restaurant-content">
      <Skeleton width="85%" height="20px" className="skeleton-restaurant-title" />
      <SkeletonText lines={1} />
      <div className="skeleton-restaurant-details">
        <Skeleton width="50px" height="16px" />
        <Skeleton width="80px" height="16px" />
      </div>
    </div>
  </div>
);

export const SkeletonCategory = () => (
  <div className="skeleton-category">
    <SkeletonCircle size="80px" />
    <Skeleton width="60px" height="14px" />
  </div>
);

export default Skeleton;
