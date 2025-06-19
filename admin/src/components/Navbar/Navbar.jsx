import React, { useState } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { useAdmin } from '../../context/AdminContext'

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { admin } = useAdmin();

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Get first letter of admin name for avatar
  const getAvatarLetter = () => {
    if (admin?.name) {
      return admin.name.charAt(0).toUpperCase();
    }
    return admin?.email?.charAt(0).toUpperCase() || 'A';
  };

  return (
    <div className='navbar'>
      <div className="navbar-left">
        <img className='logo' src={assets.logo} alt="Eatzone" />
        <div className="navbar-title">
          <h2>Admin Dashboard</h2>
          <span>Manage your food delivery platform</span>
        </div>
      </div>

      <div className="navbar-right">
        <div className="navbar-stats">
          <div className="stat-item">
            <span className="stat-label">Today's Orders</span>
            <span className="stat-value">24</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Revenue</span>
            <span className="stat-value">₹12,450</span>
          </div>
        </div>

        <div className="navbar-notifications">
          <div className="notification-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span className="notification-badge">3</span>
          </div>
        </div>

        <div className="navbar-profile" onClick={toggleDropdown}>
          <div className="profile-avatar">
            {admin?.profileImage ? (
              <img src={admin.profileImage} alt={admin.name} />
            ) : (
              <span>{getAvatarLetter()}</span>
            )}
          </div>
          <div className="profile-info">
            <span className="profile-name">{admin?.name || 'Admin'}</span>
            <span className="profile-role">{admin?.role || 'Administrator'}</span>
          </div>
          <svg className={`dropdown-arrow ${showDropdown ? 'rotated' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6,9 12,15 18,9"></polyline>
          </svg>

          {showDropdown && (
            <div className="profile-dropdown">
              <div className="dropdown-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Profile Settings
              </div>
              <div className="dropdown-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"></path>
                </svg>
                System Settings
              </div>
              {/* Removed logout option - no authentication required */}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Navbar
