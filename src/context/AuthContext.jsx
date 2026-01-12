import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { AuthContext, useAuth } from './useAuth';
export { useAuth };
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

    const switchMode = async (mode) => {
        const data = await authService.switchMode(mode);
        const userData = await authService.getMe();
        setUser(userData);
        return data;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, checkAuth, switchMode }}>
            {children}
        </AuthContext.Provider>
    );
};
