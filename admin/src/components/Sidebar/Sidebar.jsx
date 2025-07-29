import React from 'react'
import './Sidebar.css'
import { NavLink } from 'react-router-dom'

const Sidebar = ({ isOpen, setSidebarOpen, isMobileOpen = false, onMobileClose = () => {} }) => {
  const menuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      description: 'Overview & Analytics'
    },
    {
      path: '/add',
      label: 'Add Food Items',
      description: 'Create new menu items'
    },
    {
      path: '/list',
      label: 'List Items',
      description: 'Manage menu items'
    },
    {
      path: '/categories',
      label: 'Food Categories',
      description: 'Manage food categories'
    },
    {
      path: '/add-restaurant',
      label: 'Add Restaurant',
      description: 'Create new restaurant'
    },
    {
      path: '/restaurant-list',
      label: 'Restaurant List',
      description: 'Manage restaurants'
    },
    {
      path: '/orders',
      label: 'Orders',
      description: 'Manage customer orders'
    },
    {
      path: '/analytics',
      label: 'Analytics',
      description: 'Sales & performance'
    },
    {
      path: '/delivery-partners',
      label: 'Delivery Partners',
      description: 'Manage delivery team'
    },
    {
      path: '/feedback',
      label: 'Feedback & Complaints',
      description: 'Customer feedback'
    },
    {
      path: '/debug',
      label: 'API Debug',
      description: 'Debug API connections'
    }
  ];

  return (
    <>
      {isMobileOpen && <div className="mobile-overlay active" onClick={onMobileClose}></div>}
      <div className={`sidebar ${isOpen ? 'open' : 'closed'} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h3>Navigation</h3>
          <span>Manage your platform</span>
        </div>

        <div className="sidebar-menu">
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-option ${isActive ? 'active' : ''}`
              }
              data-tooltip={item.label}
              onClick={onMobileClose}
            >
              <div className="sidebar-option-icon"></div>
              <div className="sidebar-option-content">
                <span className="sidebar-option-label">{item.label}</span>
                <span className="sidebar-option-description">{item.description}</span>
              </div>
            </NavLink>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-help">
            <div className="help-icon"></div>
            <div>
              <span className="help-title">Need Help?</span>
              <span className="help-subtitle">Contact support</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar