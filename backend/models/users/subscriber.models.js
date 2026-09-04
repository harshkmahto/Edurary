// models/users/subscriber.models.js
import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
        required: true
    },
    planName: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    sellingPrice: {
        type: Number,
        required: true
    },
    validity: {
        value: {
            type: Number,
            required: true
        },
        unit: {
            type: String,
            enum: ['month', 'year'],
            required: true
        }
    },
    userPhone: {
        type: String
    },
    userEmail: {
        type: String
    },
    transactionId: {
        type: String,
        unique: true,
        sparse: true
    },
    receiptUrl: {
        type: String
    },
    receiptFileId: {
        type: String
    },
    // Updated payment status
    paymentStatus: {
        type: String,
        enum: ['pending', 'review', 'success', 'failed'],
        default: 'pending'
    },
    // New subscription status
    subscriptionStatus: {
        type: String,
        enum: ['pending', 'review', 'active', 'expired', 'cancelled', 'terminated'],
        default: 'pending'
    },
    // Reason for status change (optional)
    statusReason: {
        type: String,
        trim: true,
        maxlength: [500, "Reason cannot exceed 500 characters"]
    },
    paymentDate: {
        type: Date
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    notify: {
        type:Boolean,
        default:false
    },
  
}, {
    timestamps: true
});

// Indexes for better query performance
subscriberSchema.index({ userId: 1, subscriptionStatus: 1 });
subscriberSchema.index({ userId: 1, isActive: 1 });
subscriberSchema.index({ endDate: 1 });
subscriberSchema.index({ paymentStatus: 1 });

export default mongoose.model('Subscriber', subscriberSchema);