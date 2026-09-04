import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
    sectionName: {
        type: String,
        required: true,
        trim: true
    },
    videoLink: {
        type: String,
        required: true,
        trim: true
    },
    isPublic: {
        type: Boolean,
        default: true 
    },
    duration: {
        type: Number, 
        default: 0
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const instructorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    profile: {
        type: String,
        trim: true
    },
    profileFileId: {
        type: String
    },
    bio: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true
    }
});

const watchTimeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lessonIndex: {
        type: Number,
        required: true
    },
    watchTime: {
        type: Number, // in seconds
        default: 0
    },
    lastWatchedAt: {
        type: Date,
        default: Date.now
    },
    completed: {
        type: Boolean,
        default: false
    }
});

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    thumbnailFileId: {
        type: String
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    languages: {
        type: [String],
        required: true,
        default: ['English']
    },
    instructors: {
        type: [instructorSchema],
        required: true,
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            },
            message: "At least one instructor is required"
        }
    },
    features: {
        type: [String],
        default: []
    },
    about: {
        type: Map,
        of: String,
        default: {}
    },
    lessons: {
        type: [lessonSchema],
        default: []
    },
    type: {
        type: String,
        enum: ['free', 'premium'],
        default: 'free'
    },
    premiumPlans: {
        type: [String],
        enum: ['basic', 'premium', 'elite'],
        default: []
    },
    courseStatus: {
        type: String,
        enum: ['draft', 'pending', 'active', 'archived'],
        default: 'draft'
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    views: {
        type: Number,
        default: 0
    },
     watchHistory: {
        type: [watchTimeSchema],
        default: []
    },
    totalWatchTime: {
        type: Number,
        default: 0
    },
    uniqueViewers: {
        type: Number,
        default: 0
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

courseSchema.index({ title: 'text', description: 'text', category: 'text' });
courseSchema.index({ category: 1 });
courseSchema.index({ subject: 1 });
courseSchema.index({ type: 1 });
courseSchema.index({ courseStatus: 1 });
courseSchema.index({ views: -1 });
courseSchema.index({ createdAt: -1 });

const Course = mongoose.model('Course', courseSchema);

export default Course;