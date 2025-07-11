import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import axios from 'axios';

const Dashboard = ({ url }) => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalFoodItems: 0,
    totalUsers: 0,
    todayOrders: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [topFoodItems, setTopFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders, food items, and users
      const [ordersResponse, foodResponse, usersResponse] = await Promise.all([
        axios.get(`${url}/api/order/list`),
        axios.get(`${url}/api/food/list`),
        axios.get(`${url}/api/user/list`).catch(() => ({ data: { success: false, data: [] } }))
      ]);

      const orders = ordersResponse.data.success ? ordersResponse.data.data : [];
      const foodItems = foodResponse.data.success ? foodResponse.data.data : [];
      const users = usersResponse.data.success ? usersResponse.data.data : [];
      
      // Calculate stats
      const today = new Date().toDateString();
      const todayOrders = orders.filter(order =>
        new Date(order.date).toDateString() === today
      );

      // Calculate this week's orders
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const weekOrders = orders.filter(order =>
        new Date(order.date) >= oneWeekAgo
      );

      const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
      const todayRevenue = todayOrders.reduce((sum, order) => sum + order.amount, 0);
      const weekRevenue = weekOrders.reduce((sum, order) => sum + order.amount, 0);
      
      const pendingOrders = orders.filter(order => 
        order.status === 'Food Processing' || order.status === 'Out for delivery'
      ).length;
      
      const deliveredOrders = orders.filter(order => 
        order.status === 'Delivered'
      ).length;

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalFoodItems: foodItems.length,
        totalUsers: users.length,
        todayOrders: todayOrders.length,
        todayRevenue,
        weekRevenue,
        pendingOrders,
        deliveredOrders
      });

      // Set recent orders (last 10, sorted by date)
      const sortedOrders = orders.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecentOrders(sortedOrders.slice(0, 10));

      // Calculate top food items based on order frequency
      const foodItemCounts = {};
      orders.forEach(order => {
        order.items?.forEach(item => {
          foodItemCounts[item._id] = (foodItemCounts[item._id] || 0) + item.quantity;
        });
      });

      const topItems = foodItems
        .map(item => ({
          ...item,
          orderCount: foodItemCounts[item._id] || 0
        }))
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 5);

      setTopFoodItems(topItems);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount}`;
  };

  const StatCard = ({ title, value, icon, color, change }) => (
    <div className="stat-card">
      <div className="stat-card-header">
        <div className={`stat-icon ${color}`}>
          {icon}
        </div>
        <div className="stat-info">
          <h3>{value}</h3>
          <p>{title}</p>
          {change && (
            <span className={`stat-change ${change.type}`}>
              {change.type === 'increase' ? '↗' : '↘'} {change.value}%
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome back! Here's what's happening with your restaurant today.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          color="primary"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
          }
          change={{ type: 'increase', value: 12 }}
        />
        
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          color="success"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          }
          change={{ type: 'increase', value: 8 }}
        />
        
        <StatCard
          title="Food Items"
          value={stats.totalFoodItems}
          color="warning"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
              <line x1="6" y1="1" x2="6" y2="4"></line>
              <line x1="10" y1="1" x2="10" y2="4"></line>
              <line x1="14" y1="1" x2="14" y2="4"></line>
            </svg>
          }
        />
        
        <StatCard
          title="Today's Orders"
          value={stats.todayOrders}
          color="info"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12,6 12,12 16,14"></polyline>
            </svg>
          }
          change={{ type: 'increase', value: 5 }}
        />

        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          color="purple"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          }
          change={{ type: 'increase', value: 5 }}
        />

        <StatCard
          title="Week Revenue"
          value={formatCurrency(stats.weekRevenue)}
          color="success"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18"></path>
              <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
            </svg>
          }
          change={{ type: 'increase', value: 22 }}
        />
      </div>

      {/* Charts and Tables Row */}
      <div className="dashboard-content">
        <div className="dashboard-left">
          {/* Recent Orders */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Orders</h3>
              <p className="card-subtitle">Latest customer orders</p>
            </div>
            <div className="recent-orders">
              {recentOrders.length > 0 ? (
                recentOrders.map((order, index) => (
                  <div key={index} className="order-item">
                    <div className="order-info">
                      <h4>Order #{order._id.slice(-6)}</h4>
                      <p>{order.address.firstName} {order.address.lastName}</p>
                      <span className="order-time">
                        {new Date(order.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="order-details">
                      <span className="order-amount">{formatCurrency(order.amount)}</span>
                      <span className={`badge badge-${
                        order.status === 'Delivered' ? 'success' : 
                        order.status === 'Out for delivery' ? 'warning' : 'info'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data">No recent orders</p>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-right">
          {/* Top Food Items */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Popular Items</h3>
              <p className="card-subtitle">Best selling food items</p>
            </div>
            <div className="top-items">
              {topFoodItems.length > 0 ? (
                topFoodItems.map((item, index) => (
                  <div key={index} className="food-item">
                    <img 
                      src={`${url}/images/${item.image}`} 
                      alt={item.name}
                      className="food-image"
                    />
                    <div className="food-info">
                      <h4>{item.name}</h4>
                      <p>{item.category}</p>
                      <span className="food-price">{formatCurrency(item.price)}</span>
                    </div>
                    <div className="food-rank">#{index + 1}</div>
                  </div>
                ))
              ) : (
                <p className="no-data">No food items</p>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Quick Stats</h3>
            </div>
            <div className="quick-stats">
              <div className="quick-stat">
                <span className="stat-label">Pending Orders</span>
                <span className="stat-value">{stats.pendingOrders}</span>
              </div>
              <div className="quick-stat">
                <span className="stat-label">Delivered Today</span>
                <span className="stat-value">{stats.deliveredOrders}</span>
              </div>
              <div className="quick-stat">
                <span className="stat-label">Today's Revenue</span>
                <span className="stat-value">{formatCurrency(stats.todayRevenue)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
