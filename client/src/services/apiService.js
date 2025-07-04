import axios from 'axios';
import { cachedFetch, preloadCache, invalidateCache } from '../utils/cache';
import performanceMonitor from '../utils/performance';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://eatzone.onrender.com";

// Cache TTL configurations (in milliseconds)
const CACHE_TTL = {
  FOOD_LIST: 10 * 60 * 1000,      // 10 minutes
  RESTAURANTS: 15 * 60 * 1000,    // 15 minutes  
  CATEGORIES: 30 * 60 * 1000,     // 30 minutes
  USER_CART: 2 * 60 * 1000,       // 2 minutes
  USER_ORDERS: 5 * 60 * 1000      // 5 minutes
};

/**
 * API Service with caching and parallel request support
 */
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    
    // Create axios instance with default config
    this.axios = axios.create({
      baseURL: this.baseURL,
      timeout: 10000, // 10 seconds timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor for auth
    this.axios.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.axios.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Fetch food list with caching
   */
  async getFoodList() {
    return performanceMonitor.monitorApiCall(
      'GET /api/food/list',
      cachedFetch(
        'food-list',
        async () => {
          const response = await this.axios.get('/api/food/list');
          return response.data;
        },
        CACHE_TTL.FOOD_LIST
      )
    );
  }

  /**
   * Fetch restaurants with caching
   */
  async getRestaurants() {
    return performanceMonitor.monitorApiCall(
      'GET /api/restaurant/list',
      cachedFetch(
        'restaurants',
        async () => {
          const response = await this.axios.get('/api/restaurant/list');
          return response.data;
        },
        CACHE_TTL.RESTAURANTS
      )
    );
  }

  /**
   * Fetch categories with caching
   */
  async getCategories() {
    return cachedFetch(
      'categories',
      async () => {
        const response = await this.axios.get('/api/category/list');
        return response.data;
      },
      CACHE_TTL.CATEGORIES
    );
  }

  /**
   * Fetch user cart with caching
   */
  async getUserCart(token) {
    if (!token) return { success: false, message: 'No token provided' };
    
    return cachedFetch(
      `user-cart-${token}`,
      async () => {
        const response = await this.axios.get('/api/cart/get');
        return response.data;
      },
      CACHE_TTL.USER_CART
    );
  }

  /**
   * Fetch user orders with caching
   */
  async getUserOrders(token) {
    if (!token) return { success: false, message: 'No token provided' };
    
    return cachedFetch(
      `user-orders-${token}`,
      async () => {
        const response = await this.axios.get('/api/order/userorders');
        return response.data;
      },
      CACHE_TTL.USER_ORDERS
    );
  }

  /**
   * Fetch all home page data in parallel
   */
  async getHomePageData() {
    console.log('🚀 Fetching home page data in parallel...');
    
    try {
      const [foodData, restaurantData, categoryData] = await Promise.allSettled([
        this.getFoodList(),
        this.getRestaurants(),
        this.getCategories()
      ]);

      const result = {
        food: foodData.status === 'fulfilled' ? foodData.value : { success: false, error: foodData.reason },
        restaurants: restaurantData.status === 'fulfilled' ? restaurantData.value : { success: false, error: restaurantData.reason },
        categories: categoryData.status === 'fulfilled' ? categoryData.value : { success: false, error: categoryData.reason }
      };

      console.log('✅ Home page data fetched:', {
        food: result.food.success ? `${result.food.data?.length || 0} items` : 'failed',
        restaurants: result.restaurants.success ? `${result.restaurants.data?.length || 0} items` : 'failed',
        categories: result.categories.success ? `${result.categories.data?.length || 0} items` : 'failed'
      });

      return result;
    } catch (error) {
      console.error('❌ Error fetching home page data:', error);
      throw error;
    }
  }

  /**
   * Preload critical data
   */
  async preloadCriticalData() {
    console.log('🚀 Preloading critical data...');
    
    // Preload in parallel without waiting
    Promise.allSettled([
      preloadCache('food-list', () => this.axios.get('/api/food/list').then(r => r.data), CACHE_TTL.FOOD_LIST),
      preloadCache('restaurants', () => this.axios.get('/api/restaurant/list').then(r => r.data), CACHE_TTL.RESTAURANTS),
      preloadCache('categories', () => this.axios.get('/api/category/list').then(r => r.data), CACHE_TTL.CATEGORIES)
    ]).then(() => {
      console.log('✅ Critical data preloaded');
    }).catch((error) => {
      console.error('❌ Error preloading data:', error);
    });
  }

  /**
   * Update cart on server (invalidates cache)
   */
  async updateCart(cartData, token) {
    if (!token) throw new Error('No token provided');
    
    try {
      const response = await this.axios.post('/api/cart/update', { cartData });
      
      // Invalidate cart cache
      invalidateCache(`user-cart-${token}`);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error updating cart:', error);
      throw error;
    }
  }

  /**
   * Place order (invalidates relevant caches)
   */
  async placeOrder(orderData, token) {
    if (!token) throw new Error('No token provided');
    
    try {
      const response = await this.axios.post('/api/order/place', orderData);
      
      // Invalidate relevant caches
      invalidateCache(`user-cart-${token}`);
      invalidateCache(`user-orders-${token}`);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error placing order:', error);
      throw error;
    }
  }

  /**
   * Clear all caches (useful for logout)
   */
  clearAllCaches() {
    invalidateCache(/.*/);
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
