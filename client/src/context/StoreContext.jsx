import { createContext, useState, useEffect } from "react";
import { food_list } from "../assets/assets";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const url = "http://localhost:4000";

  // Initialize token from localStorage
  const storedToken = localStorage.getItem("token");
  console.log("Initializing with token from localStorage:", storedToken ? "Token found" : "No token found");
  const [token, setToken] = useState(storedToken || "");

  // Initialize user from localStorage
  const storedUser = localStorage.getItem("user");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  console.log("Initializing with user from localStorage:", parsedUser ? parsedUser.name : "No user found");
  const [user, setUser] = useState(parsedUser);
  const [cartItems, setCartItems] = useState(() => {
    // Initialize cart from localStorage
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : {};
  });
  const [isCartLoading, setIsCartLoading] = useState(false);

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
  }, [cartItems, token, isCartLoading]);

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
        let itemInfo = food_list.find((product) => product._id === item);
        totalAmount += itemInfo.price * cartItems[item];
      }
    }
    return totalAmount;
  };

  // Function to fetch cart data from the server
  const fetchCartFromServer = async () => {
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

        // Get current local cart
        const localCart = { ...cartItems };
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
  };

  // Function to save cart data to the server
  const saveCartToServer = async (cartData) => {
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
  };

  // Add useEffect to handle token changes
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      // Fetch cart data when token is available
      fetchCartFromServer();
    } else {
      localStorage.removeItem("token");
      setUser(null);
      // We don't clear the cart when logged out anymore
      // This allows users to keep their cart when they log out and log back in
    }
  }, [token]);

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
    logout
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
