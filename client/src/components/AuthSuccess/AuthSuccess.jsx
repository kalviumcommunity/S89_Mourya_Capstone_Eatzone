import { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const AuthSuccess = () => {
  const { setTokenAndUser, fetchUserProfile } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Get all URL parameters for debugging
        const params = new URLSearchParams(location.search);
        console.log('🔍 All URL params:', Object.fromEntries(params.entries()));

        // Check for authentication errors first
        const authError = params.get('authError');
        const errorMessage = params.get('message');

        if (authError === 'true') {
          console.error('❌ Authentication error received:', errorMessage);
          alert(`Authentication failed: ${errorMessage || 'Unknown error'}`);
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 2000);
          return;
        }

        // Get token from URL query parameters
        const token = params.get('token');

        if (!token) {
          console.error('❌ No token received from authentication');
          console.log('🔍 Available params:', Object.fromEntries(params.entries()));
          alert('Authentication failed: No token received');
          // If no token, redirect to home after a short delay
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 2000);
          return;
        }

        console.log('Setting token and user data...');

        // Extract user data from URL parameters
        const userData = {
          id: params.get('id'),
          name: params.get('name'),
          email: params.get('email'),
          googleId: params.get('googleId'),
          profileImage: params.get('picture')
        };

        console.log('User data from URL params:', userData);

        // Use the custom setTokenAndUser function to properly set both token and user data
        setTokenAndUser(token, userData);

        // Give a moment for the context to update, then redirect
        setTimeout(() => {
          console.log('Redirecting to home page after successful authentication');
          navigate('/', { replace: true });
        }, 1000);
      } catch (error) {
        console.error('Error during authentication:', error);
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1500);
      } finally {
        setIsLoading(false);
      }
    };

    handleAuth();
  }, [location.search, navigate, setTokenAndUser, fetchUserProfile]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <h2>Authentication successful!</h2>
      <p>{isLoading ? 'Loading your profile...' : 'Redirecting to homepage...'}</p>
    </div>
  );
};

export default AuthSuccess;
