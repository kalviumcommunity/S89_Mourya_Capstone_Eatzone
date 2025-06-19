import React, { useState } from 'react';
import { useFirebaseAuth } from '../../context/FirebaseAuthContext';
import AdminLogin from './AdminLogin';
import AdminRegister from './AdminRegister';

const AuthWrapper = ({ children }) => {
  const { currentUser, loading } = useFirebaseAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin data...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return showRegister ? (
      <AdminRegister onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <AdminLogin onSwitchToRegister={() => setShowRegister(true)} />
    );
  }

  return children;
};

export default AuthWrapper;
