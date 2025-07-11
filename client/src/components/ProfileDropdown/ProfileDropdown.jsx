import { useState, useRef, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import './ProfileDropdown.css';

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout, token, fetchUserProfile } = useContext(StoreContext);

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

  // Fetch user profile if we have token but no user data
  useEffect(() => {
    if (token && !user) {
      console.log("🔄 ProfileDropdown: Token exists but no user data, fetching profile...");
      fetchUserProfile();
    }
  }, [token, user, fetchUserProfile]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  // For debugging
  useEffect(() => {
    console.log("🎭 ProfileDropdown - Current user data:", user);
    console.log("🎭 ProfileDropdown - User name:", user?.name);
    console.log("🎭 ProfileDropdown - User email:", user?.email);
    console.log("🎭 ProfileDropdown - Token exists:", !!token);
  }, [user, token]);

  // Get display name and email with fallbacks
  const displayName = user?.name || 'User';
  const displayEmail = user?.email || '';
  const avatarLetter = displayEmail ? displayEmail.charAt(0).toUpperCase() : (displayName ? displayName.charAt(0).toUpperCase() : 'U');

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      <div
        className="profile-icon-container"
        onClick={() => setIsOpen(!isOpen)}
        title={`${displayName} - Click to open menu`}
      >
        <div className="profile-letter-avatar">
          {avatarLetter}
        </div>
      </div>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            <p className="user-name">{displayName}</p>
            <p className="user-email">{displayEmail}</p>
          </div>

          <div className="dropdown-items">
            <Link to="/profile" className="dropdown-item" onClick={() => setIsOpen(false)}>
              <img src={assets.profile_icon} alt="Profile" />
              <span>Profile</span>
            </Link>

            <Link to="/myorders" className="dropdown-item" onClick={() => setIsOpen(false)}>
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
