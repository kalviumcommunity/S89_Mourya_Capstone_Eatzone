import React, { useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const AuthSuccess = () => {
  const { setToken, setUser } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get token and user info from URL query parameters
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const name = params.get('name');
    const email = params.get('email');
    const googleId = params.get('googleId');
    const profileImage = params.get('picture');

    if (token) {
      // Save token to context and localStorage
      setToken(token);
      localStorage.setItem('token', token);

      // Create user object with all available data
      const userData = {
        name,
        email,
        googleId,
        profileImage
      };

      // Update context and localStorage
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      // Check if this page is in a popup window
      if (window.opener && !window.opener.closed) {
        // If in a popup, communicate with the parent window and close this popup
        if (window.opener.location.origin === window.location.origin) {
          try {
            // Only communicate with windows from the same origin for security
            window.opener.postMessage({
              type: 'AUTH_SUCCESS',
              token,
              user: { name, email }
            }, window.location.origin);

            console.log('Message sent to parent window');

            // Store token in localStorage before closing popup
            localStorage.setItem('token', token);
            if (name && email) {
              localStorage.setItem('user', JSON.stringify({ name, email }));
            }

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
        const redirectTimer = setTimeout(() => {
          navigate('/', { replace: true });
        }, 1500);
        return () => clearTimeout(redirectTimer);
      }
    } else {
      // If no token, redirect to home after a short delay
      const redirectTimer = setTimeout(() => {
        navigate('/', { replace: true });
      }, 1500);
      return () => clearTimeout(redirectTimer);
    }
  }, [location.search, navigate, setToken]); // Include dependencies

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <h2>Authentication successful! Redirecting...</h2>
    </div>
  );
};

export default AuthSuccess;
