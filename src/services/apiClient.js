import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// --------------------------------------------------
// REQUEST INTERCEPTOR (JWT)
// --------------------------------------------------
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(
            `[API Request] ${config.method.toUpperCase()} ${config.url}`,
            config.headers.Authorization ? 'Token present' : 'No token'
        );
        return config;
    },
    (error) => Promise.reject(error)
);

// --------------------------------------------------
// RESPONSE INTERCEPTOR (ERROR HANDLING)
// --------------------------------------------------
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);

        if (error.response?.status === 401) {
            localStorage.removeItem('token');
        }

        if (error.response?.status === 403) {
            const message = error.response?.data?.detail;
            const displayMessage =
                typeof message === 'string'
                    ? message
                    : 'Permission Denied: You do not have access to perform this action.';

            window.dispatchEvent(
                new CustomEvent('api-forbidden', { detail: displayMessage })
            );
        }

        return Promise.reject(error);
    }
);

export default api;
