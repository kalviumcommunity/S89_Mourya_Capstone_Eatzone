
import { createContext, useState, useEffect, useCallback } from "react";
import apiService from "../services/apiService";
import { food_list } from "../assets/assets";
import axios from "axios";
import {
  getAuthToken,
  setAuthToken,
  getUserData,
  setUserData,
  clearAuthData,
  isAuthenticated,
  migrateAuthToCookies
} from "../utils/cookieUtils";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  console.log('🏪 StoreContext initializing with cookie-based authentication...')

  const url = "https://eatzone.onrender.com";

  // Initialize token from cookies (with localStorage fallback)
  const [token, setToken] = useState(() => {
    // First, try to migrate any existing localStorage data to cookies
    migrateAuthToCookies();

    // Get token from cookies
    const storedToken = getAuthToken();
    if (storedToken) {
      console.log("🍪 Token found in cookies:", storedToken.substring(0, 20) + "...");
      console.log("🔍 Token length:", storedToken.length);

      // Basic token validation
      try {
        const parts = storedToken.split('.');
        if (parts.length === 3) {
          console.log("✅ Token format appears valid (3 parts)");
        } else {
          console.log("❌ Invalid token format - not a JWT");
        }
      } catch (error) {
        console.log("❌ Error checking token format:", error);
      }

      return storedToken;
    }
    console.log("📭 No token found in cookies or localStorage");
    return "";
  });

  // Initialize user from cookies (with localStorage fallback)
  const [user, setUser] = useState(() => {
    try {
      const userData = getUserData();
      if (userData) {
        console.log("🍪 User found in cookies:", userData.name);
        return userData;
      }
    } catch (error) {
      console.error("Error getting user data from cookies:", error);
    }
    console.log("📭 No user data found in cookies or localStorage");
    return null;
  });

  const [cartItems, setCartItems] = useState({});
  const [foodData, setFoodData] = useState([]);
  const [isFoodLoading, setIsFoodLoading] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(false);

  // Simple function to fetch food data
  const fetchFoodData = useCallback(async () => {
    try {
      setIsFoodLoading(true);
      const response = await apiService.getFoodList();
      if (response.success && response.data && response.data.length > 0) {
        setFoodData(response.data);
        console.log('✅ Food data loaded from API:', response.data.length, 'items');
      } else {
        console.log('⚠️ API returned no food data, using static fallback');
        setFoodData(food_list);
      }
    } catch (error) {
      console.error('❌ Error fetching food data, using static fallback:', error);
      setFoodData(food_list);
    } finally {
      setIsFoodLoading(false);
    }
  }, []);

  // Load food data on mount
  useEffect(() => {
    fetchFoodData();
  }, [fetchFoodData]);

  // Add cart functions
  const addToCart = async (itemId) => {
    console.log("🛒 Adding item to cart:", itemId);
    const newCartItems = {...cartItems, [itemId]: (cartItems[itemId] || 0) + 1};
    setCartItems(newCartItems);

    // Immediately save to server if user is authenticated
    if (token && user?.id) {
      try {
        console.log("💾 Immediately saving cart to server after add");
        await saveCartToServer(newCartItems);
      } catch (error) {
        console.error("❌ Error saving cart after add:", error);
      }
    } else {
      // Save to session storage for guest users
      console.log("💾 Saving cart to session storage (guest user)");
      sessionStorage.setItem('guestCart', JSON.stringify(newCartItems));
    }
  }

  const removeFromCart = async (itemId) => {
    console.log("🛒 Removing item from cart:", itemId);
    const newCartItems = {...cartItems};
    if (newCartItems[itemId] > 1) {
      newCartItems[itemId] -= 1;
    } else {
      delete newCartItems[itemId];
    }
    setCartItems(newCartItems);

    // Immediately save to server if user is authenticated
    if (token && user?.id) {
      try {
        console.log("💾 Immediately saving cart to server after remove");
        await saveCartToServer(newCartItems);
      } catch (error) {
        console.error("❌ Error saving cart after remove:", error);
      }
    } else {
      // Save to session storage for guest users
      console.log("💾 Saving cart to session storage (guest user)");
      sessionStorage.setItem('guestCart', JSON.stringify(newCartItems));
    }
  }

  const getTotalCartAmount = () => {
    let totalAmount = 0
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = foodData.find((product) => product._id === item)
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item]
        }
      }
    }
    return totalAmount
  }

  // Fetch user profile function with token validation
  const fetchUserProfile = useCallback(async () => {
    if (!token) {
      console.log("No token available for fetching user profile");
      return null;
    }

    try {
      setIsUserLoading(true);
      console.log("🔄 Fetching user profile and validating token...");

      const response = await axios.get(`${url}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000 // 10 second timeout
      });

      if (response.data.success) {
        const userData = response.data.user;
        console.log("✅ User profile fetched and token validated:", userData.name);
        setUser(userData);
        setUserData(userData); // Save to cookies
        return userData;
      } else {
        console.error("❌ Failed to fetch user profile:", response.data.message);
        // If the server says the request failed, the token might be invalid
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("❌ Error fetching user profile:", error);

      // Check if it's an authentication error
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log("🔒 Authentication failed - token is invalid or expired");
        // Don't call logout here to avoid infinite loops, just return null
        // The calling function will handle the logout
        throw new Error("INVALID_TOKEN");
      }

      // For other errors (network, server), don't invalidate the token
      console.log("🌐 Network or server error, keeping token for retry");
      return null;
    } finally {
      setIsUserLoading(false);
    }
  }, [token, url]);

  // Logout function
  const logout = useCallback(() => {
    console.log("🚪 Logging out user");
    setToken("");
    setUser(null);
    setCartItems({});
    clearAuthData(); // Clear cookies and localStorage
  }, []);

  // Custom setToken function that also handles user data
  const setTokenAndUser = useCallback((newToken, userData = null) => {
    console.log("🔄 Setting token and user data:", newToken ? "Token provided" : "No token", userData ? `User: ${userData.name}` : "No user data");

    if (newToken) {
      setToken(newToken);
      setAuthToken(newToken); // Save to cookies
      console.log("🍪 Token saved to cookies");

      if (userData) {
        console.log("👤 Setting user data immediately:", userData);
        setUser(userData);
        setUserData(userData); // Save to cookies
        console.log("✅ Authentication complete - token and user data saved to cookies");
      }
    } else {
      console.log("🧹 Clearing user data - no token");
      logout();
    }
  }, [logout]);

  // Validate token and fetch user profile when token is available
  useEffect(() => {
    const validateTokenAndFetchUser = async () => {
      if (token && !user && !isUserLoading) {
        console.log("🔄 Validating token and fetching user profile...");
        console.log("🔍 Current token:", token.substring(0, 20) + "...");

        try {
          // Try to fetch user profile to validate token
          const userData = await fetchUserProfile();

          if (!userData) {
            console.log("❌ Token validation failed - no user data returned");
            // Don't immediately logout, might be a network issue
            console.log("⏳ Keeping token for potential retry");
          } else {
            console.log("✅ Token validated successfully, user data loaded:", userData.name);
          }
        } catch (error) {
          console.error("❌ Token validation error:", error);

          // Only logout if it's specifically an authentication error
          if (error.message === "INVALID_TOKEN") {
            console.log("🔒 Invalid token detected - logging out");
            logout();
          } else {
            console.log("🌐 Network/server error - keeping token for retry");
          }
        }
      }
    };

    // Add a small delay to avoid rapid API calls on app startup
    const timeoutId = setTimeout(validateTokenAndFetchUser, 500);
    return () => clearTimeout(timeoutId);
  }, [token, user, isUserLoading, fetchUserProfile, logout]);

  // Initialize app on first load - validate stored token from cookies
  useEffect(() => {
    const initializeApp = async () => {
      // Migrate any existing localStorage data to cookies
      migrateAuthToCookies();

      const storedToken = getAuthToken();
      const storedUser = getUserData();

      console.log("🚀 Initializing app on first load...");
      console.log("  - Stored token:", !!storedToken);
      console.log("  - Stored user:", !!storedUser);

      if (storedToken) {
        console.log("🔄 Found stored token in cookies, validating...");

        // Set token first (this will trigger the validation effect above)
        setToken(storedToken);

        // Try to restore user data from cookies
        if (storedUser) {
          console.log("🔄 Restoring user data from cookies:", storedUser.name);
          setUser(storedUser);
        }
      } else {
        console.log("📭 No stored token found in cookies");
      }
    };

    initializeApp();
  }, []); // Run only once on app start

  // Listen for storage changes and periodically check cookies (for cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e) => {
      console.log("🔄 Storage changed:", e.key, e.newValue ? "Set" : "Removed");

      // Handle localStorage changes (fallback)
      if (e.key === 'token') {
        if (e.newValue && e.newValue !== token) {
          console.log("🔄 Token updated in another tab, syncing...");
          setToken(e.newValue);
          setAuthToken(e.newValue); // Sync to cookies
        } else if (!e.newValue && token) {
          console.log("🔄 Token removed in another tab, logging out...");
          logout();
        }
      }

      if (e.key === 'user') {
        if (e.newValue) {
          try {
            const userData = JSON.parse(e.newValue);
            console.log("🔄 User data updated in another tab, syncing...");
            setUser(userData);
            setUserData(userData); // Sync to cookies
          } catch (error) {
            console.error("Error parsing user data from storage event:", error);
          }
        } else if (!e.newValue && user) {
          console.log("🔄 User data removed in another tab, clearing...");
          setUser(null);
        }
      }
    };

    // Check for cookie changes periodically (since cookies don't have storage events)
    const checkCookieChanges = () => {
      const cookieToken = getAuthToken();
      const cookieUser = getUserData();

      if (cookieToken !== token) {
        console.log("🍪 Cookie token changed, syncing...");
        setToken(cookieToken || "");
      }

      if (JSON.stringify(cookieUser) !== JSON.stringify(user)) {
        console.log("🍪 Cookie user data changed, syncing...");
        setUser(cookieUser);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Check cookies every 5 seconds for cross-tab sync
    const cookieCheckInterval = setInterval(checkCookieChanges, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(cookieCheckInterval);
    };
  }, [token, user, logout]);

  // Load cart from server or localStorage
  const loadCart = useCallback(async () => {
    console.log("🔄 Loading cart - token:", !!token, "user:", !!user, "user.id:", user?.id);

    if (token && user?.id) {
      try {
        console.log("🔄 Loading cart from server for user:", user.id, "with token:", token.substring(0, 20) + "...");
        const response = await axios.post(`${url}/api/cart/get`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("🔄 Server response:", response.data);
        if (response.data.success) {
          console.log("✅ Cart loaded from server:", response.data.cartData);
          console.log("✅ Setting cart items to:", response.data.cartData || {});
          setCartItems(response.data.cartData || {});
        } else {
          console.log("❌ Failed to load cart from server:", response.data.message);
          // If cart loading fails, set empty cart instead of keeping old data
          setCartItems({});
        }
      } catch (error) {
        console.error("❌ Error loading cart from server:", error);
        console.error("❌ Error details:", error.response?.data || error.message);
        // If cart loading fails, set empty cart instead of keeping old data
        setCartItems({});
      }
    } else if (!token && !user) {
      console.log("👤 Loading cart from session storage (guest user)");
      // Load from session storage for guest users
      const guestCart = sessionStorage.getItem('guestCart');
      if (guestCart) {
        try {
          const parsedCart = JSON.parse(guestCart);
          console.log("✅ Guest cart loaded:", parsedCart);
          setCartItems(parsedCart);
        } catch (error) {
          console.error("❌ Error parsing guest cart:", error);
          setCartItems({});
        }
      } else {
        console.log("📭 No guest cart found in session storage");
        setCartItems({});
      }
    } else {
      console.log("⏳ Skipping cart load - waiting for authentication to complete");
      console.log("⏳ Current state - token:", !!token, "user:", !!user);
      // Don't change cart state if we're in an intermediate authentication state
    }
  }, [token, user, url]);

  // Save cart to server
  const saveCartToServer = useCallback(async (cartData) => {
    console.log("💾 Saving cart to server - token:", !!token, "user:", !!user, "user.id:", user?.id);
    console.log("💾 Cart data to save:", cartData);

    if (token && user?.id) {
      try {
        console.log("🔄 Sending cart data to server for user:", user.id);
        const response = await axios.post(`${url}/api/cart/add`, { cartData }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("✅ Cart saved to server successfully:", response.data);
      } catch (error) {
        console.error("❌ Error saving cart to server:", error);
      }
    } else {
      console.log("⚠️ Cannot save to server - missing token or user ID");
    }
  }, [token, user, url]);

  // Load cart when authentication state changes
  useEffect(() => {
    console.log("🔄 Authentication state changed - token:", !!token, "user:", !!user, "user.id:", user?.id);
    loadCart();
  }, [loadCart, token, user, url]); // Include all dependencies

  // Note: Cart is now saved immediately in addToCart and removeFromCart functions

  // Clear cart function
  const clearCart = useCallback(async () => {
    setCartItems({});

    if (token && user?.id) {
      try {
        await axios.post(`${url}/api/cart/clear`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error("Error clearing cart on server:", error);
      }
    } else {
      // Clear guest cart from session storage
      sessionStorage.removeItem('guestCart');
    }
  }, [token, user?.id, url]);

  const contextValue = {
    token,
    setToken,
    setTokenAndUser,
    user,
    setUser,
    isUserLoading,
    fetchUserProfile,
    logout,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalCartAmount,
    loadCart,
    saveCartToServer,
    foodData,
    setFoodData,
    food_list, // Static fallback food list
    isFoodLoading,
    fetchFoodData,
    url
  };

  console.log('✅ StoreContext ready')

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
