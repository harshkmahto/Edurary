import Course from "../../models/course/course.models.js";
import { uploadImage, deleteImage } from "../../config/imagekit.config.js";
import mongoose from "mongoose";

export const createCourse = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            subject,
            languages,
            instructors,
            features,
            about,
            lessons,
            type,
            premiumPlans,
            courseStatus,
            order
        } = req.body;

        if (!title || !description || !category || !subject || !languages) {
            return res.status(400).json({
                success: false,
                message: "Title, description, category, subject and languages are required"
            });
        }

        let parsedInstructors = instructors;
        if (typeof instructors === 'string') {
            try {
                parsedInstructors = JSON.parse(instructors);
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid instructors format. Must be a valid JSON array"
                });
            }
        }

        if (!parsedInstructors || parsedInstructors.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one instructor is required"
            });
        }

        for (const instructor of parsedInstructors) {
            if (!instructor.name) {
                return res.status(400).json({
                    success: false,
                    message: "Each instructor must have a name"
                });
            }
        }

        let parsedLessons = lessons;
        if (typeof lessons === 'string') {
            try {
                parsedLessons = JSON.parse(lessons);
            } catch (e) {
                parsedLessons = [];
            }
        }

        if (parsedLessons && parsedLessons.length > 0) {
            for (const lesson of parsedLessons) {
                if (!lesson.sectionName || !lesson.videoLink) {
                    return res.status(400).json({
                        success: false,
                        message: "Each lesson must have a section name and video link"
                    });
                }
                if (!lesson.order) {
                    lesson.order = parsedLessons.indexOf(lesson) + 1;
                }
            }
        }

        let parsedFeatures = features;
        if (typeof features === 'string') {
            try {
                parsedFeatures = JSON.parse(features);
            } catch (e) {
                parsedFeatures = features ? [features] : [];
            }
        }

        let parsedAbout = about;
        if (typeof about === 'string') {
            try {
                parsedAbout = JSON.parse(about);
            } catch (e) {
                parsedAbout = {};
            }
        }

        let parsedLanguage = languages;
        if (typeof languages === 'string') {
            try {
                parsedLanguage = JSON.parse(languages);
            } catch (e) {
                parsedLanguage = [languages];
            }
        }

        let parsedPremiumPlans = premiumPlans;
        if (typeof premiumPlans === 'string') {
            try {
                parsedPremiumPlans = JSON.parse(premiumPlans);
            } catch (e) {
                parsedPremiumPlans = [];
            }
        }

        if (type === 'premium') {
            if (!parsedPremiumPlans || parsedPremiumPlans.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Please select at least one premium plan (basic, premium, or elite)"
                });
            }

            const validPlans = ['basic', 'premium', 'elite'];
            const invalidPlans = parsedPremiumPlans.filter(plan => !validPlans.includes(plan));
            if (invalidPlans.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid premium plans: ${invalidPlans.join(', ')}. Must be basic, premium, or elite`
                });
            }
        }

        let thumbnailUrl = null;
        let thumbnailFileId = null;
        if (req.files && req.files.thumbnail) {
            const thumbnailFile = req.files.thumbnail[0];
            const uploadResult = await uploadImage(thumbnailFile, 'courses/thumbnails');
            thumbnailUrl = uploadResult.url;
            thumbnailFileId = uploadResult.fileId;
        } else {
            return res.status(400).json({
                success: false,
                message: "Thumbnail image is required"
            });
        }

        const instructorProfiles = req.files && req.files.instructorProfiles ? req.files.instructorProfiles : [];
        
        const processedInstructors = await Promise.all(parsedInstructors.map(async (instructor, index) => {
            const profileFile = instructorProfiles[index];
            let profileUrl = instructor.profile || '';
            let profileFileId = null;

            if (profileFile) {
                try {
                    const uploadResult = await uploadImage(profileFile, 'courses/instructors');
                    profileUrl = uploadResult.url;
                    profileFileId = uploadResult.fileId;
                } catch (error) {
                    console.error(`Error uploading instructor ${index} profile:`, error);
                }
            }

            return {
                ...instructor,
                profile: profileUrl,
                profileFileId: profileFileId
            };
        }));

        const course = await Course.create({
            title,
            thumbnail: thumbnailUrl,
            thumbnailFileId,
            description,
            category,
            subject,
            languages: parsedLanguage,
            instructors: processedInstructors,
            features: parsedFeatures || [],
            about: parsedAbout || {},
            lessons: parsedLessons || [],
            type: type || 'free',
            premiumPlans: parsedPremiumPlans || [],
            courseStatus: courseStatus || 'draft',
            order: parseInt(order) || 0,
            views: 0,
            rating: {
                average: 0,
                count: 0
            }
        });

        return res.status(201).json({
            success: true,
            message: "Course created successfully",
            course
        });

    } catch (error) {
        console.error('Create course error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID"
            });
        }

        const existingCourse = await Course.findById(id);
        if (!existingCourse) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        const {
            title,
            description,
            category,
            subject,
            languages,
            instructors,
            features,
            about,
            lessons,
            type,
            premiumPlans,
            courseStatus,
            order
        } = req.body;

        let parsedInstructors = instructors;
        if (typeof instructors === 'string') {
            try {
                parsedInstructors = JSON.parse(instructors);
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid instructors format. Must be a valid JSON array"
                });
            }
        }

        if (parsedInstructors && parsedInstructors.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one instructor is required"
            });
        }

        if (parsedInstructors) {
            for (const instructor of parsedInstructors) {
                if (!instructor.name) {
                    return res.status(400).json({
                        success: false,
                        message: "Each instructor must have a name"
                    });
                }
            }
        }

        let parsedLessons = lessons;
        if (typeof lessons === 'string') {
            try {
                parsedLessons = JSON.parse(lessons);
            } catch (e) {
                parsedLessons = [];
            }
        }

        if (parsedLessons && parsedLessons.length > 0) {
            for (const lesson of parsedLessons) {
                if (!lesson.sectionName || !lesson.videoLink) {
                    return res.status(400).json({
                        success: false,
                        message: "Each lesson must have a section name and video link"
                    });
                }
            }
        }

        let parsedFeatures = features;
        if (typeof features === 'string') {
            try {
                parsedFeatures = JSON.parse(features);
            } catch (e) {
                parsedFeatures = features ? [features] : [];
            }
        }

        let parsedAbout = about;
        if (typeof about === 'string') {
            try {
                parsedAbout = JSON.parse(about);
            } catch (e) {
                parsedAbout = {};
            }
        }

        let parsedLanguage = languages;
        if (typeof languages === 'string') {
            try {
                parsedLanguage = JSON.parse(languages);
            } catch (e) {
                parsedLanguage = [languages];
            }
        }

        let parsedPremiumPlans = premiumPlans;
        if (typeof premiumPlans === 'string') {
            try {
                parsedPremiumPlans = JSON.parse(premiumPlans);
            } catch (e) {
                parsedPremiumPlans = [];
            }
        }

        const finalType = type || existingCourse.type;
        if (finalType === 'premium') {
            const finalPlans = parsedPremiumPlans || existingCourse.premiumPlans;
            if (!finalPlans || finalPlans.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Please select at least one premium plan (basic, premium, or elite)"
                });
            }

            const validPlans = ['basic', 'premium', 'elite'];
            const invalidPlans = finalPlans.filter(plan => !validPlans.includes(plan));
            if (invalidPlans.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid premium plans: ${invalidPlans.join(', ')}. Must be basic, premium, or elite`
                });
            }
        }

        const instructorProfiles = req.files && req.files.instructorProfiles ? req.files.instructorProfiles : [];
        
        let processedInstructors = parsedInstructors;
        if (parsedInstructors) {
            processedInstructors = await Promise.all(parsedInstructors.map(async (instructor, index) => {
                const profileFile = instructorProfiles[index];
                let profileUrl = instructor.profile || '';
                let profileFileId = instructor.profileFileId || null;

                if (profileFile) {
                    if (instructor.profileFileId) {
                        try {
                            await deleteImage(instructor.profileFileId);
                        } catch (error) {
                            console.error('Error deleting old instructor profile:', error);
                        }
                    }

                    try {
                        const uploadResult = await uploadImage(profileFile, 'courses/instructors');
                        profileUrl = uploadResult.url;
                        profileFileId = uploadResult.fileId;
                    } catch (error) {
                        console.error(`Error uploading instructor ${index} profile:`, error);
                    }
                }

                return {
                    ...instructor,
                    profile: profileUrl,
                    profileFileId: profileFileId
                };
            }));
        }

        let updateData = {
            ...(title && { title }),
            ...(description && { description }),
            ...(category && { category }),
            ...(subject && { subject }),
            ...(parsedLanguage && { languages: parsedLanguage }),
            ...(processedInstructors && { instructors: processedInstructors }),
            ...(parsedFeatures !== undefined && { features: parsedFeatures }),
            ...(parsedAbout !== undefined && { about: parsedAbout }),
            ...(parsedLessons !== undefined && { lessons: parsedLessons }),
            ...(type && { type }),
            ...(parsedPremiumPlans !== undefined && { premiumPlans: parsedPremiumPlans }),
            ...(courseStatus && { courseStatus }),
            ...(order !== undefined && { order: parseInt(order) })
        };

        if (req.files && req.files.thumbnail) {
            if (existingCourse.thumbnailFileId) {
                try {
                    await deleteImage(existingCourse.thumbnailFileId);
                } catch (error) {
                    console.error('Error deleting old thumbnail:', error);
                }
            }

            const thumbnailFile = req.files.thumbnail[0];
            const uploadResult = await uploadImage(thumbnailFile, 'courses/thumbnails');
            updateData.thumbnail = uploadResult.url;
            updateData.thumbnailFileId = uploadResult.fileId;
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Course updated successfully",
            course: updatedCourse
        });

    } catch (error) {
        console.error('Update course error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const getAllCourses = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            category,
            subject,
            type,
            courseStatus,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const filter = {};
        
        if (search) {
            filter.$text = { $search: search };
        }
        if (category) {
            filter.category = category;
        }
        if (subject) {
            filter.subject = subject;
        }
        if (type) {
            filter.type = type;
        }
        if (courseStatus) {
            filter.courseStatus = courseStatus;
        }

        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const limitInt = parseInt(limit);

        const courses = await Course.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limitInt);

        const total = await Course.countDocuments(filter);

        return res.status(200).json({
            success: true,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
            courses
        });

    } catch (error) {
        console.error('Get all courses error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID"
            });
        }

        const course = await Course.findById(id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        return res.status(200).json({
            success: true,
            course
        });

    } catch (error) {
        console.error('Get course by ID error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID"
            });
        }

        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        if (course.thumbnailFileId) {
            try {
                await deleteImage(course.thumbnailFileId);
            } catch (error) {
                console.error('Error deleting thumbnail:', error);
            }
        }

        if (course.instructors && course.instructors.length > 0) {
            for (const instructor of course.instructors) {
                if (instructor.profileFileId) {
                    try {
                        await deleteImage(instructor.profileFileId);
                    } catch (error) {
                        console.error('Error deleting instructor profile:', error);
                    }
                }
            }
        }

        await Course.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Course deleted successfully"
        });

    } catch (error) {
        console.error('Delete course error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const getCourseStats = async (req, res) => {
    try {
        const total = await Course.countDocuments();
        const active = await Course.countDocuments({ courseStatus: 'active' });
        const pending = await Course.countDocuments({ courseStatus: 'pending' });
        const draft = await Course.countDocuments({ courseStatus: 'draft' });
        const archived = await Course.countDocuments({ courseStatus: 'archived' });
        const free = await Course.countDocuments({ type: 'free' });
        const premium = await Course.countDocuments({ type: 'premium' });

        const totalViews = await Course.aggregate([
            { $group: { _id: null, total: { $sum: "$views" } } }
        ]);

        const totalEnrollments = await Course.aggregate([
            { $group: { _id: null, total: { $sum: "$enrollmentCount" } } }
        ]);

        const avgRating = await Course.aggregate([
            { $group: { _id: null, avg: { $avg: "$rating.average" } } }
        ]);

        return res.status(200).json({
            success: true,
            stats: {
                total,
                active,
                pending,
                draft,
                archived,
                free,
                premium,
                totalViews: totalViews[0]?.total || 0,
                totalEnrollments: totalEnrollments[0]?.total || 0,
                averageRating: avgRating[0]?.avg || 0
            }
        });

    } catch (error) {
        console.error('Get course stats error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const toggleCourseStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { courseStatus } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID"
            });
        }

        if (!['draft', 'pending', 'active', 'archived'].includes(courseStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be draft, pending, active, or archived"
            });
        }

        const course = await Course.findByIdAndUpdate(
            id,
            { courseStatus },
            { new: true, runValidators: true }
        );

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: `Course status updated to ${courseStatus}`,
            course
        });

    } catch (error) {
        console.error('Toggle course status error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const getUserCourseById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID"
            });
        }

        const course = await Course.findOne({
            _id: id,
            courseStatus: 'active'
        }).select('-__v -lessons -watchHistory');

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found or not available"
            });
        }

        await Course.findByIdAndUpdate(
            id,
            { $inc: { views: 1 } }
        );

        const updatedCourse = await Course.findById(id)
            .select('-__v -lessons -watchHistory');

        return res.status(200).json({
            success: true,
            course: updatedCourse
        });

    } catch (error) {
        console.error('Get user course by ID error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const getCourseLessons = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required to access lessons. Please login."
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID"
            });
        }

        const course = await Course.findOne({
            _id: id,
            courseStatus: 'active'
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found or not available"
            });
        }

        let hasAccess = false;
        let lessonsToReturn = [];
        let accessMessage = '';

        if (course.type === 'free') {
            hasAccess = true;
            lessonsToReturn = course.lessons.filter(lesson => lesson.isPublic === true);
            accessMessage = 'Access granted to free course lessons';
        } else if (course.type === 'premium') {
            const user = await User.findById(userId).select('hasActiveSubscription');
            if (user && user.hasActiveSubscription) {
                hasAccess = true;
                lessonsToReturn = course.lessons.filter(lesson => lesson.isPublic === true);
                accessMessage = 'Access granted to premium course lessons';
            } else {
                accessMessage = 'Active subscription required to access premium course lessons';
            }
        }

        if (hasAccess) {
            const existingView = await Course.findOne({
                _id: id,
                'watchHistory.userId': userId
            });

            if (!existingView) {
                await Course.findByIdAndUpdate(
                    id,
                    { $inc: { uniqueViewers: 1 } }
                );
            }
        }

        const courseData = {
            _id: course._id,
            title: course.title,
            type: course.type,
            hasAccess: hasAccess,
            message: accessMessage,
            totalLessons: course.lessons.filter(lesson => lesson.isPublic === true).length,
            lessons: hasAccess ? lessonsToReturn : []
        };

        if (hasAccess && userId) {
            const userWatchHistory = course.watchHistory.filter(
                w => w.userId.toString() === userId.toString()
            );

            const totalLessons = course.lessons.filter(lesson => lesson.isPublic === true).length;
            const completedLessons = userWatchHistory.filter(w => w.completed).length;
            const totalWatchTime = userWatchHistory.reduce((sum, w) => sum + w.watchTime, 0);
            const progressPercentage = totalLessons > 0 
                ? Math.round((completedLessons / totalLessons) * 100) 
                : 0;

            courseData.progress = {
                totalLessons,
                completedLessons,
                totalWatchTime: Math.floor(totalWatchTime / 60),
                progressPercentage
            };

            courseData.lessons = courseData.lessons.map((lesson, index) => {
                const watch = userWatchHistory.find(w => w.lessonIndex === index);
                return {
                    ...lesson.toObject(),
                    watchTime: watch?.watchTime || 0,
                    completed: watch?.completed || false,
                    progress: lesson.duration > 0 
                        ? Math.round((watch?.watchTime || 0) / lesson.duration * 100)
                        : 0,
                    lastWatchedAt: watch?.lastWatchedAt || null
                };
            });
        }

        return res.status(200).json({
            success: true,
            data: courseData
        });

    } catch (error) {
        console.error('Get course lessons error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const getUserCourses = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            category,
            subject,
            type,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const filter = { courseStatus: 'active' };
        
        if (search) {
            filter.$text = { $search: search };
        }
        if (category) {
            filter.category = category;
        }
        if (subject) {
            filter.subject = subject;
        }
        if (type) {
            filter.type = type;
        }

        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const limitInt = parseInt(limit);

        const courses = await Course.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limitInt)
            .select('-__v -lessons -watchHistory');

        const total = await Course.countDocuments(filter);

        const stats = {
            totalCourses: total,
            freeCourses: await Course.countDocuments({ ...filter, type: 'free' }),
            premiumCourses: await Course.countDocuments({ ...filter, type: 'premium' }),
            averageRating: await Course.aggregate([
                { $match: filter },
                { $group: { _id: null, avg: { $avg: "$rating.average" } } }
            ]).then(result => result[0]?.avg || 0)
        };

        return res.status(200).json({
            success: true,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
            stats,
            courses
        });

    } catch (error) {
        console.error('Get user courses error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const trackLessonWatchTime = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { lessonIndex, watchTime, completed } = req.body;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID"
            });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        let hasAccess = false;
        if (course.type === 'free') {
            hasAccess = true;
        } else if (course.type === 'premium') {
            const user = await User.findById(userId).select('hasActiveSubscription');
            if (user && user.hasActiveSubscription) {
                hasAccess = true;
            }
        }

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: "You don't have access to this course"
            });
        }

        if (!course.lessons[lessonIndex]) {
            return res.status(404).json({
                success: false,
                message: "Lesson not found"
            });
        }

        if (!course.lessons[lessonIndex].isPublic) {
            return res.status(403).json({
                success: false,
                message: "This lesson is private and cannot be accessed"
            });
        }

        const existingWatch = course.watchHistory.find(
            w => w.userId.toString() === userId.toString() && w.lessonIndex === lessonIndex
        );

        if (existingWatch) {
            existingWatch.watchTime = Math.max(existingWatch.watchTime, watchTime || 0);
            existingWatch.lastWatchedAt = new Date();
            if (completed) {
                existingWatch.completed = true;
            }
        } else {
            course.watchHistory.push({
                userId,
                lessonIndex,
                watchTime: watchTime || 0,
                lastWatchedAt: new Date(),
                completed: completed || false
            });
        }

        const userTotalWatchTime = course.watchHistory
            .filter(w => w.userId.toString() === userId.toString())
            .reduce((sum, w) => sum + w.watchTime, 0);

        course.totalWatchTime = course.watchHistory.reduce((sum, w) => sum + w.watchTime, 0);

        await course.save();

        return res.status(200).json({
            success: true,
            message: "Watch time updated successfully",
            data: {
                lessonIndex,
                watchTime: watchTime || 0,
                totalCourseWatchTime: userTotalWatchTime,
                completed: completed || false
            }
        });

    } catch (error) {
        console.error('Track lesson watch time error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const getUserCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID"
            });
        }

        const course = await Course.findById(courseId)
            .select('watchHistory lessons totalWatchTime type');

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        let hasAccess = false;
        if (course.type === 'free') {
            hasAccess = true;
        } else if (course.type === 'premium') {
            const user = await User.findById(userId).select('hasActiveSubscription');
            if (user && user.hasActiveSubscription) {
                hasAccess = true;
            }
        }

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: "You don't have access to this course"
            });
        }

        const publicLessons = course.lessons.filter(lesson => lesson.isPublic === true);

        const userWatchHistory = course.watchHistory.filter(
            w => w.userId.toString() === userId.toString()
        );

        const totalLessons = publicLessons.length;
        const completedLessons = userWatchHistory.filter(w => w.completed).length;
        const totalWatchTime = userWatchHistory.reduce((sum, w) => sum + w.watchTime, 0);
        const progressPercentage = totalLessons > 0 
            ? Math.round((completedLessons / totalLessons) * 100) 
            : 0;

        const lessonProgress = publicLessons.map((lesson, index) => {
            const watch = userWatchHistory.find(w => w.lessonIndex === index);
            return {
                lessonIndex: index,
                sectionName: lesson.sectionName,
                duration: lesson.duration,
                isPublic: lesson.isPublic,
                watchTime: watch?.watchTime || 0,
                completed: watch?.completed || false,
                lastWatchedAt: watch?.lastWatchedAt || null,
                progress: lesson.duration > 0 
                    ? Math.round((watch?.watchTime || 0) / lesson.duration * 100)
                    : 0
            };
        });

        return res.status(200).json({
            success: true,
            data: {
                totalLessons,
                completedLessons,
                totalWatchTime: Math.floor(totalWatchTime / 60),
                progressPercentage,
                lessonProgress
            }
        });

    } catch (error) {
        console.error('Get user course progress error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};