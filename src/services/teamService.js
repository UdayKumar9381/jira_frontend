import api from './apiClient';
import { endpoints } from './endpoints';

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
