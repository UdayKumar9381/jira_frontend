import api from './apiClient';
import { endpoints } from './endpoints';

export const authService = {
    login: async (email, password) => {
        const response = await api.post(endpoints.auth.login, {
            email,
            password,
        });

        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
        }

        return response.data;
    },

    signup: async (username, email, password, role = 'DEVELOPER') => {
        const response = await api.post(endpoints.auth.signup, {
            username,
            email,
            password,
            role,
        });
        return response.data;
    },

    getMe: async () => {
        const response = await api.get(endpoints.auth.me);
        return response.data;
    },

    updateProfile: async (data) => {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            if (data[key]) formData.append(key, data[key]);
        });

        const response = await api.put(endpoints.auth.me, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    uploadAvatar: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post(
            `${endpoints.auth.me}/avatar`,
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        );
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
    },

    getAllUsers: async () => {
        const response = await api.get(endpoints.auth.users);
        return response.data;
    },

    resetPassword: async (token, newPassword) => {
        const response = await api.post(endpoints.auth.resetPassword, {
            token,
            new_password: newPassword,
        });
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await api.post(
            `${endpoints.auth.forgotPassword}?email=${encodeURIComponent(email)}`
        );
        return response.data;
    },

    verifyPassword: async (password) => {
        const formData = new FormData();
        formData.append('password', password);
        const response = await api.post('/auth/verify-password', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    switchMode: async (mode) => {
        const formData = new FormData();
        formData.append('mode', mode);
        const response = await api.post(endpoints.auth.switchMode, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
};

export const adminService = {
    getAllUsers: async () => {
        const response = await api.get('/admin/users');
        return response.data;
    },
    updateUserRole: async (userId, role) => {
        const formData = new FormData();
        formData.append('new_role', role);

        const response = await api.put(`/admin/users/${userId}/role`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
};
