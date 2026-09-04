// models/books/saveList.model.js
import mongoose from 'mongoose';

const saveListSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    color: {
        type: String,
        default: '#c8963e'
    },
    icon: {
        type: String,
        default: '📚'
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        default: ''
    },
    bookCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Only indexes - NO middleware
saveListSchema.index({ userId: 1, name: 1 }, { unique: true });

const SaveList = mongoose.model('SaveList', saveListSchema);
export default SaveList;