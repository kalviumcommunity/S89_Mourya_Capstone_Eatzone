import { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const AuthSuccess = () => {
  const { setToken, fetchUserProfile } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Get token from URL query parameters
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (!token) {
          console.error('No token received from authentication');
          // If no token, redirect to home after a short delay
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1500);
          return;
        }

        console.log('Setting token and fetching user profile...');

        // Save token to context and localStorage
        setToken(token);
        localStorage.setItem('token', token);

        // Also save user data to localStorage as a fallback
        // This will be used if the server is not available
        const userData = {
          id: params.get('id'),
          name: params.get('name'),
          email: params.get('email'),
          googleId: params.get('googleId'),
          profileImage: params.get('picture')
        };

        // Store user data in localStorage as fallback
        localStorage.setItem('user', JSON.stringify(userData));

        // Wait for user profile to be fetched from server
        try {
          console.log('Attempting to fetch user profile from server...');
          const userProfile = await fetchUserProfile();
          console.log('User profile fetch result:', userProfile);

          // Give a moment for the context to update
          setTimeout(() => {
            console.log('Redirecting to home page after successful authentication');
            navigate('/', { replace: true });
          }, 1000);
        } catch (profileError) {
          console.error('Error fetching user profile:', profileError);
          // Even if profile fetch fails, we have fallback data, so continue
          setTimeout(() => {
            console.log('Redirecting to home page with fallback user data');
            navigate('/', { replace: true });
          }, 1000);
        }
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
  }, [location.search, navigate, setToken, fetchUserProfile]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <h2>Authentication successful!</h2>
      <p>{isLoading ? 'Loading your profile...' : 'Redirecting to homepage...'}</p>
    </div>
  );
};

export default AuthSuccess;
