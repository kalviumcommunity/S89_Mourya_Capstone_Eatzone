import { useContext, useState, useEffect, useCallback } from 'react';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import './Orders.css';
import { formatINR } from '../../utils/currencyUtils';

const Orders = () => {
  const { token, url } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user orders from API
  const fetchOrders = useCallback(async () => {
    if (!token) {
      setError('Please login to view your orders');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching orders with token:', token.substring(0, 10) + '...');

      const response = await axios.post(`${url}/api/order/userorders`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Orders response:', response.data);

      if (response.data.success) {
        // Sort orders by date in descending order (latest first) as backup
        const sortedOrders = (response.data.data || []).sort((a, b) => new Date(b.date) - new Date(a.date));
        setOrders(sortedOrders);
      } else {
        setError(response.data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        setError(error.response.data.message || 'Failed to fetch orders');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [token, url]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) {
    return (
      <div className="orders-container">
        <div className="orders-header">
          <h2>My Orders</h2>
        </div>
        <div className="orders-content">
          <div className="loading">
            <p>Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-container">
        <div className="orders-header">
          <h1>My Orders</h1>
        </div>
        <div className="orders-content">
          <div className="error">
            <p>Error: {error}</p>
            <button onClick={fetchOrders}>Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1>My Orders</h1>
      </div>

      <div className="orders-content">
        {orders.length > 0 ? (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-icon">
                  📦
                </div>
                <div className="order-details">
                  <div className="order-items-text">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, index) => (
                        <span key={item._id || index}>
                          {item.name}
                          {item.quantity > 1 && ` x ${item.quantity}`}
                          {index < order.items.length - 1 ? ', ' : ''}
                        </span>
                      ))
                    ) : (
                      'No items'
                    )}
                  </div>
                </div>
                <div className="order-amount">
                  {formatINR(order.amount || 0)}
                </div>
                <div className="order-items-count">
                  Items: {order.items ? order.items.reduce((total, item) => total + (item.quantity || 0), 0) : 0}
                </div>
                <div className="order-status">
                  <span className={`status-badge ${order.status ? order.status.toLowerCase().replace(/\s+/g, '-') : 'pending'}`}>
                    ● {order.status || 'Pending'}
                  </span>
                </div>
                <div className="order-actions">
                  <button className="track-order-btn">
                    Track Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-orders">
            <div className="no-orders-icon">📦</div>
            <h2>No Orders Yet</h2>
            <p>You haven't placed any orders yet. Start ordering your favorite food!</p>
            <button className="browse-menu-button" onClick={() => window.location.href = '/#explore-menu'}>
              Browse Menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
