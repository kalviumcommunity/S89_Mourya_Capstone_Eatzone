
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
  const addToCart = (itemId) => {
    setCartItems((prev) => ({...prev, [itemId]: (prev[itemId] || 0) + 1}))
  }

  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const newCart = {...prev}
      if (newCart[itemId] > 1) {
        newCart[itemId] -= 1
      } else {
        delete newCart[itemId]
      }
      return newCart
    })
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
        headers: { token }
      });

      if (response.data.success) {
        const userData = response.data.data;
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

  // Load cart from server or localStorage
  const loadCart = useCallback(async () => {
    if (token && user?.id) {
      try {
        const response = await axios.post(`${url}/api/cart/get`, {}, {
          headers: { token }
        });
        if (response.data.success) {
          setCartItems(response.data.cartData || {});
        }
      } catch (error) {
        console.error("Error loading cart from server:", error);
      }
    } else {
      // Load from session storage for guest users
      const guestCart = sessionStorage.getItem('guestCart');
      if (guestCart) {
        try {
          setCartItems(JSON.parse(guestCart));
        } catch (error) {
          console.error("Error parsing guest cart:", error);
        }
      }
    }
  }, [token, user?.id, url]);

  // Save cart to server
  const saveCartToServer = useCallback(async (cartData) => {
    if (token && user?.id) {
      try {
        await axios.post(`${url}/api/cart/add`, { cartData }, {
          headers: { token }
        });
      } catch (error) {
        console.error("Error saving cart to server:", error);
      }
    }
  }, [token, user?.id, url]);

  // Load cart on mount and when user changes
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Auto-save cart when it changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (token && user?.id) {
        saveCartToServer(cartItems);
      } else {
        sessionStorage.setItem('guestCart', JSON.stringify(cartItems));
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [cartItems, token, user?.id, saveCartToServer]);

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
