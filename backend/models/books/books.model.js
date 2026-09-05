import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    thumbnailFileId: {
    type: String,  
},
    description: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    subject: {
        type: String,
        required: true,
        trim: true,
    },
    authorName: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
    },
    contentFileId: {
    type: String,  
},
    pages: {
        type: Number,
        required: true,
        min: 1,
    },
    edition: {
        type: String,
        trim: true,
    },
    publication: {
        type: String,
        trim: true,
    },
    features: {
        type: [String],
        default: [],
    },
    about: {
        type: Map,
        of: String,
        default: {},
    },
    type: {
        type: String,
        enum: ['free', 'premium'],
        default: 'free',
        required: true,
    },
      premiumPlans: {
        type: [String],
        enum: ['basic', 'premium', 'elite'],
        default: [],
    },       
    status: {
        type: String,
        enum: ['active', 'pending', 'draft', 'archived'],
        default: 'pending',
        required: true,
    },
    language: {
        type: String,
        required: true,
        default: 'English',
       enum: {
            values: ['English', 'Hindi',  'Bengali', 'Urdu', 'Punjabi', 'Sanskrit'],
            message: 'Language must be one of: English, Hindi,  Bengali, Urdu, Punjabi, Sanskrit'
        },
        trim: true,
    },
    ratings: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        count: {
            type: Number,
            default: 0,
            min: 0,
        },
        distribution: {
            type: Map,
            of: Number,
            default: {},
        },
    },
    views: {
        type: Number,
        default: 0,
        min: 0,
    },
    lastViewTime: {
        type: Map,
        of: Number,
        default: {},
    },
    reads: {
        type: Number,
        default: 0,
        min: 0,
    },
    downloads: {
        type: Number,
        default: 0,
        min: 0,
    },
    order: {
        type: Number,
        default: 0,
    },
    totalSaves: {
        type: Number,
        default: 0,
        min: 0,
    },
}, {
    timestamps: true,
});

bookSchema.index({ title: 'text', description: 'text', authorName: 'text' });
bookSchema.index({ category: 1 });
bookSchema.index({ subject: 1 });
bookSchema.index({ type: 1 });
bookSchema.index({ status: 1 });
bookSchema.index({ views: -1 });
bookSchema.index({ createdAt: -1 });

const Book = mongoose.model('Book', bookSchema);

export default Book;