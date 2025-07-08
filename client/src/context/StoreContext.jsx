
import { createContext, useState, useEffect, useCallback } from "react";
import apiService from "../services/apiService";
import { food_list } from "../assets/assets";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  console.log('🏪 StoreContext initializing...')

  const url = "https://eatzone.onrender.com";
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState({});
  const [foodData, setFoodData] = useState([]);
  const [isFoodLoading, setIsFoodLoading] = useState(false);

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

  const contextValue = {
    token,
    setToken,
    user,
    setUser,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
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
