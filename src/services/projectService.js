import api from './apiClient';
import { endpoints } from './endpoints';

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
