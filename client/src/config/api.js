// API Configuration
const API_CONFIG = {
  // Get base URL from environment variables with fallback
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  
  // Environment
  ENV: import.meta.env.VITE_APP_ENV || 'development',
  
  // API endpoints
  ENDPOINTS: {
    CHATBOT: '/api/chatbot/chat',
    FOOD_LIST: '/api/food/list',
    USER_PROFILE: '/api/user/profile',
    ORDERS: '/api/order',
    AUTH: '/api/user'
  },
  
  // Request timeout (in milliseconds)
  TIMEOUT: 10000,
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json'
  }
};

// Helper function to build full URL
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = (token = null) => {
  const headers = { ...API_CONFIG.DEFAULT_HEADERS };
  
  // Get token from localStorage if not provided
  const authToken = token || localStorage.getItem('token');
  
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  
  return headers;
};

// Helper function for API requests with error handling
export const apiRequest = async (endpoint, options = {}) => {
  const url = buildApiUrl(endpoint);
  const config = {
    ...options,
    headers: {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...options.headers
    }
  };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Chatbot specific API function
export const sendChatMessage = async (message, chatMode = 'support', token = null) => {
  return apiRequest(API_CONFIG.ENDPOINTS.CHATBOT, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({
      message,
      chatMode
    })
  });
};

export default API_CONFIG;
