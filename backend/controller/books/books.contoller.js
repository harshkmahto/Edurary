import Book from "../../models/books/books.model.js";
import { uploadImage, deleteImage, uploadFile, deleteFile } from "../../config/imagekit.config.js";
import mongoose from "mongoose";
import Subscriber from "../../models/users/subscriber.models.js";
import User from "../../models/users/user.models.js";

export const createBook = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            subject,
            authorName,
            pages,
            edition,
            publication,
            features,
            about,
            type,
            premiumPlans,
            status,
            language,
            order,
        } = req.body;

        if (!title || !description || !category || !subject || !authorName || !pages) {
            return res.status(400).json({
                success: false,
                message: "Title, description, category, subject, author name and pages are required"
            });
        }

        let parsedFeatures = features;
        let parsedAbout = about;
        let parsedPremiumPlans = premiumPlans;

        if (typeof features === 'string') {
            try {
                parsedFeatures = JSON.parse(features);
            } catch (e) {
                parsedFeatures = features ? [features] : [];
            }
        }

        if (typeof about === 'string') {
            try {
                parsedAbout = JSON.parse(about);
            } catch (e) {
                parsedAbout = {};
            }
        }

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
            const uploadResult = await uploadImage(thumbnailFile, 'books/thumbnails');
            thumbnailUrl = uploadResult.url;
            thumbnailFileId = uploadResult.fileId;
        } else {
            return res.status(400).json({
                success: false,
                message: "Thumbnail image is required"
            });
        }

        let contentUrl = null;
        let contentFileId = null;
        if (req.files && req.files.content) {
            const contentFile = req.files.content[0];
            const uploadResult = await uploadFile(contentFile, 'books/content');
            contentUrl = uploadResult.url;
            contentFileId = uploadResult.fileId;
        } else {
            return res.status(400).json({
                success: false,
                message: "Book content (PDF) is required"
            });
        }

        const book = await Book.create({
            title,
            thumbnail: thumbnailUrl,
            thumbnailFileId,
            description,
            category,
            subject,
            authorName,
            content: contentUrl,
            contentFileId,
            pages: parseInt(pages),
            edition: edition || '',
            publication: publication || '',
            features: parsedFeatures || [],
            about: parsedAbout || {},
            type: type || 'free',
            premiumPlans: parsedPremiumPlans || [],
            status: status || 'pending',
            language,
            order: parseInt(order) || 0,
            views: 0,
            downloads: 0,
            ratings: {
                average: 0,
                count: 0,
                distribution: {}
            }
        });

        return res.status(201).json({
            success: true,
            message: "Book created successfully",
            book
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const getAllBooks = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search, 
            category, 
            subject, 
            type, 
            status,
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
        if (status) {
            filter.status = status;
        }

        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const limitInt = parseInt(limit);

        const books = await Book.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limitInt);

        const total = await Book.countDocuments(filter);

        return res.status(200).json({
            success: true,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
            books
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const getBookById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid book ID"
            });
        }

        const book = await Book.findById(id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        return res.status(200).json({
            success: true,
            book
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const updateBook = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid book ID"
            });
        }

        const existingBook = await Book.findById(id);
        if (!existingBook) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        const {
            title,
            description,
            category,
            subject,
            authorName,
            pages,
            edition,
            publication,
            features,
            about,
            type,
            premiumPlans,
            status,
            language,
            order,
        } = req.body;

        let parsedFeatures = features;
        let parsedAbout = about;
        let parsedPremiumPlans = premiumPlans;

        if (typeof features === 'string') {
            try {
                parsedFeatures = JSON.parse(features);
            } catch (e) {
                parsedFeatures = features ? [features] : [];
            }
        }

        if (typeof about === 'string') {
            try {
                parsedAbout = JSON.parse(about);
            } catch (e) {
                parsedAbout = {};
            }
        }

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

        const updateData = {
            ...(title && { title }),
            ...(description && { description }),
            ...(category && { category }),
            ...(subject && { subject }),
            ...(authorName && { authorName }),
            ...(pages && { pages: parseInt(pages) }),
            ...(edition !== undefined && { edition }),
            ...(publication !== undefined && { publication }),
            ...(parsedFeatures !== undefined && { features: parsedFeatures }),
            ...(parsedAbout !== undefined && { about: parsedAbout }),
            ...(type && { type }),
            ...(parsedPremiumPlans !== undefined && { premiumPlans: parsedPremiumPlans }),
            ...(status && { status }),
            ...(language && { language }),
            ...(order !== undefined && { order: parseInt(order) }),
        };

        if (req.files && req.files.thumbnail) {
            if (existingBook.thumbnailFileId) {
                try {
                    await deleteImage(existingBook.thumbnailFileId);
                } catch (error) {
                }
            }

            const thumbnailFile = req.files.thumbnail[0];
            const uploadResult = await uploadImage(thumbnailFile, 'books/thumbnails');
            updateData.thumbnail = uploadResult.url;
            updateData.thumbnailFileId = uploadResult.fileId;
        }

        if (req.files && req.files.content) {
            if (existingBook.contentFileId) {
                try {
                    await deleteFile(existingBook.contentFileId);
                } catch (error) {
                }
            }

            const contentFile = req.files.content[0];
            const uploadResult = await uploadFile(contentFile, 'books/content');
            updateData.content = uploadResult.url;
            updateData.contentFileId = uploadResult.fileId;
        }

        const updatedBook = await Book.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Book updated successfully",
            book: updatedBook
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid book ID"
            });
        }

        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        if (book.thumbnailFileId) {
            try {
                await deleteImage(book.thumbnailFileId);
            } catch (error) {
            }
        }

        if (book.contentFileId) {
            try {
                await deleteFile(book.contentFileId);
            } catch (error) {
            }
        }

        await Book.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Book deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const toggleBookStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid book ID"
            });
        }

        if (!['active', 'pending', 'draft', 'archived'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be active, pending, draft, or archived"
            });
        }

        const book = await Book.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: `Book status updated to ${status}`,
            book
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const getBooksStats = async (req, res) => {
    try {
        const total = await Book.countDocuments();
        const active = await Book.countDocuments({ status: 'active' });
        const pending = await Book.countDocuments({ status: 'pending' });
        const draft = await Book.countDocuments({ status: 'draft' });
        const archived = await Book.countDocuments({ status: 'archived' });
        const free = await Book.countDocuments({ type: 'free' });
        const premium = await Book.countDocuments({ type: 'premium' });

        return res.status(200).json({
            success: true,
            stats: {
                total,
                active,
                pending,
                draft,
                archived,
                free,
                premium
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const getUserBooks = async (req, res) => {
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

        const filter = {
            status: 'active'
        };

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

        const books = await Book.find(filter)
            .select('-content -contentFileId')
            .sort(sort)
            .skip(skip)
            .limit(limitInt);

        const total = await Book.countDocuments(filter);

        return res.status(200).json({
            success: true,
            total,
            page: parseInt(page),
            limit: limitInt,
            totalPages: Math.ceil(total / limitInt),
            books
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const getUserBookById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id || null;
        const userIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid book ID"
            });
        }

        const book = await Book.findById(id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        if (book.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: "This book is not available"
            });
        }

        await incrementBookViewsWithCooldown(book, userId, userIp);

        const isPremium = book.type === 'premium';
        const bookData = book.toObject();

        if (isPremium) {
            if (!userId) {
                delete bookData.content;
                delete bookData.contentFileId;
                
                return res.status(200).json({
                    success: true,
                    message: "Premium book. Please subscribe to access content",
                    book: bookData,
                    requiresSubscription: true
                });
            }

            const hasSubscription = await checkUserSubscription(userId);

            if (!hasSubscription) {
                delete bookData.content;
                delete bookData.contentFileId;
                
                return res.status(200).json({
                    success: true,
                    message: "Premium book. Please subscribe to access content",
                    book: bookData,
                    requiresSubscription: true,
                    hasActiveSubscription: false
                });
            }
            
            return res.status(200).json({
                success: true,
                message: "Book fetched successfully",
                book: bookData,
                requiresSubscription: false,
                hasActiveSubscription: true
            });
        }
        
        return res.status(200).json({
            success: true,
            message: "Book fetched successfully",
            book: bookData,
            requiresSubscription: false,
            hasActiveSubscription: false
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

const incrementBookViewsWithCooldown = async (book, userId, userIp) => {
    try {
        const VIEW_COOLDOWN = 60000;
        const now = Date.now();
        
        const viewerId = userId ? userId.toString() : (userIp || 'anonymous');
        
        if (!book.lastViewTime) {
            book.lastViewTime = new Map();
        }
        
        const lastView = book.lastViewTime.get(viewerId);
        
        if (!lastView || (now - lastView) > VIEW_COOLDOWN) {
            book.views = (book.views || 0) + 1;
            book.lastViewTime.set(viewerId, now);
            
            if (book.lastViewTime.size > 1000) {
                const entries = Array.from(book.lastViewTime.entries());
                entries.sort((a, b) => a[1] - b[1]);
                const toRemove = entries.slice(0, entries.length - 1000);
                toRemove.forEach(([key]) => book.lastViewTime.delete(key));
            }
            
            await book.save();
        }
        
    } catch (error) {
    }
};

const checkUserSubscription = async (userId) => {
    try {
        const user = await User.findById(userId).select('hasActiveSubscription activeSubscriptionId');
        
        if (!user) return false;

        if (user.hasActiveSubscription && user.activeSubscriptionId) {
            const subscriber = await Subscriber.findById(user.activeSubscriptionId);
            
            if (subscriber && 
                subscriber.subscriptionStatus === 'active' && 
                subscriber.endDate && 
                new Date(subscriber.endDate) > new Date()) {
                return true;
            }
        }

        const activeSubscriptions = await Subscriber.find({
            userId: userId,
            subscriptionStatus: 'active',
            endDate: { $gt: new Date() }
        });

        if (activeSubscriptions.length > 0) {
            const latestSubscription = activeSubscriptions[0];
            if (user.activeSubscriptionId?.toString() !== latestSubscription._id.toString()) {
                await User.findByIdAndUpdate(userId, {
                    activeSubscriptionId: latestSubscription._id,
                    hasActiveSubscription: true
                });
            }
            return true;
        }

        if (user.hasActiveSubscription) {
            await User.findByIdAndUpdate(userId, {
                hasActiveSubscription: false,
                activeSubscriptionId: null
            });
        }

        return false;

    } catch (error) {
        return false;
    }
};