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

// --------------------------------------------------
// API ENDPOINTS
// --------------------------------------------------
export const endpoints = {
    auth: {
        login: '/auth/login',
        signup: '/auth/signup',
        me: '/auth/me',
        users: '/auth/users',
        forgotPassword: '/auth/forgot-password',
        resetPassword: '/auth/reset-password',
        switchMode: '/auth/switch-mode',
    },

    projects: '/projects',

    userStories: '/user-stories',
    projectStories: (projectId) => `/user-stories/project/${projectId}`,
    projectBoard: (projectId) => `/user-stories/project/${projectId}/board`,
    storyStatus: (id) => `/user-stories/${id}/status`,
    story: (id) => `/user-stories/${id}`,
    storyActivity: (id) => `/user-stories/${id}/activity`,
    search: '/user-stories/search',

    myWork: '/user-stories/assigned/me',

    notifications: {
        get: (userId) => `/notifications/?user_id=${userId}`,
        markRead: (id) => `/notifications/${id}/read`,
    },

    teams: {
        base: '/teams',
        project: (projectId) => `/teams/project/${projectId}`,
    },
    modeSwitch: {
        request: '/mode-switch/request',
        requests: '/mode-switch/requests',
        approve: (id) => `/mode-switch/approve/${id}`,
        reject: (id) => `/mode-switch/reject/${id}`,
    },
    stats: {
        summary: '/stats/master-admin/summary',
        history: '/stats/master-admin/mode-switch-history',
    },
};

// --------------------------------------------------
// STATS SERVICE
// --------------------------------------------------
export const statsService = {
    getAdminSummary: async (params) => {
        const response = await api.get(endpoints.stats.summary, { params });
        return response.data;
    },
    getModeSwitchHistory: async () => {
        const response = await api.get(endpoints.stats.history);
        return response.data;
    },
    getRecentActivity: async (projectId = null) => {
        const url = projectId ? `/stats/activity?project_id=${projectId}` : '/stats/activity';
        const response = await api.get(url);
        return response.data;
    },
};

// --------------------------------------------------
// MODE SWITCH SERVICE
// --------------------------------------------------
export const modeSwitchService = {
    requestSwitch: async (requestedMode, reason) => {
        const response = await api.post(endpoints.modeSwitch.request, {
            requested_mode: requestedMode,
            reason: reason,
        });
        return response.data;
    },

    getPendingRequests: async () => {
        const response = await api.get(endpoints.modeSwitch.requests);
        return response.data;
    },

    approveRequest: async (requestId) => {
        const response = await api.post(endpoints.modeSwitch.approve(requestId));
        return response.data;
    },

    rejectRequest: async (requestId) => {
        const response = await api.post(endpoints.modeSwitch.reject(requestId));
        return response.data;
    },
};

// --------------------------------------------------
// NOTIFICATION SERVICE
// --------------------------------------------------
export const notificationService = {
    getNotifications: async (userId) => {
        const response = await api.get(endpoints.notifications.get(userId));
        return response.data;
    },

    markAsRead: async (notificationId) => {
        const response = await api.put(
            endpoints.notifications.markRead(notificationId)
        );
        return response.data;
    },
};

// --------------------------------------------------
// AUTH SERVICE
// --------------------------------------------------
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

// --------------------------------------------------
// ADMIN SERVICE
// --------------------------------------------------
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

// --------------------------------------------------
// PROJECT SERVICE
// --------------------------------------------------
export const projectService = {
    getAll: async () => {
        const response = await api.get(endpoints.projects);
        return response.data;
    },

    create: async (name, projectPrefix) => {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('project_prefix', projectPrefix);

        const response = await api.post(endpoints.projects, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    update: async (id, data) => {
        const formData = new FormData();
        if (data.name) formData.append('name', data.name);
        if (data.project_prefix) formData.append('project_prefix', data.project_prefix);
        if (data.is_active !== undefined) formData.append('is_active', data.is_active);

        const response = await api.put(`${endpoints.projects}/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    getInactive: async () => {
        const response = await api.get(`${endpoints.projects}/inactive`);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`${endpoints.projects}/${id}`);
        return response.data;
    },
};

// --------------------------------------------------
// STORY SERVICE
// --------------------------------------------------
export const storyService = {
    getByProject: async (projectId) => {
        const response = await api.get(endpoints.projectStories(projectId));
        return response.data;
    },

    getProjectBoard: async (projectId) => {
        const response = await api.get(endpoints.projectBoard(projectId));
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(endpoints.story(id));
        return response.data;
    },

    create: async (storyData) => {
        const formData = new FormData();
        Object.keys(storyData).forEach((key) => {
            if (storyData[key] !== null && storyData[key] !== undefined) {
                formData.append(key, storyData[key]);
            }
        });

        const response = await api.post(endpoints.userStories, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    updateStatus: async (id, status) => {
        const formData = new FormData();
        formData.append('status', status);

        const response = await api.put(
            endpoints.story(id),
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        );
        return response.data;
    },

    update: async (id, data) => {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });

        const response = await api.put(endpoints.story(id), formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(endpoints.story(id));
        return response.data;
    },

    getActivity: async (id) => {
        const response = await api.get(endpoints.storyActivity(id));
        return response.data;
    },

    search: async (query) => {
        const response = await api.get(
            `${endpoints.search}?q=${encodeURIComponent(query)}`
        );
        return response.data;
    },

    getIssueTypes: async () => {
        const response = await api.get('/user-stories/types');
        return response.data;
    },

    getAllEpics: async () => {
        const response = await api.get('/user-stories/epics/all');
        return response.data;
    },

    getAvailableParents: async (projectId, issueType, excludeId = null) => {
        let url = `/user-stories/available-parents?project_id=${projectId}&issue_type=${issueType}`;
        if (excludeId) url += `&exclude_id=${excludeId}`;
        const response = await api.get(url);
        return response.data;
    },

    getMyWork: async () => {
        const response = await api.get(endpoints.myWork);
        return response.data;
    },
};

// --------------------------------------------------
// TEAM SERVICE
// --------------------------------------------------
export const teamService = {
    getByProject: async (projectId) => {
        const response = await api.get(endpoints.teams.project(projectId));
        return response.data;
    },

    getAll: async () => {
        const response = await api.get(endpoints.teams.base);
        return response.data;
    },

    getById: async (teamId) => {
        const response = await api.get(
            `${endpoints.teams.base}/${teamId}`
        );
        return response.data;
    },

    create: async (teamData) => {
        const response = await api.post(endpoints.teams.base, teamData);
        return response.data;
    },

    update: async (id, teamData) => {
        const response = await api.put(
            `${endpoints.teams.base}/${id}`,
            teamData
        );
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(
            `${endpoints.teams.base}/${id}`
        );
        return response.data;
    },
};

export default api;
