import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import './ProfileDropdown.css';

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useContext(StoreContext);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  // For debugging
  useEffect(() => {
    console.log("ProfileDropdown - Current user data:", user);
  }, [user]);

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      <div
        className="profile-icon-container"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="profile-letter-avatar">
          {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            <p className="user-name">{user?.name || 'User'}</p>
            <p className="user-email">{user?.email || ''}</p>
          </div>

          <div className="dropdown-items">
            <Link to="/profile" className="dropdown-item" onClick={() => setIsOpen(false)}>
              <img src={assets.profile_icon} alt="Profile" />
              <span>Profile</span>
            </Link>

            <Link to="/orders" className="dropdown-item" onClick={() => setIsOpen(false)}>
              <img src={assets.bag_icon} alt="Orders" />
              <span>Orders</span>
            </Link>

            <div className="dropdown-item logout" onClick={handleLogout}>
              <img src={assets.logout_icon} alt="Logout" />
              <span>Logout</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
