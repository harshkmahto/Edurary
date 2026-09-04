import api from "./api";

const courseService = {
    // ========== CREATE COURSE ==========
    createCourse: async (formData) => {
        try {
            const response = await api.post('/course/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to create course'
            };
        }
    },

    // ========== GET ALL COURSES (ADMIN) ==========
    getAllCourses: async (params = {}) => {
        try {
            const response = await api.get('/course', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to fetch courses'
            };
        }
    },

    // ========== GET COURSE BY ID (ADMIN) ==========
    getCourseById: async (id) => {
        try {
            const response = await api.get(`/course/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to fetch course'
            };
        }
    },

    // ========== GET COURSE STATS ==========
    getCourseStats: async () => {
        try {
            const response = await api.get('/course/stats');
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to fetch course stats'
            };
        }
    },

    // ========== UPDATE COURSE ==========
    updateCourse: async (id, formData) => {
        try {
            const response = await api.put(`/course/update/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to update course'
            };
        }
    },

    // ========== DELETE COURSE ==========
    deleteCourse: async (id) => {
        try {
            const response = await api.delete(`/course/delete/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to delete course'
            };
        }
    },

    // ========== TOGGLE COURSE STATUS ==========
    toggleCourseStatus: async (id, courseStatus) => {
        try {
            const response = await api.patch(`/course/toggle-status/${id}`, { courseStatus });
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to toggle course status'
            };
        }
    },



    getUserCourses: async (params = {}) => {
        try {
            const response = await api.get('/course/user/courses', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to fetch courses'
            };
        }
    },

    getUserCourseById: async (id) => {
        try {
            const response = await api.get(`/course/user/courses/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to fetch course details'
            };
        }
    },


    getCourseLessons: async (id) => {
        try {
            const response = await api.get(`/course/user/courses/${id}/lessons`);
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to fetch course lessons'
            };
        }
    },

    trackLessonWatchTime: async (courseId, data) => {
        try {
            const response = await api.post(`/course/user/courses/${courseId}/watch`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to track watch time'
            };
        }
    },

    getUserCourseProgress: async (courseId) => {
        try {
            const response = await api.get(`/course/user/courses/${courseId}/progress`);
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                message: 'Failed to fetch course progress'
            };
        }
    },

}

export default courseService

export const {
    createCourse,
    getAllCourses,
    getCourseById,
    getCourseStats,
    updateCourse,
    deleteCourse,
    toggleCourseStatus,
    getUserCourses,
    getUserCourseById,
     getCourseLessons,
    trackLessonWatchTime,
    getUserCourseProgress,
} = courseService;