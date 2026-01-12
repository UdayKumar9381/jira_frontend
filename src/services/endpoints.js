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
