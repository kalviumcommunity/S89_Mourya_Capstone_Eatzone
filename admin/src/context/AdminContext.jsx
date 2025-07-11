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
    const login = async (email, password) => {
        try {
            setLoading(true);
            const response = await axios.post(`${url}/api/admin/login`, {
                email,
                password
            });

            if (response.data.success) {
                const { token: newToken, admin: adminData } = response.data;
                setToken(newToken);
                setAdmin(adminData);
                localStorage.setItem('adminToken', newToken);
                return { success: true };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = () => {
        setAdmin(null);
        setToken(null);
        localStorage.removeItem('adminToken');
    };

    // Update admin data
    const updateAdmin = (adminData) => {
        setAdmin(adminData);
    };

    // Verify token on app load
    useEffect(() => {
        const verifyToken = async () => {
            if (token) {
                try {
                    const response = await axios.get(`${url}/api/admin/verify`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (response.data.success) {
                        setAdmin(response.data.admin);
                    } else {
                        logout();
                    }
                } catch (error) {
                    console.error('Token verification failed:', error);
                    logout();
                }
            }
            setLoading(false);
        };

        verifyToken();
    }, [token, url]);





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
