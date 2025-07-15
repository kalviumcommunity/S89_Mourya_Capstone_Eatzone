
import { createContext, useState, useEffect, useCallback } from "react";
import apiService from "../services/apiService";
import { food_list } from "../assets/assets";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  console.log('🏪 StoreContext initializing...')

  const url = "https://eatzone.onrender.com";

  // Initialize token from localStorage
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      console.log("🔄 Token found in localStorage");
      return storedToken;
    }
    return "";
  });

  // Initialize user from localStorage
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        console.log("🔄 User found in localStorage:", userData.name);
        return userData;
      }
    } catch (error) {
      console.error("Error parsing stored user data:", error);
    }
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
      if (response.success) {
        setFoodData(response.data);
        console.log('✅ Food data loaded:', response.data.length, 'items');
      }
    } catch (error) {
      console.error('❌ Error fetching food data:', error);
      setFoodData([]);
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

  // Fetch user profile function
  const fetchUserProfile = useCallback(async () => {
    if (!token) {
      console.log("No token available for fetching user profile");
      return null;
    }

    try {
      setIsUserLoading(true);
      console.log("🔄 Fetching user profile...");

      const response = await axios.get(`${url}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const userData = response.data.user;
        console.log("✅ User profile fetched:", userData.name);
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        return userData;
      } else {
        console.error("Failed to fetch user profile:", response.data.message);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cartItems");
  }, []);

  // Custom setToken function that also handles user data
  const setTokenAndUser = useCallback((newToken, userData = null) => {
    console.log("🔄 Setting token and user data:", newToken ? "Token provided" : "No token", userData ? `User: ${userData.name}` : "No user data");

    if (newToken) {
      setToken(newToken);
      localStorage.setItem("token", newToken);
      console.log("💾 Token saved to localStorage");

      if (userData) {
        console.log("👤 Setting user data immediately:", userData);
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        console.log("✅ Authentication complete - token and user data set");
      }
    } else {
      console.log("🧹 Clearing user data - no token");
      logout();
    }
  }, [logout]);

  // Auto-fetch user profile when token is available but user data is missing
  useEffect(() => {
    if (token && !user && !isUserLoading) {
      console.log("🔄 Auto-fetching user profile - token exists but no user data");
      fetchUserProfile();
    }
  }, [token, user, isUserLoading, fetchUserProfile]);

  // Initialize app on first load - load token and user from localStorage
  useEffect(() => {
    const initializeApp = () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      console.log("🚀 Initializing app on first load...");
      console.log("  - Stored token:", !!storedToken);
      console.log("  - Stored user:", !!storedUser);

      if (storedToken) {
        console.log("🔄 Setting token from localStorage");
        setToken(storedToken);

        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            console.log("🔄 Restoring user data from localStorage:", userData.name);
            setUser(userData);
          } catch (error) {
            console.error("Error parsing stored user data:", error);
            // If stored user data is corrupted, we'll fetch fresh data in the next effect
          }
        }
      }
    };

    initializeApp();
  }, []); // Run only once on app start

  // Auto-fetch user profile when token is available but user data is missing
  useEffect(() => {
    if (token && !user && !isUserLoading) {
      console.log("🔄 Token available but no user data - fetching from server");
      fetchUserProfile();
    }
  }, [token, user, isUserLoading, fetchUserProfile]);

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
