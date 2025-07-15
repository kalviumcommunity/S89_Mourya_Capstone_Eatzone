import React, { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../../context/StoreContext';
import './Profile.css';

const Profile = () => {
  const { user, isUserLoading, fetchUserProfile, token } = useContext(StoreContext);

  // Fetch user profile when component mounts if we have a token
  useEffect(() => {
    console.log("Profile component mounted with token:", token ? "Yes" : "No");
    console.log("Current user data:", user);

    if (token) {
      if (!user || !user.name) {
        console.log("User data missing or incomplete, fetching profile");
        fetchUserProfile();
      } else {
        console.log("User data already available:", user.name);
      }
    }
  }, [token, user, fetchUserProfile]);

  // Loading state
  const isLoading = isUserLoading;

  // Try to get user data from localStorage if not available in context
  const [fallbackUser, setFallbackUser] = useState(null);

  useEffect(() => {
    if (!user && token) {
      // Try to get user data from localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          console.log("Using fallback user data from localStorage:", userData);
          setFallbackUser(userData);
        } catch (error) {
          console.error("Error parsing user data from localStorage:", error);
        }
      }
    }
  }, [user, token]);

  // Use fallback user data if user is not available
  const displayUser = user || fallbackUser;

  // Enhanced display values with better fallbacks
  const displayName = displayUser?.name || 'User';
  const displayEmail = displayUser?.email || '';
  const avatarLetter = displayEmail ? displayEmail.charAt(0).toUpperCase() : (displayName ? displayName.charAt(0).toUpperCase() : 'U');

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <p>Loading profile data...</p>
        </div>
      ) : !token ? (
        <div className="error-container">
          <p>You need to be logged in to view your profile.</p>
          <p>Please log in and try again.</p>
        </div>
      ) : !displayUser ? (
        <div className="error-container">
          <p>Could not load profile data.</p>
          <p>Please try refreshing the page.</p>
        </div>
      ) : (
        <div className="profile-content">
          <div className="profile-image-section">
            <div className="profile-image-placeholder">
              {avatarLetter}
            </div>
            <h2>{displayName}</h2>
            <p>{displayEmail}</p>
          </div>

          <div className="profile-details">
            <div className="profile-section">
              <h3>Account Information</h3>
              <div className="profile-info-item">
                <span className="info-label">Name:</span>
                <span className="info-value">{displayName}</span>
              </div>
              <div className="profile-info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{displayEmail || 'Not provided'}</span>
              </div>
              <div className="profile-info-item">
                <span className="info-label">Account Type:</span>
                <span className="info-value">{displayUser?.googleId ? 'Google Account' : 'Email Account'}</span>
              </div>
            </div>

            <div className="profile-section">
              <h3>Preferences</h3>
              <p>Profile preferences will be added in a future update.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
