import api from './apiClient';
import { endpoints } from './endpoints';

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
