import api from "./api";

const analyticsService = {
    // ========== USER ANALYTICS ==========
    
    // Get all user analytics
    getUserAnalytics: async () => {
        try {
            const response = await api.get('/analytics/admin/users');
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to fetch user analytics'
            };
        }
    },

    // Get single user analytics by ID
    getUserAnalyticsById: async (userId) => {
        try {
            const response = await api.get(`/analytics/admin/users/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to fetch user analytics'
            };
        }
    },

    // ========== SUBSCRIPTION ANALYTICS ==========
    
    // Get subscription analytics
    getSubscriptionAnalytics: async () => {
        try {
            const response = await api.get('/analytics/admin/subscriptions');
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to fetch subscription analytics'
            };
        }
    },

    // ========== SUBSCRIBER ANALYTICS ==========
    
    // Get subscriber analytics
    getSubscriberAnalytics: async () => {
        try {
            const response = await api.get('/analytics/admin/subscribers');
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to fetch subscriber analytics'
            };
        }
    },

    // ========== BOOKS ANALYTICS ==========
    
    // Get books analytics
    getBooksAnalytics: async () => {
        try {
            const response = await api.get('/analytics/admin/books');
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to fetch books analytics'
            };
        }
    },

    // ========== COURSES ANALYTICS ==========
    
    // Get courses analytics
    getCoursesAnalytics: async () => {
        try {
            const response = await api.get('/analytics/admin/courses');
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to fetch courses analytics'
            };
        }
    },

    // analytics.service.js
getRevenueAnalytics: async () => {
    try {
        const response = await api.get('/analytics/admin/revenue');
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: 'Failed to fetch revenue analytics'
        };
    }
},

getusernotification: async () => {
    try {
        const response = await api.get('/analytics/user/notify');
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: 'Failed to fetch notification'
        };
    }
},

markAllNotificationsRead: async () => {
    try {
        const response = await api.put('/analytics/notification/read-all');
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: 'Failed to mark notifications as read'
        };
    }
},

getUnreadNotificationCount: async () => {
    try {
        const response = await api.get('/analytics/admin/notifications/unread-count');
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: 'Failed to fetch unread notification count'
        };
    }
},

searchItems: async (params) => {
    try {
        const response = await api.get('/analytics/search/items', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: 'Failed to search items'
        };
    }
},

};

export default analyticsService;

export const {
    getUserAnalytics,
    getUserAnalyticsById,
    getSubscriptionAnalytics,
    getSubscriberAnalytics,
    getBooksAnalytics,
    getCoursesAnalytics,
    getRevenueAnalytics,
    getusernotification,
    markAllNotificationsRead,
    getUnreadNotificationCount,
    searchItems
} = analyticsService;