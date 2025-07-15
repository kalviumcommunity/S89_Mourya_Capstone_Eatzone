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

  const handleRefreshProfile = async () => {
    console.log("🔄 Manual profile refresh triggered");
    if (token) {
      await fetchUserProfile();
    } else {
      console.log("❌ No token available for profile refresh");
    }
  };

  // For debugging
  useEffect(() => {
    console.log("🎭 ProfileDropdown - Current user data:", user);
    console.log("🎭 ProfileDropdown - User name:", user?.name);
    console.log("🎭 ProfileDropdown - User email:", user?.email);
    console.log("🎭 ProfileDropdown - Token exists:", !!token);
  }, [user, token]);

  // Get display name and email with fallbacks
  const getStoredUser = () => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  };

  const storedUser = getStoredUser();
  const effectiveUser = user || storedUser;

  const displayName = effectiveUser?.name || 'User';
  const displayEmail = effectiveUser?.email || '';
  const avatarLetter = displayEmail ? displayEmail.charAt(0).toUpperCase() : (displayName ? displayName.charAt(0).toUpperCase() : 'U');

  // Enhanced debugging
  useEffect(() => {
    console.log("🎭 ProfileDropdown Enhanced Debug:");
    console.log("  - Context user:", user);
    console.log("  - Stored user:", storedUser);
    console.log("  - Effective user:", effectiveUser);
    console.log("  - Display name:", displayName);
    console.log("  - Display email:", displayEmail);
    console.log("  - Token exists:", !!token);
  }, [user, storedUser, effectiveUser, displayName, displayEmail, token]);

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      <div
        className={`profile-icon-container ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title={`${displayName} - Click to open profile`}
      >
        <div className="profile-letter-avatar">
          {avatarLetter}
        </div>
      </div>

      {isOpen && (
        <div className="profile-menu">
          <div className="profile-info-section">
            <div className="user-avatar-display">
              {avatarLetter}
            </div>
            <div className="user-info-display">
              <h3 className="user-name-display">{displayName}</h3>
              <p className="user-email-display">{displayEmail}</p>
            </div>
          </div>

          <div className="profile-actions">
            <Link to="/profile" className="profile-action-item" onClick={() => setIsOpen(false)}>
              <div className="action-icon">
                <img src={assets.profile_icon} alt="Profile" />
              </div>
              <span className="action-label">Profile</span>
            </Link>

            <div className="profile-action-item logout-action" onClick={handleLogout}>
              <div className="action-icon">
                <img src={assets.logout_icon} alt="Logout" />
              </div>
              <span className="action-label">Logout</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
