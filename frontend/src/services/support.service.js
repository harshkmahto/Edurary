// services/support.service.js
import api from './api';

const supportService = {
    // ========== CREATE REPORT ==========
    createReport: async (reportData) => {
        try {
            const response = await api.post('/support/create', reportData);
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to create report'
            };
        }
    },

    // ========== GET ALL REPORTS (ADMIN) ==========
    getAllReports: async (params = {}) => {
        try {
            const response = await api.get('/support/admin/all', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to fetch reports'
            };
        }
    },

    // ========== UPDATE REPORT STATUS (ADMIN) ==========
    updateReportStatus: async (reportId, statusData) => {
        try {
            const response = await api.patch(`/support/admin/${reportId}/status`, statusData);
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to update report status'
            };
        }
    },
    getTotalReports: async () => {
        try {
            const response = await api.get('/support/admin/total');
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to get total reports'
            };
        }
    }

};

export default supportService;

export const {
    createReport,
    getAllReports,
    updateReportStatus,
    getTotalReports
} = supportService;