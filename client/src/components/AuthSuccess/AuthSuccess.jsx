import React, { useContext, useEffect, useState } from 'react';
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

        // Save token to context and localStorage
        setToken(token);
        localStorage.setItem('token', token);

        // Also save user data to localStorage as a fallback
        // This will be used if the server is not available
        const userData = {
          name: params.get('name'),
          email: params.get('email'),
          googleId: params.get('googleId'),
          profileImage: params.get('picture')
        };

        // Store user data in localStorage as fallback
        localStorage.setItem('user', JSON.stringify(userData));

        // Check if this page is in a popup window
        if (window.opener && !window.opener.closed) {
          // If in a popup, communicate with the parent window and close this popup
          if (window.opener.location.origin === window.location.origin) {
            try {
              // Create user data object
              const userData = {
                id: params.get('id'),
                name: params.get('name'),
                email: params.get('email'),
                googleId: params.get('googleId'),
                profileImage: params.get('picture')
              };

              // Sending user data to parent window

              // Only communicate with windows from the same origin for security
              window.opener.postMessage({
                type: 'AUTH_SUCCESS',
                token,
                user: userData
              }, window.location.origin);

              console.log('Auth success message sent to parent window');

              // Close the popup after a short delay
              setTimeout(() => window.close(), 1500);
            } catch (error) {
              console.error('Error communicating with parent window:', error);
              // If communication fails, redirect to home page
              setTimeout(() => navigate('/', { replace: true }), 1500);
            }
          } else {
            // If origins don't match, redirect to home page
            setTimeout(() => navigate('/', { replace: true }), 1500);
          }
        } else {
          // If not in a popup, redirect to home page after a short delay
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1500);
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
