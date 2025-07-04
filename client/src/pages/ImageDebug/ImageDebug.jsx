import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../../utils/imageUtils';
import OptimizedImage from '../../components/OptimizedImage/OptimizedImage';

const ImageDebug = () => {
  const [testResults, setTestResults] = useState([]);

  const testImages = [
    {
      name: "Server Image 1",
      url: "1749184551598food_5.png",
      type: "server"
    },
    {
      name: "Server Image 2", 
      url: "1749191111940food_1.png",
      type: "server"
    },
    {
      name: "Cloudinary Image",
      url: "https://res.cloudinary.com/dodxdudew/image/upload/v1750777697/eatzone/food/x04zrqcxmhrkvptr6dun.jpg",
      type: "cloudinary"
    },
    {
      name: "Default Image",
      url: null,
      type: "default"
    }
  ];

  const handleImageLoad = (imageName) => {
    console.log(`✅ Image loaded successfully: ${imageName}`);
    setTestResults(prev => [...prev, { name: imageName, status: 'loaded', timestamp: new Date().toLocaleTimeString() }]);
  };

  const handleImageError = (imageName, error) => {
    console.error(`❌ Image failed to load: ${imageName}`, error);
    setTestResults(prev => [...prev, { name: imageName, status: 'error', timestamp: new Date().toLocaleTimeString() }]);
  };

  useEffect(() => {
    console.log('🧪 Image Debug Page Loaded');
    console.log('🔧 Environment Variables:');
    console.log('- VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
    console.log('- NODE_ENV:', import.meta.env.NODE_ENV);
    console.log('- MODE:', import.meta.env.MODE);

    // Test image URLs with fetch
    const testImageFetch = async () => {
      const testUrls = [
        "https://eatzone.onrender.com/images/1749184551598food_5.png",
        "https://eatzone.onrender.com/images/1749191111940food_1.png"
      ];

      for (const testUrl of testUrls) {
        try {
          console.log('🔍 Testing image fetch:', testUrl);
          const response = await fetch(testUrl, {
            method: 'HEAD', // Just check if the resource exists
            mode: 'cors'
          });
          console.log('✅ Fetch response:', response.status, response.statusText, 'for', testUrl);
        } catch (error) {
          console.error('❌ Fetch error for', testUrl, ':', error);
        }
      }
    };

    testImageFetch();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🧪 Image Loading Debug Page</h1>
      <p>Testing different image sources to diagnose loading issues</p>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h3>Environment Info:</h3>
        <p><strong>API Base URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'Not set'}</p>
        <p><strong>Mode:</strong> {import.meta.env.MODE}</p>
        <p><strong>Node Env:</strong> {import.meta.env.NODE_ENV}</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {testImages.map((image, index) => {
          const imageUrl = image.url ? getImageUrl(image.url) : getImageUrl(null);
          
          return (
            <div key={index} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', backgroundColor: 'white' }}>
              <h3>{image.name}</h3>
              <p><strong>Type:</strong> {image.type}</p>
              <p><strong>Original:</strong> {image.url || 'null'}</p>
              <p><strong>Generated URL:</strong> {imageUrl}</p>
              
              <div style={{ marginTop: '15px' }}>
                <h4>Image Preview (Basic img tag):</h4>
                <img
                  src={imageUrl}
                  alt={image.name}
                  width={200}
                  height={150}
                  onLoad={() => handleImageLoad(image.name + ' (basic)')}
                  onError={(e) => handleImageError(image.name + ' (basic)', e)}
                  style={{
                    border: '2px solid #007bff',
                    borderRadius: '4px',
                    objectFit: 'cover',
                    backgroundColor: '#f8f9fa'
                  }}
                />
              </div>

              <div style={{ marginTop: '15px' }}>
                <h4>Image Preview (OptimizedImage component):</h4>
                <OptimizedImage
                  src={image.url}
                  alt={image.name}
                  width={200}
                  height={150}
                  lazy={false}
                  onLoad={() => handleImageLoad(image.name + ' (optimized)')}
                  onError={(e) => handleImageError(image.name + ' (optimized)', e)}
                  style={{
                    border: '2px solid #28a745',
                    borderRadius: '4px',
                    objectFit: 'cover',
                    backgroundColor: '#f8f9fa'
                  }}
                />
              </div>

              <div style={{ marginTop: '10px' }}>
                <h4>Direct Test:</h4>
                <a 
                  href={imageUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#007bff', textDecoration: 'underline' }}
                >
                  Open in new tab
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h3>Test Results:</h3>
        {testResults.length === 0 ? (
          <p>No results yet...</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {testResults.map((result, index) => (
              <li key={index} style={{ 
                color: result.status === 'loaded' ? 'green' : 'red',
                padding: '5px 0',
                borderBottom: '1px solid #eee'
              }}>
                <span style={{ marginRight: '10px' }}>
                  {result.status === 'loaded' ? '✅' : '❌'}
                </span>
                <strong>{result.name}</strong>
                <span style={{ marginLeft: '10px', fontSize: '0.9em', color: '#666' }}>
                  {result.timestamp}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
        <h3>🔍 Debugging Tips:</h3>
        <ul>
          <li>Check browser console for detailed logs</li>
          <li>Verify network requests in DevTools</li>
          <li>Test image URLs directly in browser</li>
          <li>Check CORS headers for cross-origin requests</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageDebug;
