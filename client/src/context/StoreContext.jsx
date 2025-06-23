import { createContext, useState, useEffect, useCallback } from "react";
import { food_list } from "../assets/assets";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  // Use environment variable for API URL with fallback
  const url = import.meta.env.VITE_API_BASE_URL || "https://eatzone.onrender.com";

  // Initialize token from localStorage
  const storedToken = localStorage.getItem("token");
  const [token, setToken] = useState(storedToken || "");

  // Initialize user state - try to get from localStorage first
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        console.log("🔄 Initializing user from localStorage:", userData);
        return userData;
      }
    } catch (error) {
      console.error("Error parsing stored user data:", error);
    }
    return null;
  });
  const [isUserLoading, setIsUserLoading] = useState(false);

  // Add dynamic food data state
  const [foodData, setFoodData] = useState([]);
  const [isFoodLoading, setIsFoodLoading] = useState(false);

  const [cartItems, setCartItems] = useState({});
  const [isCartLoading, setIsCartLoading] = useState(false);



  // Function to fetch food data from the server
  const fetchFoodData = useCallback(async () => {
    try {
      setIsFoodLoading(true);
      console.log("Fetching food data from server...");

      const response = await axios.get(`${url}/api/food/list`);
      console.log("Food data response:", response.data);

      if (response.data.success) {
        setFoodData(response.data.data);
        console.log("Food data fetched successfully:", response.data.data.length, "items");
      } else {
        console.error("Failed to fetch food data:", response.data.message);
        // Fallback to static food list
        setFoodData(food_list);
      }
    } catch (error) {
      console.error("Error fetching food data:", error);
      // Fallback to static food list
      setFoodData(food_list);
    } finally {
      setIsFoodLoading(false);
    }
  }, [url]);

  // Function to save cart data to the server
  const saveCartToServer = useCallback(async (cartData) => {
    if (!token || !user?.id) {
      return;
    }

    try {
      // Clean cart data before sending
      const cleanedCartData = {};
      Object.keys(cartData).forEach(itemId => {
        if (cartData[itemId] > 0) {
          cleanedCartData[itemId] = cartData[itemId];
        }
      });

      await axios.post(
        `${url}/api/cart/update`,
        { cartData: cleanedCartData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );
    } catch (error) {
      console.error("Error saving cart to server:", error.message);
    }
  }, [token, url, user]);

  // SECURITY: Remove automatic localStorage saving with user ID
  // Cart data should only be stored on server for authenticated users

  // Debounced cart sync - SECURE VERSION
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (token && user?.id) {
        // Only sync to server for authenticated users
        saveCartToServer(cartItems);
      } else {
        // For guest users, use session storage (more secure than localStorage)
        sessionStorage.setItem('guestCart', JSON.stringify(cartItems));
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [cartItems, token, user?.id, saveCartToServer]);

  const addToCart = (itemId) => {
    if (!itemId) {
      console.error("Invalid item ID");
      return;
    }

    setCartItems((prev) => {
      const newCart = { ...prev };
      newCart[itemId] = (newCart[itemId] || 0) + 1;
      return newCart;
    });
  };

  const removeFromCart = (itemId) => {
    if (!itemId) {
      console.error("Invalid item ID");
      return;
    }

    setCartItems((prev) => {
      const newCart = { ...prev };
      if (newCart[itemId] > 0) {
        newCart[itemId] -= 1;
        if (newCart[itemId] === 0) {
          delete newCart[itemId];
        }
      }
      return newCart;
    });
  };

  const clearCart = async () => {
    setCartItems({});

    if (token && user?.id) {
      try {
        await axios.post(`${url}/api/cart/clear`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error("Error clearing cart on server:", error);
      }
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        // First try to find in dynamic food data, then fallback to static food list
        let itemInfo = foodData.find((product) => product._id === item) ||
                      food_list.find((product) => product._id === item);

        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item];
        } else {
          console.warn(`Item with ID ${item} not found in food data`);
        }
      }
    }
    return totalAmount;
  };

  // Load cart from server or session storage - SECURE VERSION
  const loadCart = useCallback(async () => {
    // For authenticated users, load from server only
    if (token && user?.id) {
      try {
        console.log("Loading cart from server for authenticated user");
        const response = await axios.get(`${url}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        });

        if (response.data.success) {
          const serverCart = response.data.cartData || {};
          console.log("Server cart data loaded");
          setCartItems(serverCart);
        } else {
          setCartItems({});
        }
      } catch (error) {
        console.error("Error fetching cart from server:", error);
        setCartItems({});
      }
    } else {
      // For guest users, load from session storage only
      try {
        const savedCart = sessionStorage.getItem('guestCart');
        if (savedCart) {
          const localCart = JSON.parse(savedCart);
          console.log("Loaded guest cart from session storage");
          setCartItems(localCart);
        } else {
          setCartItems({});
        }
      } catch (error) {
        console.error("Error loading guest cart:", error);
        setCartItems({});
      }
    }
  }, [token, user?.id, url]);



  // Function to fetch user profile from the server
  const fetchUserProfile = useCallback(async () => {
    if (!token) {
      console.log("No token available, skipping user profile fetch");
      return null;
    }

    try {
      setIsUserLoading(true);
      console.log("Fetching user profile from server with token:", token.substring(0, 10) + "...");

      // Log the full token for debugging (remove in production)
      console.log("Full token:", token);

      // Try to connect to the server
      try {
        const response = await axios.get(`${url}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log("Server response for profile fetch:", response.data);

        if (response.data.success) {
          const userData = response.data.user;
          console.log("User profile fetched successfully:", userData);

          if (!userData.name) {
            console.warn("User profile is missing name property");
          }

          if (!userData.email) {
            console.warn("User profile is missing email property");
          }

          if (!userData.profileImage) {
            console.warn("User profile is missing profileImage property");
          }

          // Update user state with the fetched data
          setUser(userData);
          return userData;
        } else {
          console.error("Failed to fetch user profile:", response.data.message);
          return null;
        }
      } catch (serverError) {
        console.error("Server connection error:", serverError);

        // If server is not available, try to get user data from token
        try {
          console.log("Server not available, trying to decode token");

          // Parse the JWT token to get user data
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            try {
              // Base64 decode the payload
              const base64Url = tokenParts[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split('')
                  .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                  .join('')
              );

              const payload = JSON.parse(jsonPayload);
              console.log("Token payload:", payload);

              // Get user data from localStorage as fallback
              const storedUser = localStorage.getItem("user");
              if (storedUser) {
                try {
                  const userData = JSON.parse(storedUser);
                  console.log("Using user data from localStorage:", userData);
                  setUser(userData);
                  return userData;
                } catch (parseError) {
                  console.error("Error parsing user data from localStorage:", parseError);
                }
              }

              // If no user data in localStorage, create minimal user data from token
              if (payload.id) {
                const minimalUserData = {
                  id: payload.id,
                  name: "User", // Default name
                  email: "" // Default email
                };
                console.log("Created minimal user data from token:", minimalUserData);
                setUser(minimalUserData);
                return minimalUserData;
              }
            } catch (decodeError) {
              console.error("Error decoding token payload:", decodeError);
            }
          }
        } catch (tokenError) {
          console.error("Error decoding token:", tokenError);
        }

        return null;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
      return null;
    } finally {
      setIsUserLoading(false);
    }
  }, [token, url]);

  // Add useEffect to fetch food data on component mount and clean up old data
  useEffect(() => {
    // Clean up old generic cart data on app start
    const oldCartData = localStorage.getItem("cartItems");
    if (oldCartData) {
      console.log("Removing old generic cart data for security");
      localStorage.removeItem("cartItems");
    }

    fetchFoodData();

    // Load initial cart
    loadCart();
  }, []);

  // Function to clear cart data for user isolation - SECURE VERSION
  const clearUserData = useCallback(() => {
    console.log("🧹 Clearing all user data");
    setCartItems({});
    setUser(null);
    setToken("");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Clear all cart-related storage
    localStorage.removeItem("cartItems");
    sessionStorage.removeItem("guestCart");
    // Clear any user-specific cart data that might exist
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('cartItems_')) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  // Custom setToken function that also handles user data
  const setTokenAndUser = useCallback((newToken, userData = null) => {
    console.log("🔄 Setting token and user data:", newToken ? "Token provided" : "No token", userData ? `User: ${userData.name}` : "No user data");

    if (newToken) {
      // Set token first
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
      clearUserData();
    }
  }, [clearUserData]);

  // Add useEffect to handle token changes (for cases where token is set without user data)
  useEffect(() => {
    console.log("🔍 Token changed:", token ? "Token exists" : "No token");
    console.log("🔄 Current user state:", user ? `User: ${user.name}` : "No user");

    if (token && !user) {
      // Only fetch if we have token but no user data
      console.log("🔍 Token exists but no user data - fetching user profile");
      fetchUserProfile()
        .then(userData => {
          console.log("✅ User profile fetch result:", userData ? `Success - ${userData.name}` : "Failed");
          if (userData) {
            console.log("👤 User data set in context:", userData);
          }
        })
        .catch(error => {
          console.error("❌ Error fetching user profile after token change:", error);
        });
    }
    // Note: Removed the clearUserData call from here to prevent infinite loops
  }, [token, user, fetchUserProfile]);

  // Load cart when user changes or on initial load
  useEffect(() => {
    loadCart();
  }, [user?.id, loadCart]);

  // Add logout function
  const logout = useCallback(() => {
    console.log("Logging out user:", user?.id);
    clearUserData();
  }, [clearUserData, user?.id]);

  const contextValue = {
    food_list,
    foodData,
    isFoodLoading,
    fetchFoodData,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalCartAmount,
    isCartLoading,
    loadCart,
    saveCartToServer,
    url,
    token,
    setToken,
    setTokenAndUser, // Export the custom function for proper auth handling
    user,
    setUser,
    isUserLoading,
    fetchUserProfile,
    logout,
    clearUserData
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
