import { Router } from 'express';
import { 
    getUserAnalytics, 
    getUserAnalyticsById,
    getSubscriptionAnalytics,
    getSubscriberAnalytics,
    getBooksAnalytics,
    getCoursesAnalytics,
    getRevenueAnalytics,
    getUserNotifications,
    markAllNotificationsAsRead,
    getUnreadNotificationCount,
    searchItems
} from '../controller/analytics/analytics.controller.js';
import { admin, auth } from '../middleware/auth.middleware.js';

const analyticsRouter = Router();

// ========== USER ANALYTICS ==========
analyticsRouter.get('/admin/users', auth, admin, getUserAnalytics);
analyticsRouter.get('/admin/users/:id', auth, admin, getUserAnalyticsById);

// ========== SUBSCRIPTION ANALYTICS ==========
analyticsRouter.get('/admin/subscriptions', auth, admin, getSubscriptionAnalytics);

// ========== SUBSCRIBER ANALYTICS ==========
analyticsRouter.get('/admin/subscribers', auth, admin, getSubscriberAnalytics);

// ========== BOOKS ANALYTICS ==========
analyticsRouter.get('/admin/books', auth, admin, getBooksAnalytics);

// ========== COURSES ANALYTICS ==========
analyticsRouter.get('/admin/courses', auth, admin, getCoursesAnalytics);

analyticsRouter.get('/admin/revenue', auth, admin, getRevenueAnalytics);


//------------------------Notification--------------------
analyticsRouter.get('/user/notify', auth, admin, getUserNotifications);
analyticsRouter.put('/notification/read-all', auth, admin, markAllNotificationsAsRead);
analyticsRouter.get('/notification/unread', auth, admin, getUnreadNotificationCount);

analyticsRouter.get('/search/items', searchItems)

export default analyticsRouter;