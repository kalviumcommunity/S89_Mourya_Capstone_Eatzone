import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AdminContext = createContext();

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};

export const AdminProvider = ({ children }) => {
    // Remove all authentication - admin is always authenticated
    const [admin] = useState({
        id: 'admin',
        name: 'Admin User',
        email: 'admin@eatzone.com',
        role: 'admin'
    });
    const [loading] = useState(false);

    const url = "http://localhost:4000";

    // No authentication required - empty functions for compatibility
    const login = () => {};
    const logout = () => {};
    const updateAdmin = () => {};

    const value = {
        admin,
        token: 'no-auth-required',
        loading,
        login,
        logout,
        updateAdmin,
        isAuthenticated: true, // Always authenticated
        url
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};
