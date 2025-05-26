// Simple script to test CORS configuration
import axios from 'axios';

// Function to test the API endpoint
export const testCorsConfig = async () => {
  try {
    // Add a timestamp to prevent caching
    const timestamp = new Date().getTime();
    const response = await axios.get(`/api/food/list?t=${timestamp}`, {
      headers: {
        'Content-Type': 'application/json',
        // Add the origin header explicitly
        'Origin': window.location.origin
      }
    });

    console.log('CORS test successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('CORS test failed:', error);
    return { success: false, error: error.message };
  }
};
