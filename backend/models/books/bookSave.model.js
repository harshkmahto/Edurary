// models/books/bookSave.model.js
import mongoose from 'mongoose';

const bookSaveSchema = new mongoose.Schema({
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
    listId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SaveList',
        required: true,
        index: true
    },
    notes: {
        type: String,
        default: ''
    },
    savedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Only indexes - NO middleware
bookSaveSchema.index({ userId: 1, bookId: 1, listId: 1 }, { unique: true });
bookSaveSchema.index({ userId: 1, bookId: 1 });

const BookSave = mongoose.model('BookSave', bookSaveSchema);
export default BookSave;