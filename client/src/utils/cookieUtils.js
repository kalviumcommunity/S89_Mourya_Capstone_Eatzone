/**
 * Cookie utility functions for authentication
 */

// Cookie configuration
const COOKIE_CONFIG = {
  TOKEN_NAME: 'eatzone_token',
  USER_NAME: 'eatzone_user',
  EXPIRES_DAYS: 7, // 7 days
  SECURE: window.location.protocol === 'https:', // Only secure in production
  SAME_SITE: 'Lax' // CSRF protection
};

/**
 * Set a cookie with proper security settings
 */
export const setCookie = (name, value, days = COOKIE_CONFIG.EXPIRES_DAYS) => {
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    
    let cookieString = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/`;
    
    // Add security flags
    if (COOKIE_CONFIG.SECURE) {
      cookieString += '; Secure';
    }
    cookieString += `; SameSite=${COOKIE_CONFIG.SAME_SITE}`;
    
    document.cookie = cookieString;
    console.log(`🍪 Cookie set: ${name}`);
    return true;
  } catch (error) {
    console.error('Error setting cookie:', error);
    return false;
  }
};

/**
 * Get a cookie value
 */
export const getCookie = (name) => {
  try {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        const value = decodeURIComponent(c.substring(nameEQ.length, c.length));
        console.log(`🍪 Cookie retrieved: ${name}`);
        return value;
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting cookie:', error);
    return null;
  }
};

/**
 * Delete a cookie
 */
export const deleteCookie = (name) => {
  try {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    console.log(`🍪 Cookie deleted: ${name}`);
    return true;
  } catch (error) {
    console.error('Error deleting cookie:', error);
    return false;
  }
};

/**
 * Set authentication token in cookie
 */
export const setAuthToken = (token) => {
  if (!token) {
    console.error('Cannot set empty token');
    return false;
  }
  
  // Also keep in localStorage as fallback
  localStorage.setItem('token', token);
  return setCookie(COOKIE_CONFIG.TOKEN_NAME, token);
};

/**
 * Get authentication token from cookie (with localStorage fallback)
 */
export const getAuthToken = () => {
  // Try cookie first
  let token = getCookie(COOKIE_CONFIG.TOKEN_NAME);
  
  // Fallback to localStorage
  if (!token) {
    token = localStorage.getItem('token');
    if (token) {
      console.log('🔄 Token found in localStorage, migrating to cookie');
      setAuthToken(token); // Migrate to cookie
    }
  }
  
  return token;
};

/**
 * Set user data in cookie
 */
export const setUserData = (userData) => {
  if (!userData) {
    console.error('Cannot set empty user data');
    return false;
  }
  
  try {
    const userString = JSON.stringify(userData);
    // Also keep in localStorage as fallback
    localStorage.setItem('user', userString);
    return setCookie(COOKIE_CONFIG.USER_NAME, userString);
  } catch (error) {
    console.error('Error setting user data:', error);
    return false;
  }
};

/**
 * Get user data from cookie (with localStorage fallback)
 */
export const getUserData = () => {
  // Try cookie first
  let userString = getCookie(COOKIE_CONFIG.USER_NAME);
  
  // Fallback to localStorage
  if (!userString) {
    userString = localStorage.getItem('user');
    if (userString) {
      console.log('🔄 User data found in localStorage, migrating to cookie');
      try {
        const userData = JSON.parse(userString);
        setUserData(userData); // Migrate to cookie
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        return null;
      }
    }
  }
  
  if (userString) {
    try {
      return JSON.parse(userString);
    } catch (error) {
      console.error('Error parsing user data from cookie:', error);
      return null;
    }
  }
  
  return null;
};

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  console.log('🧹 Clearing all authentication data');
  
  // Clear cookies
  deleteCookie(COOKIE_CONFIG.TOKEN_NAME);
  deleteCookie(COOKIE_CONFIG.USER_NAME);
  
  // Clear localStorage as fallback
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('cartItems');
  
  // Clear any session storage
  sessionStorage.removeItem('guestCart');
  
  return true;
};

/**
 * Check if user is authenticated (has valid token)
 */
export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

/**
 * Migrate existing localStorage auth data to cookies
 */
export const migrateAuthToCookies = () => {
  console.log('🔄 Migrating authentication data to cookies...');
  
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  let migrated = false;
  
  if (token && !getCookie(COOKIE_CONFIG.TOKEN_NAME)) {
    setAuthToken(token);
    migrated = true;
  }
  
  if (user && !getCookie(COOKIE_CONFIG.USER_NAME)) {
    try {
      const userData = JSON.parse(user);
      setUserData(userData);
      migrated = true;
    } catch (error) {
      console.error('Error migrating user data:', error);
    }
  }
  
  if (migrated) {
    console.log('✅ Authentication data migrated to cookies');
  }
  
  return migrated;
};
