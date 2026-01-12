import api from './apiClient';
import { endpoints } from './endpoints';

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
