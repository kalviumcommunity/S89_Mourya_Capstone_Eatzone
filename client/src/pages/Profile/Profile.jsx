import React, { useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import './Profile.css';

const Profile = () => {
  const { user } = useContext(StoreContext);

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
      </div>
      
      <div className="profile-content">
        <div className="profile-image-section">
          {user?.profileImage ? (
            <img src={user.profileImage} alt="Profile" className="profile-image" />
          ) : (
            <div className="profile-image-placeholder">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <h2>{user?.name || 'User'}</h2>
          <p>{user?.email || ''}</p>
        </div>
        
        <div className="profile-details">
          <div className="profile-section">
            <h3>Account Information</h3>
            <div className="profile-info-item">
              <span className="info-label">Name:</span>
              <span className="info-value">{user?.name || 'Not provided'}</span>
            </div>
            <div className="profile-info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{user?.email || 'Not provided'}</span>
            </div>
            <div className="profile-info-item">
              <span className="info-label">Account Type:</span>
              <span className="info-value">Google Account</span>
            </div>
          </div>
          
          <div className="profile-section">
            <h3>Preferences</h3>
            <p>Profile preferences will be added in a future update.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
