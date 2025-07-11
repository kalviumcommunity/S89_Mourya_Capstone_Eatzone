import { useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';

const AuthDebug = () => {
  const { user, token, isUserLoading, fetchUserProfile } = useContext(StoreContext);

  const handleFetchProfile = () => {
    console.log("🔄 Manual profile fetch triggered");
    fetchUserProfile();
  };

  const handleClearStorage = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    console.log("🧹 Cleared localStorage");
    window.location.reload();
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '1px solid #ccc', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999,
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h4>🔍 Auth Debug Panel</h4>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Token:</strong> {token ? '✅ Present' : '❌ Missing'}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>User Loading:</strong> {isUserLoading ? '⏳ Loading...' : '✅ Ready'}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>User Data:</strong>
        {user ? (
          <div style={{ marginLeft: '10px', fontSize: '11px' }}>
            <div>Name: {user.name || 'N/A'}</div>
            <div>Email: {user.email || 'N/A'}</div>
            <div>ID: {user.id || 'N/A'}</div>
          </div>
        ) : (
          <span> ❌ No user data</span>
        )}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>LocalStorage:</strong>
        <div style={{ marginLeft: '10px', fontSize: '11px' }}>
          <div>Token: {localStorage.getItem('token') ? '✅' : '❌'}</div>
          <div>User: {localStorage.getItem('user') ? '✅' : '❌'}</div>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
        <button 
          onClick={handleFetchProfile}
          style={{ fontSize: '10px', padding: '2px 5px' }}
        >
          Fetch Profile
        </button>
        <button 
          onClick={handleClearStorage}
          style={{ fontSize: '10px', padding: '2px 5px', background: '#ff4444', color: 'white' }}
        >
          Clear Storage
        </button>
      </div>
    </div>
  );
};

export default AuthDebug;
