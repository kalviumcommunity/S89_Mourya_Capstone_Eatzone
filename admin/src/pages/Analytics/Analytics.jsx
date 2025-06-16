import React, { useState, useEffect } from 'react';
import './Analytics.css';
import axios from 'axios';

const Analytics = ({ url }) => {
  const [analyticsData, setAnalyticsData] = useState({
    salesTrend: [],
    categoryStats: [],
    orderStats: {
      total: 0,
      completed: 0,
      pending: 0,
      cancelled: 0
    },
    revenueStats: {
      today: 0,
      week: 0,
      month: 0,
      total: 0
    },
    topItems: [],
    customerStats: {
      newCustomers: 0,
      returningCustomers: 0,
      totalCustomers: 0
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // week, month, year

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders
      const ordersResponse = await axios.get(`${url}/api/order/list`);
      const orders = ordersResponse.data.success ? ordersResponse.data.data : [];
      
      // Fetch food items
      const foodResponse = await axios.get(`${url}/api/food/list`);
      const foodItems = foodResponse.data.success ? foodResponse.data.data : [];
      
      // Process analytics data
      processAnalyticsData(orders, foodItems);
      
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (orders, foodItems) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Order stats
    const orderStats = {
      total: orders.length,
      completed: orders.filter(o => o.status === 'Delivered').length,
      pending: orders.filter(o => o.status === 'Food Processing' || o.status === 'Out for delivery').length,
      cancelled: 0 // Add cancelled status if needed
    };

    // Revenue stats
    const todayOrders = orders.filter(o => new Date(o.date) >= today);
    const weekOrders = orders.filter(o => new Date(o.date) >= weekAgo);
    const monthOrders = orders.filter(o => new Date(o.date) >= monthAgo);

    const revenueStats = {
      today: todayOrders.reduce((sum, o) => sum + o.amount, 0),
      week: weekOrders.reduce((sum, o) => sum + o.amount, 0),
      month: monthOrders.reduce((sum, o) => sum + o.amount, 0),
      total: orders.reduce((sum, o) => sum + o.amount, 0)
    };

    // Category stats
    const categoryMap = {};
    foodItems.forEach(item => {
      if (!categoryMap[item.category]) {
        categoryMap[item.category] = { count: 0, revenue: 0 };
      }
      categoryMap[item.category].count++;
    });

    // Calculate revenue per category from orders
    orders.forEach(order => {
      order.items.forEach(item => {
        const foodItem = foodItems.find(f => f.name === item.name);
        if (foodItem && categoryMap[foodItem.category]) {
          categoryMap[foodItem.category].revenue += item.price * item.quantity;
        }
      });
    });

    const categoryStats = Object.entries(categoryMap).map(([category, data]) => ({
      category,
      count: data.count,
      revenue: data.revenue,
      percentage: ((data.revenue / revenueStats.total) * 100).toFixed(1)
    })).sort((a, b) => b.revenue - a.revenue);

    // Sales trend (last 7 days)
    const salesTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dayOrders = orders.filter(o => {
        const orderDate = new Date(o.date);
        return orderDate.toDateString() === date.toDateString();
      });
      
      salesTrend.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => sum + o.amount, 0)
      });
    }

    // Top items (mock calculation based on orders)
    const itemMap = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!itemMap[item.name]) {
          itemMap[item.name] = { quantity: 0, revenue: 0 };
        }
        itemMap[item.name].quantity += item.quantity;
        itemMap[item.name].revenue += item.price * item.quantity;
      });
    });

    const topItems = Object.entries(itemMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    setAnalyticsData({
      salesTrend,
      categoryStats,
      orderStats,
      revenueStats,
      topItems,
      customerStats: {
        newCustomers: Math.floor(orders.length * 0.3), // Mock data
        returningCustomers: Math.floor(orders.length * 0.7),
        totalCustomers: orders.length
      }
    });
  };

  const formatCurrency = (amount) => {
    return `₹${amount}`;
  };

  if (loading) {
    return (
      <div className="analytics">
        <div className="analytics-loading">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics">
      <div className="analytics-header">
        <div>
          <h1>Analytics Dashboard</h1>
          <p>Detailed insights into your business performance</p>
        </div>
        <div className="time-range-selector">
          <button 
            className={timeRange === 'week' ? 'active' : ''}
            onClick={() => setTimeRange('week')}
          >
            Week
          </button>
          <button 
            className={timeRange === 'month' ? 'active' : ''}
            onClick={() => setTimeRange('month')}
          >
            Month
          </button>
          <button 
            className={timeRange === 'year' ? 'active' : ''}
            onClick={() => setTimeRange('year')}
          >
            Year
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon revenue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="metric-info">
            <h3>{formatCurrency(analyticsData.revenueStats.total)}</h3>
            <p>Total Revenue</p>
            <span className="metric-change positive">+12.5%</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon orders">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
          </div>
          <div className="metric-info">
            <h3>{analyticsData.orderStats.total}</h3>
            <p>Total Orders</p>
            <span className="metric-change positive">+8.2%</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon customers">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="metric-info">
            <h3>{analyticsData.customerStats.totalCustomers}</h3>
            <p>Total Customers</p>
            <span className="metric-change positive">+15.3%</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon completion">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9,11 12,14 22,4"></polyline>
              <path d="M21,12v7a2,2 0 0,1 -2,2H5a2,2 0 0,1 -2,-2V5a2,2 0 0,1 2,-2h11"></path>
            </svg>
          </div>
          <div className="metric-info">
            <h3>{((analyticsData.orderStats.completed / analyticsData.orderStats.total) * 100).toFixed(1)}%</h3>
            <p>Completion Rate</p>
            <span className="metric-change positive">+2.1%</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Sales Trend</h3>
              <p className="card-subtitle">Daily sales over the last week</p>
            </div>
            <div className="sales-chart">
              {analyticsData.salesTrend.map((day, index) => (
                <div key={index} className="chart-bar">
                  <div 
                    className="bar" 
                    style={{ 
                      height: `${(day.revenue / Math.max(...analyticsData.salesTrend.map(d => d.revenue))) * 100}%` 
                    }}
                  ></div>
                  <span className="bar-label">{day.date}</span>
                  <span className="bar-value">{formatCurrency(day.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-container">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Category Performance</h3>
              <p className="card-subtitle">Revenue by food category</p>
            </div>
            <div className="category-chart">
              {analyticsData.categoryStats.slice(0, 5).map((category, index) => (
                <div key={index} className="category-item">
                  <div className="category-info">
                    <span className="category-name">{category.category}</span>
                    <span className="category-revenue">{formatCurrency(category.revenue)}</span>
                  </div>
                  <div className="category-bar">
                    <div 
                      className="category-fill" 
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <span className="category-percentage">{category.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bottom-section">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Top Selling Items</h3>
            <p className="card-subtitle">Most popular food items</p>
          </div>
          <div className="top-items-table">
            <div className="table-header">
              <span>Rank</span>
              <span>Item Name</span>
              <span>Quantity Sold</span>
              <span>Revenue</span>
            </div>
            {analyticsData.topItems.map((item, index) => (
              <div key={index} className="table-row">
                <span className="rank">#{index + 1}</span>
                <span className="item-name">{item.name}</span>
                <span className="quantity">{item.quantity}</span>
                <span className="revenue">{formatCurrency(item.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Order Status</h3>
            <p className="card-subtitle">Current order distribution</p>
          </div>
          <div className="order-status">
            <div className="status-item">
              <div className="status-circle completed"></div>
              <div className="status-info">
                <span className="status-count">{analyticsData.orderStats.completed}</span>
                <span className="status-label">Completed</span>
              </div>
            </div>
            <div className="status-item">
              <div className="status-circle pending"></div>
              <div className="status-info">
                <span className="status-count">{analyticsData.orderStats.pending}</span>
                <span className="status-label">Pending</span>
              </div>
            </div>
            <div className="status-item">
              <div className="status-circle cancelled"></div>
              <div className="status-info">
                <span className="status-count">{analyticsData.orderStats.cancelled}</span>
                <span className="status-label">Cancelled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
