import User from "../../models/users/user.models.js";
import Books from "../../models/books/books.model.js";
import Course from "../../models/course/course.models.js";
import Subscription from "../../models/users/subscription.models.js";
import Subscriber from "../../models/users/subscriber.models.js";
import mongoose from "mongoose";

// ========== GET USER ANALYTICS ==========
export const getUserAnalytics = async (req, res) => {
    try {
        // Get total user counts
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const inactiveUsers = await User.countDocuments({ isActive: false });
        const verifiedUsers = await User.countDocuments({ isVerified: true });
        const unverifiedUsers = await User.countDocuments({ isVerified: false });

        // Get user roles distribution
        const roleDistribution = await User.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } }
        ]);

        // Get users by role
        const adminCount = await User.countDocuments({ role: 'admin' });
        const authorCount = await User.countDocuments({ role: 'author' });
        const userCount = await User.countDocuments({ role: 'user' });

        // Get subscription stats
        const totalSubscriptions = await Subscription.countDocuments();
        const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
        const expiredSubscriptions = await Subscription.countDocuments({ status: 'expired' });
        const cancelledSubscriptions = await Subscription.countDocuments({ status: 'cancelled' });

        // Get users with active subscription
        const usersWithActiveSubscription = await User.countDocuments({ hasActiveSubscription: true });
        const usersWithoutSubscription = totalUsers - usersWithActiveSubscription;

        // Get subscriber stats (if using subscriber model)
        const totalSubscribers = await Subscriber.countDocuments();
        const activeSubscribers = await Subscriber.countDocuments({ isActive: true });

        // Get recent user signups (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentSignups = await User.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        // Get user growth by month (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const monthlyGrowth = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        // Get daily signups (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const dailySignups = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
            }
        ]);

        // Get user engagement stats (users who have interacted with content)
        // Users who have enrolled in courses
        const usersWithCourses = await Course.distinct('watchHistory.userId');
        const usersWithCourseActivity = usersWithCourses.length;

        // Get average age of users
        const ageStats = await User.aggregate([
            {
                $match: { age: { $exists: true, $ne: null } }
            },
            {
                $group: {
                    _id: null,
                    avgAge: { $avg: "$age" },
                    minAge: { $min: "$age" },
                    maxAge: { $max: "$age" }
                }
            }
        ]);

        // Get top cities
        const topCities = await User.aggregate([
            {
                $match: { city: { $exists: true, $ne: null, $ne: "" } }
            },
            {
                $group: {
                    _id: "$city",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 5
            }
        ]);

        // Get top professions
        const topProfessions = await User.aggregate([
            {
                $match: { profession: { $exists: true, $ne: null, $ne: "" } }
            },
            {
                $group: {
                    _id: "$profession",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 5
            }
        ]);

        // Get verification status over time (last 6 months)
        const verificationTrend = await User.aggregate([
            {
                $match: {
                    updatedAt: { $gte: sixMonthsAgo },
                    isVerified: true
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$updatedAt" },
                        month: { $month: "$updatedAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        return res.status(200).json({
            success: true,
            data: {
                // User Counts
                totalUsers,
                activeUsers,
                inactiveUsers,
                verifiedUsers,
                unverifiedUsers,
                
                // Role Distribution
                roleDistribution: {
                    admin: adminCount,
                    author: authorCount,
                    user: userCount,
                    breakdown: roleDistribution
                },
                
                // Subscription Stats
                subscriptionStats: {
                    totalSubscriptions,
                    activeSubscriptions,
                    expiredSubscriptions,
                    cancelledSubscriptions,
                    usersWithActiveSubscription,
                    usersWithoutSubscription,
                    totalSubscribers,
                    activeSubscribers
                },
                
                // User Growth
                recentSignups,
                monthlyGrowth,
                dailySignups,
                
                // User Engagement
                engagement: {
                    usersWithCourseActivity,
                    engagementRate: totalUsers > 0 
                        ? Math.round((usersWithCourseActivity / totalUsers) * 100) 
                        : 0
                },
                
                // Demographics
                demographics: {
                    averageAge: ageStats[0]?.avgAge ? Math.round(ageStats[0].avgAge) : 0,
                    minAge: ageStats[0]?.minAge || 0,
                    maxAge: ageStats[0]?.maxAge || 0,
                    topCities: topCities.map(city => ({
                        city: city._id,
                        count: city.count
                    })),
                    topProfessions: topProfessions.map(prof => ({
                        profession: prof._id,
                        count: prof.count
                    }))
                },
                
                // Verification Trend
                verificationTrend,
                
                // Timestamp
                generatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Get user analytics error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// ========== GET SUBSCRIPTION ANALYTICS ==========
export const getSubscriptionAnalytics = async (req, res) => {
    try {
        // Get all subscriptions with their details
        const subscriptions = await Subscription.find().sort({ order: 1 });

        // Get subscription stats
        const totalPlans = subscriptions.length;
        const activePlans = await Subscription.countDocuments({ isActive: true });
        const inactivePlans = await Subscription.countDocuments({ isActive: false });

        // Get subscriber counts per plan
        const subscriberCounts = await Subscriber.aggregate([
            {
                $group: {
                    _id: "$planName",
                    count: { $sum: 1 },
                    activeCount: {
                        $sum: {
                            $cond: [{ $eq: ["$subscriptionStatus", "active"] }, 1, 0]
                        }
                    },
                    revenue: {
                        $sum: "$sellingPrice"
                    }
                }
            }
        ]);

        // Get total revenue from all subscribers
        const totalRevenue = await Subscriber.aggregate([
            {
                $match: { paymentStatus: "success" }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$sellingPrice" }
                }
            }
        ]);

        // Get monthly revenue (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyRevenue = await Subscriber.aggregate([
            {
                $match: {
                    paymentDate: { $gte: sixMonthsAgo },
                    paymentStatus: "success"
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$paymentDate" },
                        month: { $month: "$paymentDate" }
                    },
                    total: { $sum: "$sellingPrice" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        // Get subscription status distribution
        const statusDistribution = await Subscriber.aggregate([
            {
                $group: {
                    _id: "$subscriptionStatus",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get recent subscribers (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentSubscribers = await Subscriber.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        // Get plan distribution
        const planDistribution = await Subscriber.aggregate([
            {
                $group: {
                    _id: "$planName",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        return res.status(200).json({
            success: true,
            data: {
                // Plan Stats
                totalPlans,
                activePlans,
                inactivePlans,
                plans: subscriptions.map(plan => ({
                    id: plan._id,
                    title: plan.title,
                    price: plan.price,
                    sellingPrice: plan.sellingPrice,
                    validity: `${plan.validity.value} ${plan.validity.unit}`,
                    isActive: plan.isActive,
                    order: plan.order,
                    features: plan.features,
                    about: plan.about
                })),
                
                // Subscriber Stats
                subscriberStats: {
                    totalSubscribers: await Subscriber.countDocuments(),
                    recentSubscribers,
                    subscriberCounts: subscriberCounts.map(item => ({
                        planName: item._id,
                        total: item.count,
                        active: item.activeCount,
                        revenue: item.revenue || 0
                    }))
                },
                
                // Revenue Stats
                revenueStats: {
                    totalRevenue: totalRevenue[0]?.total || 0,
                    monthlyRevenue: monthlyRevenue.map(item => ({
                        year: item._id.year,
                        month: item._id.month,
                        total: item.total,
                        count: item.count
                    }))
                },
                
                // Status Distribution
                statusDistribution: statusDistribution.map(item => ({
                    status: item._id || 'unknown',
                    count: item.count
                })),
                
                // Plan Distribution
                planDistribution: planDistribution.map(item => ({
                    planName: item._id,
                    count: item.count
                })),
                
                generatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Get subscription analytics error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// ========== GET SUBSCRIBER ANALYTICS ==========
export const getSubscriberAnalytics = async (req, res) => {
    try {
        // Get total subscribers
        const totalSubscribers = await Subscriber.countDocuments();
        const activeSubscribers = await Subscriber.countDocuments({ 
            subscriptionStatus: 'active' 
        });
        const expiredSubscribers = await Subscriber.countDocuments({ 
            subscriptionStatus: 'expired' 
        });
        const pendingSubscribers = await Subscriber.countDocuments({ 
            subscriptionStatus: 'pending' 
        });
        const cancelledSubscribers = await Subscriber.countDocuments({ 
            subscriptionStatus: 'cancelled' 
        });

        // Get payment status distribution
        const paymentStatusDistribution = await Subscriber.aggregate([
            {
                $group: {
                    _id: "$paymentStatus",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get subscribers by plan
        const subscribersByPlan = await Subscriber.aggregate([
            {
                $group: {
                    _id: "$planName",
                    count: { $sum: 1 },
                    activeCount: {
                        $sum: {
                            $cond: [{ $eq: ["$subscriptionStatus", "active"] }, 1, 0]
                        }
                    }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        // Get recent subscribers (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentSubscribers = await Subscriber.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        // Get subscribers by month (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlySubscribers = await Subscriber.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        // Get expiring soon (next 30 days)
        const nextThirtyDays = new Date();
        nextThirtyDays.setDate(nextThirtyDays.getDate() + 30);

        const expiringSoon = await Subscriber.countDocuments({
            endDate: { 
                $gte: new Date(),
                $lte: nextThirtyDays
            },
            subscriptionStatus: 'active'
        });

        // Get average subscription duration (in days)
        const avgDuration = await Subscriber.aggregate([
            {
                $match: {
                    startDate: { $exists: true },
                    endDate: { $exists: true }
                }
            },
            {
                $project: {
                    duration: {
                        $divide: [
                            { $subtract: ["$endDate", "$startDate"] },
                            1000 * 60 * 60 * 24 // convert to days
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    avgDuration: { $avg: "$duration" }
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            data: {
                // Subscriber Counts
                totalSubscribers,
                activeSubscribers,
                expiredSubscribers,
                pendingSubscribers,
                cancelledSubscribers,
                
                // Recent Activity
                recentSubscribers,
                expiringSoon,
                
                // Payment Status
                paymentStatusDistribution: paymentStatusDistribution.map(item => ({
                    status: item._id || 'unknown',
                    count: item.count
                })),
                
                // Plan Distribution
                subscribersByPlan: subscribersByPlan.map(item => ({
                    planName: item._id,
                    total: item.count,
                    active: item.activeCount
                })),
                
                // Monthly Growth
                monthlySubscribers: monthlySubscribers.map(item => ({
                    year: item._id.year,
                    month: item._id.month,
                    count: item.count
                })),
                
                // Average Duration
                averageSubscriptionDays: avgDuration[0]?.avgDuration 
                    ? Math.round(avgDuration[0].avgDuration) 
                    : 0,
                
                // Conversion Rate (subscribers vs total users)
                totalUsers: await User.countDocuments(),
                conversionRate: await User.countDocuments() > 0 
                    ? Math.round((totalSubscribers / await User.countDocuments()) * 100) 
                    : 0,
                
                generatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Get subscriber analytics error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// ========== GET BOOKS ANALYTICS ==========
export const getBooksAnalytics = async (req, res) => {
    try {
        // Get total books
        const totalBooks = await Books.countDocuments();
        const activeBooks = await Books.countDocuments({ status: 'active' });
        const pendingBooks = await Books.countDocuments({ status: 'pending' });
        const draftBooks = await Books.countDocuments({ status: 'draft' });
        const archivedBooks = await Books.countDocuments({ status: 'archived' });

        // Get free vs premium
        const freeBooks = await Books.countDocuments({ type: 'free' });
        const premiumBooks = await Books.countDocuments({ type: 'premium' });

        // Get total views and reads
        const totalViews = await Books.aggregate([
            { $group: { _id: null, total: { $sum: "$views" } } }
        ]);

        const totalReads = await Books.aggregate([
            { $group: { _id: null, total: { $sum: "$reads" } } }
        ]);

        const totalDownloads = await Books.aggregate([
            { $group: { _id: null, total: { $sum: "$downloads" } } }
        ]);

        const totalSaves = await Books.aggregate([
            { $group: { _id: null, total: { $sum: "$totalSaves" } } }
        ]);

        // Get top books by views
        const topViewedBooks = await Books.find()
            .sort({ views: -1 })
            .limit(5)
            .select('title views reads downloads category');

        // Get top books by reads
        const topReadBooks = await Books.find()
            .sort({ reads: -1 })
            .limit(5)
            .select('title views reads downloads category');

        // Get category distribution
        const categoryDistribution = await Books.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        // Get subject distribution
        const subjectDistribution = await Books.aggregate([
            {
                $group: {
                    _id: "$subject",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        // Get language distribution
        const languageDistribution = await Books.aggregate([
            {
                $group: {
                    _id: "$language",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        // Get average rating
        const avgRating = await Books.aggregate([
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: "$ratings.average" }
                }
            }
        ]);

        // Get books added in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentBooks = await Books.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        // Get books by month (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyBooks = await Books.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        return res.status(200).json({
            success: true,
            data: {
                // Book Counts
                totalBooks,
                activeBooks,
                pendingBooks,
                draftBooks,
                archivedBooks,
                freeBooks,
                premiumBooks,
                
                // Recent Activity
                recentBooks,
                
                // Engagement Stats
                engagement: {
                    totalViews: totalViews[0]?.total || 0,
                    totalReads: totalReads[0]?.total || 0,
                    totalDownloads: totalDownloads[0]?.total || 0,
                    totalSaves: totalSaves[0]?.total || 0
                },
                
                // Top Books
                topViewedBooks: topViewedBooks.map(book => ({
                    title: book.title,
                    views: book.views,
                    reads: book.reads,
                    downloads: book.downloads,
                    category: book.category
                })),
                
                topReadBooks: topReadBooks.map(book => ({
                    title: book.title,
                    views: book.views,
                    reads: book.reads,
                    downloads: book.downloads,
                    category: book.category
                })),
                
                // Distribution
                categoryDistribution: categoryDistribution.map(item => ({
                    category: item._id,
                    count: item.count
                })),
                
                subjectDistribution: subjectDistribution.map(item => ({
                    subject: item._id,
                    count: item.count
                })),
                
                languageDistribution: languageDistribution.map(item => ({
                    language: item._id,
                    count: item.count
                })),
                
                // Rating
                averageRating: avgRating[0]?.avgRating || 0,
                
                // Monthly Growth
                monthlyBooks: monthlyBooks.map(item => ({
                    year: item._id.year,
                    month: item._id.month,
                    count: item.count
                })),
                
                generatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Get books analytics error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// ========== GET COURSES ANALYTICS ==========
export const getCoursesAnalytics = async (req, res) => {
    try {
        // Get total courses
        const totalCourses = await Course.countDocuments();
        const activeCourses = await Course.countDocuments({ courseStatus: 'active' });
        const pendingCourses = await Course.countDocuments({ courseStatus: 'pending' });
        const draftCourses = await Course.countDocuments({ courseStatus: 'draft' });
        const archivedCourses = await Course.countDocuments({ courseStatus: 'archived' });

        // Get free vs premium
        const freeCourses = await Course.countDocuments({ type: 'free' });
        const premiumCourses = await Course.countDocuments({ type: 'premium' });

        // Get total views and watch time
        const totalViews = await Course.aggregate([
            { $group: { _id: null, total: { $sum: "$views" } } }
        ]);

        const totalWatchTime = await Course.aggregate([
            { $group: { _id: null, total: { $sum: "$totalWatchTime" } } }
        ]);

        const totalUniqueViewers = await Course.aggregate([
            { $group: { _id: null, total: { $sum: "$uniqueViewers" } } }
        ]);

        // Get top courses by views
        const topViewedCourses = await Course.find()
            .sort({ views: -1 })
            .limit(5)
            .select('title views totalWatchTime uniqueViewers rating category type');

        // Get top courses by watch time
        const topWatchedCourses = await Course.find()
            .sort({ totalWatchTime: -1 })
            .limit(5)
            .select('title views totalWatchTime uniqueViewers rating category type');

        // Get category distribution
        const categoryDistribution = await Course.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        // Get subject distribution
        const subjectDistribution = await Course.aggregate([
            {
                $group: {
                    _id: "$subject",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        // Get language distribution
        const languageDistribution = await Course.aggregate([
            { $unwind: "$languages" },
            {
                $group: {
                    _id: "$languages",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        // Get average rating
        const avgRating = await Course.aggregate([
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: "$rating.average" }
                }
            }
        ]);

        // Get courses added in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentCourses = await Course.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        // Get courses by month (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyCourses = await Course.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        // Get lesson stats
        const totalLessons = await Course.aggregate([
            { $project: { lessonCount: { $size: "$lessons" } } },
            { $group: { _id: null, total: { $sum: "$lessonCount" } } }
        ]);

        const avgLessonsPerCourse = await Course.aggregate([
            { $project: { lessonCount: { $size: "$lessons" } } },
            { $group: { _id: null, avg: { $avg: "$lessonCount" } } }
        ]);

        return res.status(200).json({
            success: true,
            data: {
                // Course Counts
                totalCourses,
                activeCourses,
                pendingCourses,
                draftCourses,
                archivedCourses,
                freeCourses,
                premiumCourses,
                
                // Recent Activity
                recentCourses,
                
                // Engagement Stats
                engagement: {
                    totalViews: totalViews[0]?.total || 0,
                    totalWatchTime: totalWatchTime[0]?.total || 0,
                    totalWatchTimeHours: totalWatchTime[0]?.total 
                        ? Math.round(totalWatchTime[0].total / 3600) 
                        : 0,
                    totalUniqueViewers: totalUniqueViewers[0]?.total || 0
                },
                
                // Lesson Stats
                lessonStats: {
                    totalLessons: totalLessons[0]?.total || 0,
                    avgLessonsPerCourse: avgLessonsPerCourse[0]?.avg 
                        ? Math.round(avgLessonsPerCourse[0].avg) 
                        : 0
                },
                
                // Top Courses
                topViewedCourses: topViewedCourses.map(course => ({
                    title: course.title,
                    views: course.views,
                    watchTime: course.totalWatchTime,
                    uniqueViewers: course.uniqueViewers,
                    rating: course.rating?.average || 0,
                    category: course.category,
                    type: course.type
                })),
                
                topWatchedCourses: topWatchedCourses.map(course => ({
                    title: course.title,
                    views: course.views,
                    watchTime: course.totalWatchTime,
                    uniqueViewers: course.uniqueViewers,
                    rating: course.rating?.average || 0,
                    category: course.category,
                    type: course.type
                })),
                
                // Distribution
                categoryDistribution: categoryDistribution.map(item => ({
                    category: item._id,
                    count: item.count
                })),
                
                subjectDistribution: subjectDistribution.map(item => ({
                    subject: item._id,
                    count: item.count
                })),
                
                languageDistribution: languageDistribution.map(item => ({
                    language: item._id,
                    count: item.count
                })),
                
                // Rating
                averageRating: avgRating[0]?.avgRating || 0,
                
                // Monthly Growth
                monthlyCourses: monthlyCourses.map(item => ({
                    year: item._id.year,
                    month: item._id.month,
                    count: item.count
                })),
                
                generatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Get courses analytics error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// ========== GET SINGLE USER ANALYTICS ==========
export const getUserAnalyticsById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const user = await User.findById(id)
            .select('-__v -otp -otpExpires -otpAttempts');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Get user's subscription history
        const subscriptionHistory = await Subscription.find({ userId: id })
            .sort({ createdAt: -1 });

        // Get user's active subscription
        const activeSubscription = await Subscription.findOne({ 
            userId: id,
            status: 'active'
        });

        // Get user's subscriber info
        const subscriberInfo = await Subscriber.findOne({ userId: id });

        // Get user's course progress
        const courseProgress = await Course.find({
            'watchHistory.userId': id
        }).select('title watchHistory');

        // Calculate total watch time
        let totalWatchTime = 0;
        let completedCourses = 0;
        let courseProgressData = [];

        for (const course of courseProgress) {
            const userWatchHistory = course.watchHistory.filter(
                w => w.userId.toString() === id.toString()
            );
            
            const courseWatchTime = userWatchHistory.reduce((sum, w) => sum + w.watchTime, 0);
            totalWatchTime += courseWatchTime;
            
            const totalLessons = course.lessons?.length || 0;
            const completedLessons = userWatchHistory.filter(w => w.completed).length;
            
            if (totalLessons > 0 && completedLessons === totalLessons) {
                completedCourses++;
            }
            
            courseProgressData.push({
                courseId: course._id,
                title: course.title,
                watchTime: courseWatchTime,
                completed: totalLessons > 0 && completedLessons === totalLessons,
                progress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
            });
        }

        // Get user stats
        const userStats = {
            // Basic Info
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                isActive: user.isActive,
                hasActiveSubscription: user.hasActiveSubscription,
                profilePicture: user.profilePicture,
                bio: user.bio,
                city: user.city,
                profession: user.profession,
                age: user.age,
                socialLinks: user.socialLinks,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            
            // Subscription Info
            subscription: {
                active: activeSubscription || null,
                history: subscriptionHistory,
                subscriber: subscriberInfo || null
            },
            
            // Course Activity
            courseActivity: {
                totalCourses: courseProgress.length,
                completedCourses,
                totalWatchTime: Math.floor(totalWatchTime / 60), // in minutes
                totalWatchTimeHours: Math.floor(totalWatchTime / 3600), // in hours
                progress: courseProgressData
            },
            
            // Engagement Score (based on activity)
            engagementScore: calculateEngagementScore(courseProgress.length, completedCourses, totalWatchTime),
            
            generatedAt: new Date().toISOString()
        };

        return res.status(200).json({
            success: true,
            data: userStats
        });

    } catch (error) {
        console.error('Get user analytics by ID error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Helper function to calculate engagement score
const calculateEngagementScore = (courseCount, completedCourses, watchTime) => {
    let score = 0;
    
    // Points for course enrollment
    if (courseCount > 0) {
        score += Math.min(courseCount * 10, 100);
    }
    
    // Points for completed courses
    if (completedCourses > 0) {
        score += Math.min(completedCourses * 20, 200);
    }
    
    // Points for watch time (in hours)
    const hoursWatched = watchTime / 3600;
    if (hoursWatched > 0) {
        score += Math.min(hoursWatched * 5, 100);
    }
    
    return Math.min(score, 400); // Max score 400
};



// ========== GET REVENUE ANALYTICS ==========
export const getRevenueAnalytics = async (req, res) => {
    try {
        // Get current date for calculations
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // Get today's revenue
        const todayRevenue = await Subscriber.aggregate([
            {
                $match: {
                    paymentStatus: "success",
                    paymentDate: { $gte: startOfDay }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$sellingPrice" },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get this week's revenue (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const weeklyRevenue = await Subscriber.aggregate([
            {
                $match: {
                    paymentStatus: "success",
                    paymentDate: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$sellingPrice" },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get this month's revenue
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const monthlyRevenue = await Subscriber.aggregate([
            {
                $match: {
                    paymentStatus: "success",
                    paymentDate: { $gte: startOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$sellingPrice" },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get last month's revenue
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const lastMonthRevenue = await Subscriber.aggregate([
            {
                $match: {
                    paymentStatus: "success",
                    paymentDate: { 
                        $gte: startOfLastMonth,
                        $lte: endOfLastMonth
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$sellingPrice" },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get this year's revenue
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        const yearlyRevenue = await Subscriber.aggregate([
            {
                $match: {
                    paymentStatus: "success",
                    paymentDate: { $gte: startOfYear }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$sellingPrice" },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get total revenue (all time)
        const totalRevenue = await Subscriber.aggregate([
            {
                $match: { paymentStatus: "success" }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$sellingPrice" },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get monthly revenue breakdown (last 12 months)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const monthlyBreakdown = await Subscriber.aggregate([
            {
                $match: {
                    paymentStatus: "success",
                    paymentDate: { $gte: twelveMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$paymentDate" },
                        month: { $month: "$paymentDate" }
                    },
                    total: { $sum: "$sellingPrice" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        // Get revenue by plan
        const revenueByPlan = await Subscriber.aggregate([
            {
                $match: { paymentStatus: "success" }
            },
            {
                $group: {
                    _id: "$planName",
                    total: { $sum: "$sellingPrice" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { total: -1 }
            }
        ]);

        // Get daily revenue for current month
        const dailyRevenue = await Subscriber.aggregate([
            {
                $match: {
                    paymentStatus: "success",
                    paymentDate: { $gte: startOfMonth }
                }
            },
            {
                $group: {
                    _id: {
                        day: { $dayOfMonth: "$paymentDate" },
                        month: { $month: "$paymentDate" },
                        year: { $year: "$paymentDate" }
                    },
                    total: { $sum: "$sellingPrice" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
            }
        ]);

        // Get subscription revenue (active subscribers monthly recurring)
        const activeSubscribersRevenue = await Subscriber.aggregate([
            {
                $match: {
                    subscriptionStatus: "active",
                    paymentStatus: "success"
                }
            },
            {
                $group: {
                    _id: null,
                    monthlyRecurring: { $sum: "$sellingPrice" },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Calculate growth percentages
        const currentMonthTotal = monthlyRevenue[0]?.total || 0;
        const lastMonthTotal = lastMonthRevenue[0]?.total || 0;
        
        const monthOverMonthGrowth = lastMonthTotal > 0 
            ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 
            : 0;

        const currentYearTotal = yearlyRevenue[0]?.total || 0;
        const lastYearTotal = await Subscriber.aggregate([
            {
                $match: {
                    paymentStatus: "success",
                    paymentDate: {
                        $gte: new Date(now.getFullYear() - 1, 0, 1),
                        $lte: new Date(now.getFullYear() - 1, 11, 31)
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$sellingPrice" }
                }
            }
        ]);

        const yearOverYearGrowth = (lastYearTotal[0]?.total || 0) > 0 
            ? ((currentYearTotal - (lastYearTotal[0]?.total || 0)) / (lastYearTotal[0]?.total || 0)) * 100 
            : 0;

        return res.status(200).json({
            success: true,
            data: {
                // Revenue Overview
                overview: {
                    today: {
                        total: todayRevenue[0]?.total || 0,
                        count: todayRevenue[0]?.count || 0
                    },
                    thisWeek: {
                        total: weeklyRevenue[0]?.total || 0,
                        count: weeklyRevenue[0]?.count || 0
                    },
                    thisMonth: {
                        total: monthlyRevenue[0]?.total || 0,
                        count: monthlyRevenue[0]?.count || 0
                    },
                    thisYear: {
                        total: yearlyRevenue[0]?.total || 0,
                        count: yearlyRevenue[0]?.count || 0
                    },
                    allTime: {
                        total: totalRevenue[0]?.total || 0,
                        count: totalRevenue[0]?.count || 0
                    }
                },

                // Recurring Revenue
                recurringRevenue: {
                    monthlyRecurring: activeSubscribersRevenue[0]?.monthlyRecurring || 0,
                    activeSubscribers: activeSubscribersRevenue[0]?.count || 0
                },

                // Growth Metrics
                growth: {
                    monthOverMonth: {
                        percentage: monthOverMonthGrowth,
                        trend: monthOverMonthGrowth > 0 ? 'up' : monthOverMonthGrowth < 0 ? 'down' : 'stable',
                        currentMonth: currentMonthTotal,
                        lastMonth: lastMonthTotal
                    },
                    yearOverYear: {
                        percentage: yearOverYearGrowth,
                        trend: yearOverYearGrowth > 0 ? 'up' : yearOverYearGrowth < 0 ? 'down' : 'stable',
                        currentYear: currentYearTotal,
                        lastYear: lastYearTotal[0]?.total || 0
                    }
                },

                // Breakdowns
                breakdowns: {
                    byPlan: revenueByPlan.map(item => ({
                        planName: item._id,
                        total: item.total,
                        count: item.count
                    })),
                    monthly: monthlyBreakdown.map(item => ({
                        year: item._id.year,
                        month: item._id.month,
                        total: item.total,
                        count: item.count,
                        monthName: new Date(item._id.year, item._id.month - 1).toLocaleString('default', { month: 'long' })
                    })),
                    daily: dailyRevenue.map(item => ({
                        day: item._id.day,
                        month: item._id.month,
                        year: item._id.year,
                        total: item.total,
                        count: item.count
                    }))
                },

                // Summary Stats
                summary: {
                    averageTransactionValue: (totalRevenue[0]?.count || 0) > 0 
                        ? (totalRevenue[0]?.total || 0) / (totalRevenue[0]?.count || 0)
                        : 0,
                    totalTransactions: totalRevenue[0]?.count || 0,
                    highestRevenueMonth: monthlyBreakdown.length > 0 
                        ? monthlyBreakdown.reduce((max, item) => item.total > max.total ? item : max)
                        : null,
                    lowestRevenueMonth: monthlyBreakdown.length > 0 
                        ? monthlyBreakdown.reduce((min, item) => item.total < min.total ? item : min)
                        : null
                },

                generatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Get revenue analytics error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};


// ========== GET ALL NOTIFICATIONS FOR ADMIN (Users + Subscribers) ==========
export const getUserNotifications = async (req, res) => {
    try {
        // 1. Get users with notify: true (unread user registrations)
        const users = await User.find({ notify: true })
            .select('name username email profilePicture role createdAt isVerified')
            .sort({ createdAt: -1 })
            .lean();

        // 2. Get subscribers with notify: true (unread subscription purchases)
        const subscribers = await Subscriber.find({ notify: true })
            .populate('userId', 'name username email profilePicture')
            .populate('subscriptionId', 'title')
            .sort({ createdAt: -1 })
            .lean();

        // 3. Format user notifications
        const userNotifications = users.map(user => ({
            id: user._id,
            type: 'user_registration',
            title: 'New User Registered',
            message: `${user.name} (${user.username}) has created a new account`,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                role: user.role,
                isVerified: user.isVerified
            },
            createdAt: user.createdAt,
            isRead: false,
            source: 'user'
        }));

        // 4. Format subscriber notifications
        const subscriberNotifications = subscribers.map(sub => ({
            id: sub._id,
            type: 'subscription_purchase',
            title: 'New Subscription Purchase',
            message: `${sub.userId?.name || 'User'} purchased ${sub.planName} plan (₹${sub.sellingPrice})`,
            user: {
                id: sub.userId?._id,
                name: sub.userId?.name || 'Unknown',
                username: sub.userId?.username || 'unknown',
                email: sub.userId?.email || sub.userEmail || 'No email',
                profilePicture: sub.userId?.profilePicture || null,
                role: sub.userId?.role || 'user'
            },
            subscription: {
                id: sub._id,
                planName: sub.planName,
                amount: sub.sellingPrice,
                validity: sub.validity,
                startDate: sub.startDate,
                endDate: sub.endDate,
                transactionId: sub.transactionId,
                paymentStatus: sub.paymentStatus,
                subscriptionStatus: sub.subscriptionStatus
            },
            createdAt: sub.createdAt,
            isRead: false,
            source: 'subscriber'
        }));

        // 5. Combine and sort by createdAt (newest first)
        const allNotifications = [...userNotifications, ...subscriberNotifications]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // 6. Calculate total unread count
        const unreadCount = allNotifications.length;

        return res.status(200).json({
            success: true,
            data: {
                notifications: allNotifications,
                unreadCount: unreadCount,
                breakdown: {
                    users: userNotifications.length,
                    subscribers: subscriberNotifications.length
                }
            }
        });

    } catch (error) {
        console.error('Get notifications error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// ========== MARK ALL NOTIFICATIONS AS READ (Users + Subscribers) ==========
export const markAllNotificationsAsRead = async (req, res) => {
    try {
        // 1. Update all users with notify: true to notify: false
        const userResult = await User.updateMany(
            { notify: true },
            { notify: false }
        );

        // 2. Update all subscribers with notify: true to notify: false
        const subscriberResult = await Subscriber.updateMany(
            { notify: true },
            { notify: false }
        );

        const totalMarked = (userResult.modifiedCount || 0) + (subscriberResult.modifiedCount || 0);

        return res.status(200).json({
            success: true,
            message: "All notifications marked as read",
            data: {
                markedCount: totalMarked,
                usersMarked: userResult.modifiedCount || 0,
                subscribersMarked: subscriberResult.modifiedCount || 0
            }
        });

    } catch (error) {
        console.error('Mark all notifications as read error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// ========== GET UNREAD NOTIFICATION COUNT (Users + Subscribers) ==========
export const getUnreadNotificationCount = async (req, res) => {
    try {
        // 1. Count users with notify: true
        const userUnreadCount = await User.countDocuments({ notify: true });

        // 2. Count subscribers with notify: true
        const subscriberUnreadCount = await Subscriber.countDocuments({ notify: true });

        const totalUnreadCount = userUnreadCount + subscriberUnreadCount;

        return res.status(200).json({
            success: true,
            data: {
                unreadCount: totalUnreadCount,
                breakdown: {
                    users: userUnreadCount,
                    subscribers: subscriberUnreadCount
                }
            }
        });

    } catch (error) {
        console.error('Get unread notification count error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// ========== SEARCH ITEMS (Books + Courses) ==========
export const searchItems = async (req, res) => {
    try {
        const { 
            query, 
            itemType = 'all',      // 'all', 'books', 'courses'
            priceType = 'all',     // 'all', 'free', 'premium'
            category, 
            subject, 
            sortBy = 'popular',
            page = 1, 
            limit = 20 
        } = req.query;

        if (!query || query.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: "Search query must be at least 2 characters"
            });
        }

        const searchQuery = query.trim();
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const limitNum = parseInt(limit);

        // Simple regex for search
        const regex = { $regex: searchQuery, $options: 'i' };
        const words = searchQuery.split(' ').filter(w => w.length > 0);
        const searchRegex = words.length > 1 ? { $regex: words.join('|'), $options: 'i' } : regex;

        let books = [];
        let courses = [];
        let booksTotal = 0;
        let coursesTotal = 0;

        // Check if we should search books
        if (itemType === 'all' || itemType === 'books') {
            const bookFilters = { status: 'active' };
            
            if (priceType && priceType !== 'all') {
                bookFilters.type = priceType;
            }
            if (category) {
                bookFilters.category = { $regex: category, $options: 'i' };
            }
            if (subject) {
                bookFilters.subject = { $regex: subject, $options: 'i' };
            }

            // Search in multiple fields
            const bookQuery = {
                ...bookFilters,
                $or: [
                    { title: searchRegex },
                    { description: searchRegex },
                    { authorName: searchRegex },
                    { category: searchRegex },
                    { subject: searchRegex },
                    { publication: searchRegex }
                ]
            };

            // Sort
            let sort = { views: -1 };
            if (sortBy === 'rating') sort = { 'ratings.average': -1 };
            if (sortBy === 'newest') sort = { createdAt: -1 };
            if (sortBy === 'oldest') sort = { createdAt: 1 };

            const [bookResults, bookCount] = await Promise.all([
                Books.find(bookQuery)
                    .select('title thumbnail description category subject authorName type status language ratings views reads downloads createdAt')
                    .sort(sort)
                    .skip(skip)
                    .limit(limitNum)
                    .lean(),
                Books.countDocuments(bookQuery)
            ]);

            books = bookResults;
            booksTotal = bookCount;
        }

        // Check if we should search courses
        if (itemType === 'all' || itemType === 'courses') {
            const courseFilters = { 
                courseStatus: 'active', 
               
            };
            
            if (priceType && priceType !== 'all') {
                courseFilters.type = priceType;
            }
            if (category) {
                courseFilters.category = { $regex: category, $options: 'i' };
            }
            if (subject) {
                courseFilters.subject = { $regex: subject, $options: 'i' };
            }

            const courseQuery = {
                ...courseFilters,
                $or: [
                    { title: searchRegex },
                    { description: searchRegex },
                    { category: searchRegex },
                    { subject: searchRegex },
                    { 'instructors.name': { $regex: searchQuery, $options: 'i' } }
                ]
            };

            // Sort
            let sort = { views: -1 };
            if (sortBy === 'rating') sort = { 'rating.average': -1 };
            if (sortBy === 'newest') sort = { createdAt: -1 };
            if (sortBy === 'oldest') sort = { createdAt: 1 };

            const [courseResults, courseCount] = await Promise.all([
                Course.find(courseQuery)
                    .select('title thumbnail description category subject type languages instructors features rating views totalWatchTime uniqueViewers createdAt')
                    .sort(sort)
                    .skip(skip)
                    .limit(limitNum)
                    .lean(),
                Course.countDocuments(courseQuery)
            ]);

            courses = courseResults;
            coursesTotal = courseCount;
        }

        // Format results
        const formattedBooks = books.map(book => ({
            ...book,
            _id: book._id,
            type: 'book',
            rating: book.ratings?.average || 0,
            ratingCount: book.ratings?.count || 0,
            engagement: {
                views: book.views || 0,
                reads: book.reads || 0,
                downloads: book.downloads || 0
            }
        }));

        const formattedCourses = courses.map(course => ({
            ...course,
            _id: course._id,
            type: 'course',
            rating: course.rating?.average || 0,
            ratingCount: course.rating?.count || 0,
            engagement: {
                views: course.views || 0,
                watchTime: course.totalWatchTime || 0,
                uniqueViewers: course.uniqueViewers || 0
            }
        }));

        // Combine results (books first, then courses)
        const allResults = [...formattedBooks, ...formattedCourses];
        const totalResults = allResults.length;

        // Apply pagination to combined results
        const paginatedResults = allResults.slice(skip, skip + limitNum);

        return res.status(200).json({
            success: true,
            data: {
                results: paginatedResults,
                pagination: {
                    page: parseInt(page),
                    limit: limitNum,
                    total: totalResults,
                    pages: Math.ceil(totalResults / limitNum),
                    hasNext: (skip + limitNum) < totalResults,
                    hasPrev: parseInt(page) > 1
                },
                breakdown: {
                    books: booksTotal,
                    courses: coursesTotal,
                    total: totalResults
                },
                search: {
                    query: searchQuery,
                    itemType: itemType || 'all',
                    priceType: priceType || 'all',
                    category: category || null,
                    subject: subject || null,
                    sortBy: sortBy || 'popular'
                }
            }
        });

    } catch (error) {
        console.error('Search items error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};