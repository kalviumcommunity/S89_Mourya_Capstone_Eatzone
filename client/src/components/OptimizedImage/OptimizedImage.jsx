import { useState, useRef, useEffect } from 'react';
import { getImageUrl, handleImageError } from '../../utils/imageUtils';
// import performanceMonitor from '../../utils/performance'; // Temporarily disabled for debugging
import imageCache from '../../utils/imageCache';
import LoadingIndicator from '../LoadingIndicator/LoadingIndicator';
import './OptimizedImage.css';

const OptimizedImage = ({
  src,
  alt,
  className = '',
  width = 400,
  height = 300,
  quality = 'auto',
  lazy = true,
  placeholder = true,
  onLoad,
  onError,
  style = {},
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    // Temporarily disable lazy loading for debugging - always show images
    setIsInView(true);
    return;

    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '200px', // Start loading 200px before image comes into view for faster loading
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy, isInView]);

  // Get optimized image URL
  const optimizedSrc = getImageUrl(src, undefined, {
    width,
    height,
    quality,
    format: 'auto',
    crop: 'fill',
    gravity: 'auto'
  });

  // For debugging: also get simple URL without optimization
  const simpleSrc = getImageUrl(src);

  // Debug logging
  console.log(`🖼️ OptimizedImage - Original src: ${src}`);
  console.log(`🖼️ OptimizedImage - Simple src: ${simpleSrc}`);
  console.log(`🖼️ OptimizedImage - Optimized src: ${optimizedSrc}`);
  console.log(`🖼️ OptimizedImage - isInView: ${isInView}, hasError: ${hasError}, isLoaded: ${isLoaded}`);

  // Check if image is cached
  useEffect(() => {
    // Temporarily disable cache for debugging
    return;

    if (optimizedSrc && imageCache.has(optimizedSrc)) {
      setIsLoaded(true);
      setHasError(false);
    }
  }, [optimizedSrc]);

  const handleLoad = (e) => {
    console.log(`✅ OptimizedImage loaded successfully: ${simpleSrc}`);
    setIsLoaded(true);
    setHasError(false);

    // Cache the successfully loaded image - temporarily disabled for debugging
    // if (optimizedSrc && e.target) {
    //   imageCache.set(optimizedSrc, e.target);
    // }

    if (onLoad) onLoad();
  };

  const handleError = (e) => {
    console.error(`❌ OptimizedImage error for src: ${simpleSrc}`, e);
    console.error(`❌ Original src: ${src}`);
    setHasError(true);
    if (onError) {
      onError(e);
    } else {
      handleImageError(e);
    }
  };

  // Create placeholder with first letter of alt text
  const getPlaceholder = () => {
    if (!alt) return '🍽️';
    return alt.charAt(0).toUpperCase();
  };

  return (
    <div 
      ref={imgRef}
      className={`optimized-image-container ${className}`}
      style={{ 
        width: width === 'auto' ? 'auto' : `${width}px`,
        height: height === 'auto' ? 'auto' : `${height}px`,
        ...style 
      }}
      {...props}
    >
      {/* Loading placeholder */}
      {placeholder && !isLoaded && !hasError && (
        <div className="image-placeholder">
          {lazy && !isInView ? (
            <div className="placeholder-content">
              <span className="placeholder-icon">{getPlaceholder()}</span>
            </div>
          ) : (
            <LoadingIndicator
              type="skeleton"
              size="medium"
              className="image-loading"
            />
          )}
        </div>
      )}

      {/* Actual image */}
      {isInView && !hasError && (
        <img
          src={simpleSrc}
          alt={alt}
          className={`optimized-image ${isLoaded ? 'loaded' : 'loading'}`}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
          ref={(img) => {
            // Performance monitoring temporarily disabled for debugging
            // if (img) {
            //   performanceMonitor.monitorImageLoad(img, alt || 'image');
            // }
          }}
          style={{
            display: 'block', // Always show image for debugging
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isLoaded ? 1 : 0.5 // Use opacity instead of display for debugging
          }}
        />
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="image-error">
          <span className="error-icon">🍽️</span>
          <span className="error-text">Image unavailable</span>
        </div>
      )}

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          fontSize: '10px',
          padding: '2px 4px'
        }}>
          {isLoaded ? '✅' : hasError ? '❌' : '⏳'} {alt}
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
