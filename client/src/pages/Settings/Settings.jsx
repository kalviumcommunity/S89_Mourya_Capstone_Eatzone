import React, { useContext, useState } from 'react';
import { StoreContext } from '../../context/StoreContext';
import './Settings.css';

const Settings = () => {
  const { user, token, logout } = useContext(StoreContext);
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: true,
    newsletter: false
  });
  const [preferences, setPreferences] = useState({
    language: 'English',
    currency: 'INR',
    theme: 'light'
  });

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    // Here you would typically save to backend
    alert('Settings saved successfully!');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Handle account deletion
      alert('Account deletion requested. Please contact support.');
    }
  };

  if (!token) {
    return (
      <div className="settings-container">
        <div className="no-auth-message">
          <div className="settings-icon">🔒</div>
          <h3>Please Log In</h3>
          <p>You need to be logged in to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account preferences and settings</p>
      </div>

      <div className="settings-content">
        {/* Account Information */}
        <div className="settings-section">
          <h2>Account Information</h2>
          <div className="setting-item">
            <label>Name</label>
            <input 
              type="text" 
              value={user?.name || ''} 
              readOnly 
              className="readonly-input"
            />
          </div>
          <div className="setting-item">
            <label>Email</label>
            <input 
              type="email" 
              value={user?.email || ''} 
              readOnly 
              className="readonly-input"
            />
          </div>
          <div className="setting-item">
            <label>Account Type</label>
            <input 
              type="text" 
              value={user?.googleId ? 'Google Account' : 'Email Account'} 
              readOnly 
              className="readonly-input"
            />
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="settings-section">
          <h2>Notification Preferences</h2>
          <div className="setting-item">
            <label className="toggle-label">
              <span>Order Updates</span>
              <div className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={notifications.orderUpdates}
                  onChange={() => handleNotificationChange('orderUpdates')}
                />
                <span className="slider"></span>
              </div>
            </label>
          </div>
          <div className="setting-item">
            <label className="toggle-label">
              <span>Promotions & Offers</span>
              <div className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={notifications.promotions}
                  onChange={() => handleNotificationChange('promotions')}
                />
                <span className="slider"></span>
              </div>
            </label>
          </div>
          <div className="setting-item">
            <label className="toggle-label">
              <span>Newsletter</span>
              <div className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={notifications.newsletter}
                  onChange={() => handleNotificationChange('newsletter')}
                />
                <span className="slider"></span>
              </div>
            </label>
          </div>
        </div>

        {/* App Preferences */}
        <div className="settings-section">
          <h2>App Preferences</h2>
          <div className="setting-item">
            <label>Language</label>
            <select 
              value={preferences.language}
              onChange={(e) => handlePreferenceChange('language', e.target.value)}
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Tamil">Tamil</option>
              <option value="Telugu">Telugu</option>
            </select>
          </div>
          <div className="setting-item">
            <label>Currency</label>
            <select 
              value={preferences.currency}
              onChange={(e) => handlePreferenceChange('currency', e.target.value)}
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
          <div className="setting-item">
            <label>Theme</label>
            <select 
              value={preferences.theme}
              onChange={(e) => handlePreferenceChange('theme', e.target.value)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="settings-section">
          <h2>Account Actions</h2>
          <div className="action-buttons">
            <button className="save-btn" onClick={handleSaveSettings}>
              Save Settings
            </button>
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
            <button className="delete-account-btn" onClick={handleDeleteAccount}>
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
