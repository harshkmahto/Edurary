// models/reports/report.models.js
import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reportType: {
        type: String,
        enum: ['book', 'course', 'system', 'other'],
        required: true
    },
    subject: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    relatedItem: {
        name: {
            type: String,
            trim: true
        },
        id: {
            type: String,
            trim: true
        }
    },
    status: {
        type: String,
        enum: ['review', 'basic', 'mediate', 'serious', 'resolved'],
        default: 'review'
    }
}, {
    timestamps: true
});

reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ status: 1 });
reportSchema.index({ reportType: 1 });

const Report = mongoose.model('Report', reportSchema);

export default Report;