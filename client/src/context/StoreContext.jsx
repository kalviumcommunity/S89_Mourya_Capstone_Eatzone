import { createContext, useState, useEffect, useCallback } from "react";
import { food_list } from "../assets/assets";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  // Use full server URL for API calls
  const url = "http://localhost:4000";

  // Initialize token from localStorage
  const storedToken = localStorage.getItem("token");
  const [token, setToken] = useState(storedToken || "");

  // Initialize user state (will be fetched from server if token exists)
  const [user, setUser] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(false);

  // Add dynamic food data state
  const [foodData, setFoodData] = useState([]);
  const [isFoodLoading, setIsFoodLoading] = useState(false);

  const [cartItems, setCartItems] = useState(() => {
    // Initialize cart from localStorage
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : {};
  });
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
    if (!token) {
      console.log("No token available, skipping cart sync with server");
      return;
    }

    try {
      console.log("Saving cart to server:", JSON.stringify(cartData));
      console.log("Using token:", token.substring(0, 10) + "...");

      const response = await axios.post(
        `${url}/api/cart/update`,
        { cartData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Server response:", response.data);

      if (response.data.success) {
        console.log("Cart successfully saved to server");
      } else {
        console.error("Failed to save cart:", response.data.message);
      }
    } catch (error) {
      console.error("Error saving cart:", error.response ? error.response.data : error.message);
    }
  }, [token, url]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // Add useEffect to sync cart changes with the server
  useEffect(() => {
    // Skip initial render and only sync when we have a token
    if (token && !isCartLoading && Object.keys(cartItems).length > 0) {
      // Only sync non-empty carts
      console.log("Cart changed, syncing with server...");
      saveCartToServer(cartItems);
    }
  }, [cartItems, token, isCartLoading, saveCartToServer]);

  const addToCart = (itemId) => {
    if (!cartItems[itemId]) {
      setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }
    // Server sync is handled by the useEffect
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    // Server sync is handled by the useEffect
  };

  const clearCart = async () => {
    if (!token) {
      setCartItems({});
      return;
    }

    try {
      const response = await axios.post(`${url}/api/cart/clear`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setCartItems({});
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
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

  // Function to fetch cart data from the server
  const fetchCartFromServer = useCallback(async () => {
    if (!token) {
      console.log("No token available, skipping cart fetch from server");
      return;
    }

    try {
      console.log("Fetching cart from server with token:", token.substring(0, 10) + "...");
      setIsCartLoading(true);

      const response = await axios.get(`${url}/api/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("Server response for cart fetch:", response.data);

      if (response.data.success) {
        const serverCart = response.data.cartData;
        console.log("Server cart data:", JSON.stringify(serverCart));

        // Get current local cart from localStorage to avoid dependency issues
        const savedCart = localStorage.getItem("cartItems");
        const localCart = savedCart ? JSON.parse(savedCart) : {};
        console.log("Local cart data:", JSON.stringify(localCart));

        // Merge server cart with local cart
        // If an item exists in both, use the higher quantity
        const mergedCart = { ...serverCart };

        Object.keys(localCart).forEach(itemId => {
          if (localCart[itemId] > 0) {
            if (mergedCart[itemId]) {
              // Item exists in both carts, use the higher quantity
              mergedCart[itemId] = Math.max(mergedCart[itemId], localCart[itemId]);
            } else {
              // Item only exists in local cart
              mergedCart[itemId] = localCart[itemId];
            }
          }
        });

        console.log("Merged cart data:", JSON.stringify(mergedCart));

        // Update cart with merged data
        setCartItems(mergedCart);

        // If we merged items, save the merged cart back to the server
        if (JSON.stringify(mergedCart) !== JSON.stringify(serverCart)) {
          console.log("Cart data changed after merging, saving back to server");
          saveCartToServer(mergedCart);
        } else {
          console.log("No changes to cart after merging, skipping save to server");
        }
      } else {
        console.error("Failed to fetch cart:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching cart:", error.response ? error.response.data : error.message);
    } finally {
      setIsCartLoading(false);
    }
  }, [token, url]);



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

  // Add useEffect to fetch food data on component mount
  useEffect(() => {
    fetchFoodData();
  }, [fetchFoodData]);

  // Add useEffect to handle token changes
  useEffect(() => {
    console.log("Token changed:", token ? "Token exists" : "No token");

    if (token) {
      localStorage.setItem("token", token);
      console.log("Token saved to localStorage");

      // Fetch user profile when token is available
      console.log("Fetching user profile after token change");
      fetchUserProfile()
        .then(userData => {
          console.log("User profile fetch result:", userData ? "Success" : "Failed");
        })
        .catch(error => {
          console.error("Error fetching user profile after token change:", error);
        });

      // Fetch cart data when token is available
      fetchCartFromServer()
        .then(cartData => {
          // Cart data fetched successfully
        })
        .catch(error => {
          console.error("Error fetching cart data");
        });
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user"); // Remove user from localStorage
      setUser(null);
      // We don't clear the cart when logged out anymore
      // This allows users to keep their cart when they log out and log back in
    }
  }, [token, fetchUserProfile, fetchCartFromServer]);

  // Add logout function
  const logout = () => {
    // We don't clear the cart items when logging out
    // This allows users to keep their cart when they log out and log back in
    // The cart will be synced with the server when they log back in

    setToken("");
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

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
    fetchCartFromServer,
    saveCartToServer,
    url,
    token,
    setToken,
    user,
    setUser,
    isUserLoading,
    fetchUserProfile,
    logout
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
