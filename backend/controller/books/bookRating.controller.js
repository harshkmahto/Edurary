import BookRating from '../../models/books/bookRating.model.js';
import Book from '../../models/books/books.model.js';
import mongoose from 'mongoose';

const updateBookAverageRating = async (bookId) => {
    try {
        // Get all ratings for this book
        const ratings = await BookRating.find({ bookId });
        const totalRatings = ratings.length;
        
        let averageRating = 0;
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

        if (totalRatings > 0) {
            // Calculate average
            const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
            averageRating = sum / totalRatings;

            // Calculate distribution
            ratings.forEach(r => {
                distribution[r.rating] = (distribution[r.rating] || 0) + 1;
            });
        }

        // ✅ UPDATE BOOK MODEL RATINGS
        await Book.findByIdAndUpdate(bookId, {
            'ratings.average': Number(averageRating.toFixed(1)),
            'ratings.count': totalRatings,
            'ratings.distribution': distribution
        });

        return { averageRating, totalRatings, distribution };

    } catch (error) {
        console.error('Update book average rating error:', error);
        throw error;
    }
};
// Add or Update a rating
export const addOrUpdateRating = async (req, res) => {
    try {
        const userId = req.user._id;
        const { bookId } = req.params;
        const { rating, review } = req.body;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }

        // Validate book exists
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        // Check if user already rated this book
        let existingRating = await BookRating.findOne({ userId, bookId });

        if (existingRating) {
            // Update existing rating
            const oldRating = existingRating.rating;
            existingRating.rating = rating;
            if (review !== undefined) {
                existingRating.review = review || '';
            }
            await existingRating.save();

            // Update book average rating
            await updateBookAverageRating(bookId);

            return res.status(200).json({
                success: true,
                message: "Rating updated successfully",
                rating: existingRating,
                isUpdate: true
            });
        } else {
            // Create new rating
            const newRating = await BookRating.create({
                userId,
                bookId,
                rating,
                review: review || ''
            });

            // Update book average rating
            await updateBookAverageRating(bookId);

            return res.status(201).json({
                success: true,
                message: "Rating added successfully",
                rating: newRating,
                isUpdate: false
            });
        }

    } catch (error) {
        console.error('Add/Update rating error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Get user's rating for a specific book
export const getUserRating = async (req, res) => {
    try {
        const userId = req.user._id;
        const { bookId } = req.params;

        const rating = await BookRating.findOne({ userId, bookId });

        return res.status(200).json({
            success: true,
            hasRated: !!rating,
            rating: rating || null
        });

    } catch (error) {
        console.error('Get user rating error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Get average rating 
export const getBookAverageRating = async (req, res) => {
    try {
        const { bookId } = req.params;

        const book = await Book.findById(bookId).select('ratings title');
        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        // Get all ratings for this book
        const ratings = await BookRating.find({ bookId });

        const totalRatings = ratings.length;
        const averageRating = totalRatings > 0 
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
            : 0;

        // Calculate rating distribution
        const distribution = {
            1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        };
        ratings.forEach(r => {
            distribution[r.rating] = (distribution[r.rating] || 0) + 1;
        });

        return res.status(200).json({
            success: true,
            bookId,
            title: book.title,
            averageRating: Number(averageRating.toFixed(1)),
            totalRatings,
            distribution,
            ratings: ratings.map(r => ({
                userId: r.userId,
                rating: r.rating,
                review: r.review,
                createdAt: r.createdAt
            }))
        });

    } catch (error) {
        console.error('Get book average rating error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Get all ratings 
export const getUserAllRatings = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const ratings = await BookRating.find({ userId })
            .populate('bookId', 'title thumbnail authorName category')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await BookRating.countDocuments({ userId });

        return res.status(200).json({
            success: true,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
            ratings
        });

    } catch (error) {
        console.error('Get user all ratings error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};


// Get rating statistics for a book (admin)
export const getBookRatingStats = async (req, res) => {
    try {
        const { bookId } = req.params;

        const book = await Book.findById(bookId).select('ratings title');
        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        // Get all ratings with user details
        const ratings = await BookRating.find({ bookId })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        const totalRatings = ratings.length;
        const averageRating = totalRatings > 0 
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
            : 0;

        // Calculate rating distribution
        const distribution = {
            1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        };
        ratings.forEach(r => {
            distribution[r.rating] = (distribution[r.rating] || 0) + 1;
        });

        // Calculate percentage for each rating
        const percentage = {};
        Object.keys(distribution).forEach(key => {
            percentage[key] = totalRatings > 0 
                ? (distribution[key] / totalRatings) * 100 
                : 0;
        });

        return res.status(200).json({
            success: true,
            bookId,
            title: book.title,
            averageRating: Number(averageRating.toFixed(1)),
            totalRatings,
            distribution,
            percentage,
            ratings
        });

    } catch (error) {
        console.error('Get book rating stats error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};