import api from './apiClient';
import { endpoints } from './endpoints';

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
