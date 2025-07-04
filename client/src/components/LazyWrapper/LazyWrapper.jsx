import React, { Suspense } from 'react';
import { SkeletonCard } from '../Skeleton/Skeleton';
import './LazyWrapper.css';

/**
 * Wrapper component for lazy-loaded components with loading fallback
 */
const LazyWrapper = ({ 
  children, 
  fallback = null, 
  skeletonCount = 1,
  skeletonType = 'card',
  className = '',
  ...props 
}) => {
  // Default fallback based on skeleton type
  const getDefaultFallback = () => {
    switch (skeletonType) {
      case 'card':
        return (
          <div className={`lazy-wrapper-skeleton ${className}`}>
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        );
      case 'page':
        return (
          <div className="lazy-wrapper-page">
            <div className="lazy-wrapper-header">
              <div className="skeleton-title"></div>
              <div className="skeleton-subtitle"></div>
            </div>
            <div className="lazy-wrapper-content">
              {Array.from({ length: skeletonCount || 3 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          </div>
        );
      case 'minimal':
        return (
          <div className="lazy-wrapper-minimal">
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
            <p>Loading...</p>
          </div>
        );
      default:
        return (
          <div className="lazy-wrapper-default">
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          </div>
        );
    }
  };

  return (
    <Suspense fallback={fallback || getDefaultFallback()}>
      <div className={`lazy-wrapper ${className}`} {...props}>
        {children}
      </div>
    </Suspense>
  );
};

/**
 * Higher-order component for creating lazy-loaded components
 */
export const withLazyLoading = (
  importFn, 
  fallbackOptions = {}
) => {
  const LazyComponent = React.lazy(importFn);
  
  return (props) => (
    <LazyWrapper {...fallbackOptions}>
      <LazyComponent {...props} />
    </LazyWrapper>
  );
};

/**
 * Hook for preloading lazy components
 */
export const usePreloadComponent = (importFn) => {
  const preload = React.useCallback(() => {
    importFn().catch(error => {
      console.warn('Failed to preload component:', error);
    });
  }, [importFn]);

  return preload;
};

export default LazyWrapper;
