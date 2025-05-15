import React, { useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import './Orders.css';

const Orders = () => {
  const { user } = useContext(StoreContext);
  
  // Placeholder for orders - in a real app, you would fetch this from an API
  const orders = [];

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1>My Orders</h1>
      </div>
      
      <div className="orders-content">
        {orders.length > 0 ? (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div>
                    <h3>Order #{order.id}</h3>
                    <p className="order-date">{order.date}</p>
                  </div>
                  <div className="order-status">
                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                
                <div className="order-items">
                  {order.items.map((item) => (
                    <div key={item.id} className="order-item">
                      <img src={item.image} alt={item.name} />
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <p>Quantity: {item.quantity}</p>
                        <p className="item-price">${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="order-footer">
                  <div className="order-total">
                    <p>Total: <span>${order.total.toFixed(2)}</span></p>
                  </div>
                  <button className="reorder-button">Reorder</button>
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
