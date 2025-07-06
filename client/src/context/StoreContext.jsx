
import { createContext, useState, useEffect, useCallback } from "react";
import apiService from "../services/apiService";

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

  const contextValue = {
    token,
    setToken,
    user,
    setUser,
    cartItems,
    setCartItems,
    foodData,
    setFoodData,
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
