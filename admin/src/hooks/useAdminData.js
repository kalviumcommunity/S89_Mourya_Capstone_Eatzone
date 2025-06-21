import { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';

const useAdminData = () => {
  const { currentUser, adminData } = useFirebaseAuth();
  const [loading, setLoading] = useState(false);
  const [foodItems, setFoodItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [statistics, setStatistics] = useState({
    totalFoodItems: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  });

  // Fetch paginated food items
  const fetchFoodItems = async (page = 1, limit = 10) => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://eatzone.onrender.com';
      const response = await fetch(
        `${apiUrl}/api/admin/food-items/${currentUser.uid}?page=${page}&limit=${limit}`
      );
      const data = await response.json();

      if (data.success) {
        setFoodItems(data.foodItems);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching food items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch paginated orders
  const fetchOrders = async (page = 1, limit = 10) => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:4000/api/admin/orders/${currentUser.uid}?page=${page}&limit=${limit}`
      );
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add food item with admin association
  const addFoodItem = async (formData) => {
    if (!currentUser) return { success: false, message: 'Not authenticated' };

    try {
      // Add Firebase UID to form data
      formData.append('firebaseUID', currentUser.uid);

      const response = await fetch('http://localhost:4000/api/admin/food/add', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh food items list
        await fetchFoodItems();
      }

      return result;
    } catch (error) {
      console.error('Error adding food item:', error);
      return { success: false, message: 'Error adding food item' };
    }
  };

  // Update food item with admin verification
  const updateFoodItem = async (id, formData) => {
    if (!currentUser) return { success: false, message: 'Not authenticated' };

    try {
      // Add Firebase UID and ID to form data
      formData.append('firebaseUID', currentUser.uid);
      formData.append('id', id);

      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://eatzone.onrender.com';
      const response = await fetch(`${apiUrl}/api/admin/food/update`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh food items list
        await fetchFoodItems();
      }

      return result;
    } catch (error) {
      console.error('Error updating food item:', error);
      return { success: false, message: 'Error updating food item' };
    }
  };

  // Remove food item with admin verification
  const removeFoodItem = async (id) => {
    if (!currentUser) return { success: false, message: 'Not authenticated' };

    try {
      const response = await fetch('http://localhost:4000/api/admin/food/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          firebaseUID: currentUser.uid
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh food items list
        await fetchFoodItems();
      }

      return result;
    } catch (error) {
      console.error('Error removing food item:', error);
      return { success: false, message: 'Error removing food item' };
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, status) => {
    if (!currentUser) return { success: false, message: 'Not authenticated' };

    try {
      const response = await fetch('http://localhost:4000/api/admin/order/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          status,
          firebaseUID: currentUser.uid
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh orders list
        await fetchOrders();
      }

      return result;
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, message: 'Error updating order status' };
    }
  };

  // Load initial data when admin data is available
  useEffect(() => {
    if (adminData && currentUser) {
      setFoodItems(adminData.foodItems || []);
      setOrders(adminData.orders || []);
      setStatistics(adminData.statistics || {
        totalFoodItems: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0
      });
    }
  }, [adminData, currentUser]);

  return {
    loading,
    foodItems,
    orders,
    statistics,
    pagination,
    fetchFoodItems,
    fetchOrders,
    addFoodItem,
    updateFoodItem,
    removeFoodItem,
    updateOrderStatus,
    // Helper functions
    hasData: foodItems.length > 0 || orders.length > 0,
    isEmpty: foodItems.length === 0 && orders.length === 0
  };
};

export default useAdminData;
