import User from "../../models/users/user.models.js";
import { generateOTP, sendOTP } from "../../service/login.email.service.js";
import Subscriber from "../../models/users/subscriber.models.js";
import Course from "../../models/course/course.models.js";
import Book from "../../models/books/books.model.js";
import jwt from "jsonwebtoken";
import config from "../../config/config.js";
import Blacklist from "../../models/users/blacklist.models.js";
import mongoose from "mongoose";
import { uploadImage, deleteImage } from "../../config/imagekit.config.js";
import { sendWelcomeEmail, sendAccountStatusUpdateEmail } from '../../service/user.email.service.js';




const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.role
        },
        config.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
};

export const register = async (req, res) => {
    try {
        const { name, username, email, phone, age, city, profession, notify } = req.body

        if (!name || !username || !email) {
            return res.status(400).json({
                message: "Name, username, and email are required fields"
            });
        }

        const existingUsername = await User.findOne({ username: username.toLowerCase() });
        if (existingUsername) {
            return res.status(400).json({
                message: "Username is already taken. Please choose another"
            });
        }

        const existingEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            return res.status(400).json({
                message: "Email is already registered. Please login instead"
            });
        }

        if (phone) {
            const existingPhone = await User.findOne({ phone });
            if (existingPhone) {
                return res.status(400).json({
                    message: "Phone number is already registered"
                });
            }
        }

        const newUser = new User({
            name: name.trim(),
            username: username.toLowerCase().trim(),
            email: email.toLowerCase().trim(),
            phone: phone ? phone.trim() : undefined,
            age: age || undefined,
            city: city ? city.trim() : undefined,
            profession: profession ? profession.trim() : undefined,
            isVerified: false,
            isActive: true,
            role: "user",
            notify: true
        });

        const otp = generateOTP();
        newUser.otp = otp;
        newUser.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
        newUser.otpAttempts = 0;

        await newUser.save();

        // Send OTP email
        await sendOTP(email, name, otp);

        // Send Welcome Email (async - don't await to not block response)
        sendWelcomeEmail({
            name: name,
            email: email
        }).then(result => {
            if (result.success) {
                console.log('Welcome email sent to:', email);
            } else {
                console.error('Failed to send welcome email:', result.error);
            }
        }).catch(error => {
            console.error('Welcome email error:', error);
        });

        const userResponse = newUser.toObject();
        delete userResponse.otp;
        delete userResponse.otpExpires;
        delete userResponse.otpAttempts;

        res.status(201).json({
            success: true,
            message: "User registered successfully. Please verify your email with OTP",
            data: {
                user: userResponse,
                otpSentTo: email
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() })
            .select('+otp +otpExpires +otpAttempts');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "User is already verified"
            });
        }

        if (user.otpExpires < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one"
            });
        }

        if (user.otpAttempts >= 3) {
            return res.status(400).json({
                success: false,
                message: "Too many failed attempts. Please request a new OTP"
            });
        }

        if (user.otp !== otp) {
            user.otpAttempts += 1;
            await user.save();

            return res.status(400).json({
                success: false,
                message: `Invalid OTP. ${3 - user.otpAttempts} attempts remaining`
            });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        user.otpAttempts = undefined;
        await user.save();

        const token = generateToken(user);

        res.cookie("token", token, cookieOptions);

        const userResponse = user.toObject();
        delete userResponse.otp;
        delete userResponse.otpExpires;
        delete userResponse.otpAttempts;

        res.status(200).json({
            success: true,
            message: "User verified successfully",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    isVerified: user.isVerified,
                },
                token
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() })
            .select('+otp +otpExpires +otpAttempts');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "User is already verified"
            });
        }

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        user.otpAttempts = 0;
        await user.save();

        await sendOTP(email, user.name, otp);

        res.status(200).json({
            success: true,
            message: "New OTP sent successfully",
            data: {
                otpSentTo: email
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, phone, username } = req.body;

        let user;
        if (email) {
            user = await User.findOne({ email: email.toLowerCase() });
        } else if (phone) {
            user = await User.findOne({ phone });
        } else if (username) {
            user = await User.findOne({ username: username.toLowerCase() });
        } else {
            return res.status(400).json({
                success: false,
                message: "Email, phone, or username is required"
            });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found. Please register first"
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account is deactivated. Please contact support"
            });
        }

        if (!user.isVerified) {
            const otp = generateOTP();
            await User.findOneAndUpdate(
                { _id: user._id },
                {
                    otp: otp,
                    otpExpires: new Date(Date.now() + 10 * 60 * 1000),
                    otpAttempts: 0
                }
            );
            await sendOTP(user.email, user.name, otp);

            return res.status(401).json({
                success: false,
                message: "User not verified. New OTP sent to your email",
                data: {
                    userId: user._id,
                    email: user.email
                }
            });
        }

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        user.otpAttempts = 0;
        await user.save();

        await sendOTP(user.email, user.name, otp);

        res.status(200).json({
            success: true,
            message: "Login OTP sent successfully. Please verify to login",
            data: {
                userId: user._id,
                email: user.email,
                phone: user.phone
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const verifyLoginOTP = async (req, res) => {
    try {
        const { userId, otp } = req.body;

        if (!userId || !otp) {
            return res.status(400).json({
                success: false,
                message: "User ID and OTP are required"
            });
        }

        const user = await User.findById(userId)
            .select('+otp +otpExpires +otpAttempts');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account is deactivated"
            });
        }

        if (user.otpExpires < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one"
            });
        }

        if (user.otpAttempts >= 3) {
            return res.status(400).json({
                success: false,
                message: "Too many failed attempts. Please request a new OTP"
            });
        }

        if (user.otp !== otp) {
            user.otpAttempts += 1;
            await user.save();

            return res.status(400).json({
                success: false,
                message: `Invalid OTP. ${3 - user.otpAttempts} attempts remaining`
            });
        }

        user.otp = undefined;
        user.otpExpires = undefined;
        user.otpAttempts = undefined;
        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user);

        res.cookie("token", token, cookieOptions);

        const userResponse = user.toObject();
        delete userResponse.otp;
        delete userResponse.otpExpires;
        delete userResponse.otpAttempts;

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: userResponse,
                token: token
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User not found in request"
            });
        }

        const user = await User.findById(userId)
            .select('-otp -otpExpires -otpAttempts -__v')
            .populate('activeSubscriptionId');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    phone: user.phone || null,
                    age: user.age || null,
                    city: user.city || null,
                    profession: user.profession || null,
                    role: user.role,
                    isVerified: user.isVerified,
                    isActive: user.isActive,
                    lastLogin: user.lastLogin || null,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    profilePicture: user.profilePicture || null,
                    bio: user.bio || null,
                    socialLinks: user.socialLinks || {},
                    hasActiveSubscription: user.hasActiveSubscription || false,
                    activeSubscriptionId: user.activeSubscriptionId || null,
                    activeSubscription: user.activeSubscriptionId ? {
                        _id: user.activeSubscriptionId._id,
                        planName: user.activeSubscriptionId.planName,
                        subscriptionId: user.activeSubscriptionId.subscriptionId,
                        startDate: user.activeSubscriptionId.startDate,
                        endDate: user.activeSubscriptionId.endDate,
                        subscriptionStatus: user.activeSubscriptionId.subscriptionStatus,
                        paymentStatus: user.activeSubscriptionId.paymentStatus,
                        sellingPrice: user.activeSubscriptionId.sellingPrice,
                        validity: user.activeSubscriptionId.validity
                    } : null
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User not found in request"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const allowedUpdates = ['name', 'username', 'phone', 'age', 'city', 'profession', 'bio', 'profilePicture'];
        const updateData = {};

        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key) && req.body[key] !== undefined) {
                if (typeof req.body[key] === 'string') {
                    updateData[key] = req.body[key].trim();
                } else {
                    updateData[key] = req.body[key];
                }
            }
        });

        if (req.file) {
            try {
                if (user.profilePicture && user.profilePicture !== 'default-avatar.png') {
                    if (user.profilePictureFileId) {
                        await deleteImage(user.profilePictureFileId);
                    }
                }

                const uploadResult = await uploadImage(req.file, 'profiles');
                updateData.profilePicture = uploadResult.url;
                updateData.profilePictureFileId = uploadResult.fileId;
            } catch (uploadError) {
                return res.status(400).json({
                    success: false,
                    message: "Failed to upload profile picture"
                });
            }
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields to update"
            });
        }

        if (updateData.username) {
            updateData.username = updateData.username.toLowerCase();

            const existingUsername = await User.findOne({
                username: updateData.username,
                _id: { $ne: userId }
            });

            if (existingUsername) {
                return res.status(400).json({
                    success: false,
                    message: "Username is already taken. Please choose another"
                });
            }
        }

        if (updateData.phone) {
            const existingPhone = await User.findOne({
                phone: updateData.phone,
                _id: { $ne: userId }
            });

            if (existingPhone) {
                return res.status(400).json({
                    success: false,
                    message: "Phone number is already registered by another user"
                });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).select('-otp -otpExpires -otpAttempts -__v');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                user: {
                    id: updatedUser._id,
                    name: updatedUser.name,
                    username: updatedUser.username,
                    email: updatedUser.email,
                    phone: updatedUser.phone || null,
                    age: updatedUser.age || null,
                    city: updatedUser.city || null,
                    profession: updatedUser.profession || null,
                    bio: updatedUser.bio || null,
                    profilePicture: updatedUser.profilePicture || null,
                    role: updatedUser.role,
                    isVerified: updatedUser.isVerified,
                    isActive: updatedUser.isActive,
                    lastLogin: updatedUser.lastLogin || null,
                    updatedAt: updatedUser.updatedAt
                }
            }
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Duplicate field value. Please use unique values"
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const logout = async (req, res) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "No token provided"
            });
        }

        let userId = req.user?._id;

        if (!userId) {
            try {
                const decoded = jwt.decode(token);
                userId = decoded?.id;
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid token"
                });
            }
        }

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID not found in token"
            });
        }

        let expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        try {
            const decoded = jwt.decode(token);
            if (decoded?.exp) {
                expiresAt = new Date(decoded.exp * 1000);
            }
        } catch (error) {

        }

        const existingBlacklist = await Blacklist.findOne({ token });
        if (existingBlacklist) {
            res.clearCookie("token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/'
            });

            return res.status(200).json({
                success: true,
                message: "Already logged out"
            });
        }

        await Blacklist.create({
            token: token,
            userId: userId,
            expiresAt: expiresAt
        });

        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        });

        res.status(200).json({
            success: true,
            message: "User logged out successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const search = req.query.search || '';
        const role = req.query.role || '';
        const isVerified = req.query.isVerified;
        const status = req.query.status || '';

        const filter = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } }
            ];
        }
        if (role) filter.role = role;
        if (isVerified !== undefined) filter.isVerified = isVerified === 'true';
        
        if (status) {
            filter.isActive = status === 'active';
        }

        const [users, total] = await Promise.all([
            User.find(filter)
                .select('-otp -otpExpires -otpAttempts -__v')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            data: {
                users: users.map(user => ({
                    id: user._id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    phone: user.phone || null,
                    age: user.age || null,
                    city: user.city || null,
                    profession: user.profession || null,
                    role: user.role,
                    isVerified: user.isVerified,
                    isActive: user.isActive,
                    hasActiveSubscription: user.hasActiveSubscription,
                    profilePicture: user.profilePicture,
                    lastLogin: user.lastLogin || null,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const user = await User.findById(id)
            .select('-otp -otpExpires -otpAttempts -__v')
            .populate({
                path: 'activeSubscriptionId',
                populate: {
                    path: 'subscriptionId',
                    model: 'Subscription'
                }
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const subscriberHistory = await Subscriber.find({ userId: id })
            .populate('subscriptionId')
            .sort({ createdAt: -1 });

        const courseWatchHistory = await Course.find({
            'watchHistory.userId': id
        }).select('title thumbnail description category subject type lessons watchHistory');

        let totalWatchTime = 0;
        let completedCourses = 0;
        let courseWatchData = [];

        for (const course of courseWatchHistory) {
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
            
            courseWatchData.push({
                courseId: course._id,
                title: course.title,
                thumbnail: course.thumbnail,
                description: course.description,
                category: course.category,
                subject: course.subject,
                type: course.type,
                totalLessons: totalLessons,
                completedLessons: completedLessons,
                watchTime: courseWatchTime,
                completed: totalLessons > 0 && completedLessons === totalLessons,
                progress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
            });
        }

        const bookReadHistory = await Book.find({}).select('title thumbnail description category subject authorName pages language type ratings views reads');
        let totalBooksRead = 0;
        let bookReadData = [];

        const userData = {
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                phone: user.phone || null,
                age: user.age || null,
                city: user.city || null,
                profession: user.profession || null,
                role: user.role,
                isVerified: user.isVerified,
                isActive: user.isActive,
                hasActiveSubscription: user.hasActiveSubscription || false,
                profilePicture: user.profilePicture,
                bio: user.bio || null,
                socialLinks: user.socialLinks || {},
                lastLogin: user.lastLogin || null,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            activeSubscription: user.activeSubscriptionId ? {
                id: user.activeSubscriptionId._id,
                planName: user.activeSubscriptionId.planName,
                subscriptionId: user.activeSubscriptionId.subscriptionId,
                price: user.activeSubscriptionId.price,
                sellingPrice: user.activeSubscriptionId.sellingPrice,
                validity: user.activeSubscriptionId.validity,
                startDate: user.activeSubscriptionId.startDate,
                endDate: user.activeSubscriptionId.endDate,
                subscriptionStatus: user.activeSubscriptionId.subscriptionStatus,
                paymentStatus: user.activeSubscriptionId.paymentStatus,
                paymentDate: user.activeSubscriptionId.paymentDate,
                transactionId: user.activeSubscriptionId.transactionId,
                receiptUrl: user.activeSubscriptionId.receiptUrl,
                createdAt: user.activeSubscriptionId.createdAt,
                updatedAt: user.activeSubscriptionId.updatedAt
            } : null,
            subscriptionHistory: subscriberHistory.map(sub => ({
                id: sub._id,
                planName: sub.planName,
                price: sub.price,
                sellingPrice: sub.sellingPrice,
                validity: sub.validity,
                startDate: sub.startDate,
                endDate: sub.endDate,
                subscriptionStatus: sub.subscriptionStatus,
                paymentStatus: sub.paymentStatus,
                paymentDate: sub.paymentDate,
                transactionId: sub.transactionId,
                receiptUrl: sub.receiptUrl,
                createdAt: sub.createdAt,
                updatedAt: sub.updatedAt
            })),
            courseWatchActivity: {
                totalCoursesWatched: courseWatchHistory.length,
                completedCourses: completedCourses,
                totalWatchTime: Math.floor(totalWatchTime / 60),
                totalWatchTimeHours: Math.floor(totalWatchTime / 3600),
                progress: courseWatchData
            },
            bookReadingActivity: {
                totalBooksRead: totalBooksRead,
                books: bookReadData
            },
            stats: {
                totalWatchTimeMinutes: Math.floor(totalWatchTime / 60),
                totalWatchTimeHours: Math.floor(totalWatchTime / 3600),
                totalBooksRead: totalBooksRead,
                hasActiveSubscription: user.hasActiveSubscription || false,
                totalSubscriptions: subscriberHistory.length,
                activeSubscriptions: subscriberHistory.filter(s => s.subscriptionStatus === 'active').length,
                isVerified: user.isVerified,
                isActive: user.isActive
            },
            engagementScore: calculateEngagementScore(courseWatchHistory.length, completedCourses, totalWatchTime, totalBooksRead),
            generatedAt: new Date().toISOString()
        };

        return res.status(200).json({
            success: true,
            data: userData
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

const calculateEngagementScore = (courseCount, completedCourses, watchTime, booksRead) => {
    let score = 0;
    
    if (courseCount > 0) {
        score += Math.min(courseCount * 5, 50);
    }
    
    if (completedCourses > 0) {
        score += Math.min(completedCourses * 15, 150);
    }
    
    const hoursWatched = watchTime / 3600;
    if (hoursWatched > 0) {
        score += Math.min(hoursWatched * 3, 100);
    }
    
    if (booksRead > 0) {
        score += Math.min(booksRead * 10, 100);
    }
    
    return Math.min(score, 400);
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const { role, isActive, isVerified } = req.body;

        const updateData = {};
        let statusChanged = false;
        let previousStatus = user.isActive;
        let currentStatus = user.isActive;
        
        if (role !== undefined) {
            const validRoles = ['user', 'author', 'admin'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid role. Must be user, author, or admin"
                });
            }
            updateData.role = role;
        }

        if (isActive !== undefined) {
            const newStatus = isActive === true || isActive === 'true';
            updateData.isActive = newStatus;
            previousStatus = user.isActive;
            currentStatus = newStatus;
            statusChanged = previousStatus !== currentStatus;
        }

        if (isVerified !== undefined) {
            updateData.isVerified = isVerified === true || isVerified === 'true';
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields to update. Please provide role, isActive, or isVerified"
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).select('-otp -otpExpires -otpAttempts -__v');

        // Send email if status changed
        if (statusChanged) {
            const statusText = currentStatus ? 'active' : 'deactivated';
            const adminName = req.user?.name || 'Admin';
            
            sendAccountStatusUpdateEmail(
                { name: user.name, email: user.email },
                statusText,
                adminName,
                currentStatus ? 'Account activated by admin' : 'Account deactivated by admin'
            ).then(result => {
                if (result.success) {
                    console.log(`Status update email sent to: ${user.email}`);
                } else {
                    console.error('Failed to send status update email:', result.error);
                }
            }).catch(error => {
                console.error('Status email error:', error);
            });
        }

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: {
                user: {
                    id: updatedUser._id,
                    name: updatedUser.name,
                    username: updatedUser.username,
                    email: updatedUser.email,
                    phone: updatedUser.phone,
                    age: updatedUser.age,
                    city: updatedUser.city,
                    profession: updatedUser.profession,
                    role: updatedUser.role,
                    isVerified: updatedUser.isVerified,
                    isActive: updatedUser.isActive,
                    hasActiveSubscription: updatedUser.hasActiveSubscription,
                    updatedAt: updatedUser.updatedAt
                }
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (req.user?._id?.toString() === id) {
            return res.status(400).json({
                success: false,
                message: "You cannot delete your own account"
            });
        }

        await Subscriber.deleteMany({ userId: id });
        
        await Course.updateMany(
            { 'watchHistory.userId': id },
            { $pull: { watchHistory: { userId: id } } }
        );

        await Blacklist.deleteMany({ userId: id });

        await User.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
            data: {
                deletedUserId: id,
                deletedUser: {
                    name: user.name,
                    email: user.email,
                    username: user.username
                }
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};