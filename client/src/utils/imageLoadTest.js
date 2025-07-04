/**
 * Image loading performance test utility
 */

export const testImageLoading = async () => {
  console.log('🧪 Starting image loading performance test...');
  
  const testImages = [
    {
      name: 'Default Food Image',
      url: 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/default-food.jpg'
    },
    {
      name: 'Server Image',
      url: 'https://eatzone.onrender.com/images/1749184551598food_5.png'
    },
    {
      name: 'Pizza Category',
      url: 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/pizza.jpg'
    },
    {
      name: 'Burger Image',
      url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop'
    },
    {
      name: 'Biryani Image',
      url: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400&h=400&fit=crop'
    }
  ];

  const results = [];
  let totalTime = 0;
  let successCount = 0;
  let failCount = 0;

  for (const testImage of testImages) {
    const startTime = performance.now();
    
    try {
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        const timeout = setTimeout(() => {
          reject(new Error('Timeout'));
        }, 10000); // 10 second timeout
        
        img.onload = () => {
          clearTimeout(timeout);
          const loadTime = performance.now() - startTime;
          results.push({
            ...testImage,
            status: 'success',
            loadTime: Math.round(loadTime),
            size: `${img.naturalWidth}x${img.naturalHeight}`
          });
          totalTime += loadTime;
          successCount++;
          resolve();
        };
        
        img.onerror = () => {
          clearTimeout(timeout);
          const loadTime = performance.now() - startTime;
          results.push({
            ...testImage,
            status: 'error',
            loadTime: Math.round(loadTime),
            size: 'N/A'
          });
          failCount++;
          reject(new Error('Failed to load'));
        };
        
        img.src = testImage.url;
      });
    } catch (error) {
      // Error already handled in the promise
    }
  }

  const avgLoadTime = successCount > 0 ? totalTime / successCount : 0;
  
  console.log('📊 Image Loading Test Results:');
  console.table(results);
  
  console.log(`✅ Summary:
    - Total Images: ${testImages.length}
    - Successful: ${successCount}
    - Failed: ${failCount}
    - Average Load Time: ${Math.round(avgLoadTime)}ms
    - Success Rate: ${Math.round((successCount / testImages.length) * 100)}%
  `);

  // Performance assessment
  if (avgLoadTime < 1000) {
    console.log('🚀 Excellent performance! Images loading under 1 second.');
  } else if (avgLoadTime < 3000) {
    console.log('✅ Good performance! Images loading under 3 seconds.');
  } else {
    console.log('⚠️ Performance needs improvement. Images taking over 3 seconds to load.');
  }

  return {
    results,
    summary: {
      total: testImages.length,
      successful: successCount,
      failed: failCount,
      averageLoadTime: Math.round(avgLoadTime),
      successRate: Math.round((successCount / testImages.length) * 100)
    }
  };
};

// Auto-run test in development mode
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Run test after a short delay to allow app to initialize
  setTimeout(() => {
    if (localStorage.getItem('eatzone_debug') === 'true') {
      testImageLoading();
    }
  }, 3000);
}
