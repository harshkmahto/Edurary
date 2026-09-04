import mongoose from "mongoose";

const bookRatingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
        index: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true
});

bookRatingSchema.index({ userId: 1, bookId: 1 }, { unique: true });

const BookRating = mongoose.model('BookRating', bookRatingSchema);
export default BookRating;