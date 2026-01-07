import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();
// eslint-disable-next-line react/prop-types
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        console.log('[AuthContext] Checking auth with token:', token ? 'Exists' : 'Missing');
        if (token) {
            try {
                const userData = await authService.getMe();
                console.log('[AuthContext] user loaded:', userData.username);
                setUser(userData);
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    };
    // Login function
    const login = async (email, password) => {
        const data = await authService.login(email, password);
        const userData = await authService.getMe();
        setUser(userData);
        return data;
    };

    const signup = async (username, email, password, role) => {
        return await authService.signup(username, email, password, role);
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};
// Custom hook to use the AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
