import React, { useState, useEffect } from 'react';
import { getImageUrl, getDefaultFoodImage } from '../../utils/imageUtils';

const ImageTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const testImages = [
    {
      name: 'Default Food Image',
      url: getDefaultFoodImage()
    },
    {
      name: 'Server Image - Lasanga Rolls',
      url: getImageUrl('1749184551598food_5.png')
    },
    {
      name: 'Server Image - Greek Salad',
      url: getImageUrl('1749191111940food_1.png')
    },
    {
      name: 'Cloudinary Food Image',
      url: getImageUrl('https://res.cloudinary.com/dodxdudew/image/upload/v1750777697/eatzone/food/x04zrqcxmhrkvptr6dun.jpg')
    },
    {
      name: 'Direct Server URL',
      url: 'https://eatzone.onrender.com/images/1749184551598food_5.png'
    },
    {
      name: 'Direct Cloudinary URL',
      url: 'https://res.cloudinary.com/dodxdudew/image/upload/v1750777697/eatzone/food/x04zrqcxmhrkvptr6dun.jpg'
    }
  ];

  useEffect(() => {
    const testImageLoading = async () => {
      const results = [];
      
      for (const testImage of testImages) {
        const startTime = Date.now();
        try {
          await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              const loadTime = Date.now() - startTime;
              results.push({
                ...testImage,
                status: 'success',
                loadTime: `${loadTime}ms`,
                size: `${img.naturalWidth}x${img.naturalHeight}`
              });
              resolve();
            };
            img.onerror = () => {
              const loadTime = Date.now() - startTime;
              results.push({
                ...testImage,
                status: 'error',
                loadTime: `${loadTime}ms (failed)`,
                size: 'N/A'
              });
              reject();
            };
            img.src = testImage.url;
          });
        } catch (error) {
          // Error already handled in onerror
        }
      }
      
      setTestResults(results);
      setLoading(false);
    };

    testImageLoading();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px' }}>Testing image loading...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Image Loading Test Results</h2>
      <div style={{ display: 'grid', gap: '20px' }}>
        {testResults.map((result, index) => (
          <div 
            key={index} 
            style={{ 
              border: '1px solid #ddd', 
              padding: '15px', 
              borderRadius: '8px',
              backgroundColor: result.status === 'success' ? '#f0f8ff' : '#ffe6e6'
            }}
          >
            <h3>{result.name}</h3>
            <p><strong>Status:</strong> {result.status}</p>
            <p><strong>Load Time:</strong> {result.loadTime}</p>
            <p><strong>Size:</strong> {result.size}</p>
            <p><strong>URL:</strong> <a href={result.url} target="_blank" rel="noopener noreferrer">{result.url}</a></p>
            {result.status === 'success' && (
              <img 
                src={result.url} 
                alt={result.name}
                style={{ 
                  maxWidth: '200px', 
                  maxHeight: '200px', 
                  marginTop: '10px',
                  border: '1px solid #ccc'
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageTest;
