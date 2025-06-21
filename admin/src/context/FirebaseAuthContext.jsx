import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../config/firebase';

const FirebaseAuthContext = createContext();

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};

export const FirebaseAuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);

  // Register admin with email/password
  const registerAdmin = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Register admin in backend
      await registerAdminInBackend(user.uid, name, email);
      
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Login admin with email/password
  const loginAdmin = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Register admin in backend if not exists
      await registerAdminInBackend(user.uid, user.displayName, user.email);
      
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setAdminData(null);
    } catch (error) {
      throw error;
    }
  };

  // Register admin in backend
  const registerAdminInBackend = async (firebaseUID, name, email) => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://eatzone.onrender.com';
      const response = await fetch(`${apiUrl}/api/admin/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseUID,
          name,
          email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register admin in backend');
      }

      return await response.json();
    } catch (error) {
      console.error('Backend registration error:', error);
      throw error;
    }
  };

  // Fetch admin data from backend
  const fetchAdminData = async (uid) => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://eatzone.onrender.com';
      const response = await fetch(`${apiUrl}/api/admin/data/${uid}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch admin data');
      }

      const data = await response.json();
      setAdminData(data);
      return data;
    } catch (error) {
      console.error('Error fetching admin data:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          await fetchAdminData(user.uid);
        } catch (error) {
          console.error('Error fetching admin data on auth change:', error);
        }
      } else {
        setAdminData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    adminData,
    loading,
    registerAdmin,
    loginAdmin,
    loginWithGoogle,
    logout,
    fetchAdminData,
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};
