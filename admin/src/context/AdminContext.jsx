import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create context with default value to prevent initialization issues
const AdminContext = createContext({
    admin: null,
    token: null,
    loading: false,
    login: () => {},
    logout: () => {},
    updateAdmin: () => {},
    isAuthenticated: false,
    url: 'https://eatzone.onrender.com'
});

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};

export const AdminProvider = ({ children }) => {
    // SECURITY: Implement proper admin authentication
    const [admin, setAdmin] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('adminToken') || null);
    const [loading, setLoading] = useState(false);

    // Use environment variable for API URL with fallback
    const url = import.meta.env.VITE_API_BASE_URL || "https://eatzone.onrender.com";

    // Check if admin is authenticated
    const isAuthenticated = !!(admin && token);

    // Login function
    const login = async (credentials) => {
        setLoading(true);
        try {
            const response = await fetch(`${url}/api/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (data.success) {
                setAdmin(data.admin);
                setToken(data.token);
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminData', JSON.stringify(data.admin));
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Login failed. Please try again.' };
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = () => {
        setAdmin(null);
        setToken(null);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
    };

    // Update admin data
    const updateAdmin = (adminData) => {
        setAdmin(adminData);
        localStorage.setItem('adminData', JSON.stringify(adminData));
    };

    // Load admin data on app start
    useEffect(() => {
        const savedToken = localStorage.getItem('adminToken');
        const savedAdmin = localStorage.getItem('adminData');

        if (savedToken && savedAdmin) {
            try {
                setToken(savedToken);
                setAdmin(JSON.parse(savedAdmin));
            } catch (error) {
                console.error('Error loading saved admin data:', error);
                logout();
            }
        }
    }, []);

    const value = {
        admin,
        token,
        loading,
        login,
        logout,
        updateAdmin,
        isAuthenticated,
        url
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};
