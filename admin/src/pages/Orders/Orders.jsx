import { useEffect, useState, useCallback } from 'react';
import './Orders.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets';

// Currency utilities for INR
const formatINR = (amount) => `₹${amount}`;

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingOrder, setEditingOrder] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchAllOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${url}/api/order/list`);
      if (response.data.success) {
        // Sort orders by date in descending order (latest first) as backup
        const sortedOrders = (response.data.data || []).sort((a, b) => new Date(b.date) - new Date(a.date));
        setOrders(sortedOrders);
      } else {
        toast.error(response.data.message || 'Failed to load orders');
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || 'An error occurred while fetching orders');
    } finally {
      setLoading(false);
    }
  }, [url]);

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(url + "/api/order/status", { orderId, status: event.target.value });
      if (response.data.success) {
        toast.success("Status updated successfully");
        fetchAllOrders();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("An error occurred while updating status");
    }
  }

  const deleteHandler = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      try {
        const response = await axios.post(url + "/api/order/delete", { orderId });
        if (response.data.success) {
          toast.success("Order deleted successfully");
          fetchAllOrders();
        } else {
          toast.error(response.data.message || "Failed to delete order");
        }
      } catch (error) {
        console.error("Error deleting order:", error);
        toast.error("An error occurred while deleting order");
      }
    }
  }

  const editHandler = (order) => {
    setEditingOrder({
      _id: order._id,
      status: order.status,
      amount: order.amount,
      address: { ...order.address }
    });
    setShowEditModal(true);
  }

  const saveEditHandler = async () => {
    try {
      const response = await axios.post(url + "/api/order/edit", {
        orderId: editingOrder._id,
        status: editingOrder.status,
        amount: editingOrder.amount,
        address: editingOrder.address
      });
      if (response.data.success) {
        toast.success("Order updated successfully");
        setShowEditModal(false);
        setEditingOrder(null);
        fetchAllOrders();
      } else {
        toast.error(response.data.message || "Failed to update order");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("An error occurred while updating order");
    }
  }

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  // Filter orders based on status
  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'all') return true;
    return order.status.toLowerCase().replace(' ', '_') === statusFilter;
  });

  // Calculate stats
  const stats = {
    total: orders.length,
    processing: orders.filter(o => o.status === 'Food Processing').length,
    delivery: orders.filter(o => o.status === 'Out for delivery').length,
    delivered: orders.filter(o => o.status === 'Delivered').length
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Food Processing':
        return 'processing';
      case 'Out for delivery':
        return 'delivery';
      case 'Delivered':
        return 'delivered';
      default:
        return 'processing';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="orders">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders">
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Orders Management</h2>
            <p className="card-subtitle">Track and manage customer orders</p>
          </div>
        </div>

        {/* Stats */}
        <div className="orders-stats">
          <div className="orders-stat-card">
            <div className="stat-icon total">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              </svg>
            </div>
            <div className="stat-info">
              <h3>{stats.total}</h3>
              <p>Total Orders</p>
            </div>
          </div>

          <div className="orders-stat-card">
            <div className="stat-icon processing">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12,6 12,12 16,14"></polyline>
              </svg>
            </div>
            <div className="stat-info">
              <h3>{stats.processing}</h3>
              <p>Processing</p>
            </div>
          </div>

          <div className="orders-stat-card">
            <div className="stat-icon delivery">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 3h15l-1 9H2l2-7z"></path>
                <path d="M16 8v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8"></path>
              </svg>
            </div>
            <div className="stat-info">
              <h3>{stats.delivery}</h3>
              <p>Out for Delivery</p>
            </div>
          </div>

          <div className="orders-stat-card">
            <div className="stat-icon delivered">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9,11 12,14 22,4"></polyline>
                <path d="M21,12v7a2,2 0 0,1 -2,2H5a2,2 0 0,1 -2,-2V5a2,2 0 0,1 2,-2h11"></path>
              </svg>
            </div>
            <div className="stat-info">
              <h3>{stats.delivered}</h3>
              <p>Delivered</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="orders-filters">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Orders ({stats.total})</option>
            <option value="food_processing">Processing ({stats.processing})</option>
            <option value="out_for_delivery">Out for Delivery ({stats.delivery})</option>
            <option value="delivered">Delivered ({stats.delivered})</option>
          </select>
        </div>

        {/* Orders List */}
        <div className="orders-list">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order, index) => (
              <div key={index} className={`order-item ${getStatusClass(order.status)}`}>
                <div className="order-header">
                  <div>
                    <h3 className="order-id">Order #{order._id.slice(-6)}</h3>
                    <p className="order-time">{formatDate(order.date)}</p>
                  </div>
                  <span className={`order-status-badge ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="order-content">
                  <div className="order-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>

                  <div className="order-details">
                    <p className="order-item-food">
                      {order.items.map((item, index) => {
                        if (index === order.items.length - 1) {
                          return item.name + ' x ' + item.quantity;
                        } else {
                          return item.name + ' x ' + item.quantity + ', ';
                        }
                      })}
                    </p>
                    <h4 className='order-item-name'>{order.address.firstName + ' ' + order.address.lastName}</h4>
                    <div className="order-item-address">
                      <p>{order.address.street},</p>
                      <p>{order.address.city}, {order.address.state}, {order.address.zipCode}</p>
                    </div>
                    <p className="order-item-phone">📞 {order.address.phone}</p>
                  </div>

                  <div className="order-summary">
                    <p className="order-items-count">Items: {order.items.length}</p>
                    <p className="order-amount">{formatINR(order.amount)}</p>
                  </div>

                  <div className="order-actions">
                    <select
                      onChange={(event) => statusHandler(event, order._id)}
                      value={order.status}
                      className="status-select"
                    >
                      <option value="Food Processing">Food Processing</option>
                      <option value="Out for delivery">Out for delivery</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                    <button
                      className="edit-order-btn"
                      onClick={() => editHandler(order)}
                      title="Edit Order"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="delete-order-btn"
                      onClick={() => deleteHandler(order._id)}
                      title="Delete Order"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-orders">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              </svg>
              <h3>No orders found</h3>
              <p>No orders match the selected filter criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Order Modal */}
      {showEditModal && editingOrder && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <div className="modal-header">
              <h3>Edit Order #{editingOrder._id.slice(-6)}</h3>
              <button
                className="close-modal-btn"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingOrder(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className="modal-content">
              <div className="form-group">
                <label>Order Status:</label>
                <select
                  value={editingOrder.status}
                  onChange={(e) => setEditingOrder({...editingOrder, status: e.target.value})}
                  className="edit-select"
                >
                  <option value="Food Processing">Food Processing</option>
                  <option value="Out for delivery">Out for delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              <div className="form-group">
                <label>Order Amount (₹):</label>
                <input
                  type="number"
                  value={editingOrder.amount}
                  onChange={(e) => setEditingOrder({...editingOrder, amount: parseFloat(e.target.value)})}
                  className="edit-input"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>Customer Name:</label>
                <div className="name-inputs">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={editingOrder.address.firstName}
                    onChange={(e) => setEditingOrder({
                      ...editingOrder,
                      address: {...editingOrder.address, firstName: e.target.value}
                    })}
                    className="edit-input"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={editingOrder.address.lastName}
                    onChange={(e) => setEditingOrder({
                      ...editingOrder,
                      address: {...editingOrder.address, lastName: e.target.value}
                    })}
                    className="edit-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Phone Number:</label>
                <input
                  type="text"
                  value={editingOrder.address.phone}
                  onChange={(e) => setEditingOrder({
                    ...editingOrder,
                    address: {...editingOrder.address, phone: e.target.value}
                  })}
                  className="edit-input"
                />
              </div>

              <div className="form-group">
                <label>Delivery Address:</label>
                <input
                  type="text"
                  placeholder="Street"
                  value={editingOrder.address.street}
                  onChange={(e) => setEditingOrder({
                    ...editingOrder,
                    address: {...editingOrder.address, street: e.target.value}
                  })}
                  className="edit-input"
                />
                <div className="address-inputs">
                  <input
                    type="text"
                    placeholder="City"
                    value={editingOrder.address.city}
                    onChange={(e) => setEditingOrder({
                      ...editingOrder,
                      address: {...editingOrder.address, city: e.target.value}
                    })}
                    className="edit-input"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={editingOrder.address.state}
                    onChange={(e) => setEditingOrder({
                      ...editingOrder,
                      address: {...editingOrder.address, state: e.target.value}
                    })}
                    className="edit-input"
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    value={editingOrder.address.zipCode}
                    onChange={(e) => setEditingOrder({
                      ...editingOrder,
                      address: {...editingOrder.address, zipCode: e.target.value}
                    })}
                    className="edit-input"
                  />
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingOrder(null);
                }}
              >
                Cancel
              </button>
              <button
                className="save-btn"
                onClick={saveEditHandler}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;