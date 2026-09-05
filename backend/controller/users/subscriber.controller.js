import mongoose from "mongoose";
import Subscriber from "../../models/users/subscriber.models.js";
import Subscription from "../../models/users/subscription.models.js";
import User from "../../models/users/user.models.js";
import { uploadImage, deleteImage } from "../../config/imagekit.config.js";
import { 
    sendSubscriptionCreatedEmail, sendSubscriptionStatusUpdateEmail, sendPaymentStatusUpdateEmail 
} from '../../service/Subscriptio.email.service.js';


export const createSubscriber = async (req, res) => {
    try {
        const { subscriptionId, phone, email } = req.body;
        const userId = req.user._id || req.user.id;

        if (!subscriptionId) {
            return res.status(400).json({
                success: false,
                message: "Subscription ID is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(subscriptionId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid subscription ID format"
            });
        }

        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: "Subscription plan not found"
            });
        }

        const user = await User.findById(userId);
        
        if (user && user.hasActiveSubscription && user.activeSubscriptionId) {
            const activeSub = await Subscriber.findById(user.activeSubscriptionId);
            
            if (activeSub && activeSub.subscriptionStatus === 'active') {
                const now = new Date();
                const endDate = new Date(activeSub.endDate);
                
                if (endDate > now) {
                    return res.status(400).json({
                        success: false,
                        message: `You already have an active subscription (${activeSub.planName})`,
                        currentSubscription: {
                            planName: activeSub.planName,
                            endDate: activeSub.endDate,
                            remainingDays: Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
                        }
                    });
                } else {
                    activeSub.subscriptionStatus = 'expired';
                    await activeSub.save();
                    
                    user.hasActiveSubscription = false;
                    user.activeSubscriptionId = null;
                    await user.save();
                }
            }
        }

        const pendingSubscription = await Subscriber.findOne({
            userId: userId,
            paymentStatus: { $in: ['pending', 'review'] }
        });

        if (pendingSubscription) {
            return res.status(400).json({
                success: false,
                message: "You already have a pending payment. Please wait for admin verification.",
                pendingSubscriptionId: pendingSubscription._id,
                status: pendingSubscription.paymentStatus
            });
        }

        const subscriber = new Subscriber({
            userId: userId,
            subscriptionId: subscriptionId,
            planName: subscription.title,
            price: subscription.price,
            sellingPrice: subscription.sellingPrice,
            validity: subscription.validity,
            paymentStatus: 'pending',
            subscriptionStatus: 'pending',
            userPhone: phone,
            userEmail: email
        });

        await subscriber.save();

        // Send subscription created email (async)
        sendSubscriptionCreatedEmail(
            { name: user?.name || 'User', email: user?.email || email },
            subscriber
        ).then(result => {
            if (result.success) {
                console.log('Subscription created email sent to:', user?.email || email);
            } else {
                console.error('Failed to send subscription created email:', result.error);
            }
        }).catch(error => {
            console.error('Subscription email error:', error);
        });

        return res.status(200).json({
            success: true,
            message: "Payment initiated successfully",
            subscriberId: subscriber._id,
            subscription: subscriber
        });

    } catch (error) {
        console.error('Error creating subscriber:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to initiate payment"
        });
    }
};

export const submitPaymentProof = async (req, res) => {
    try {
        const { subscriberId, transactionId } = req.body;
        const userId = req.user._id || req.user.id;

        if (!subscriberId) {
            return res.status(400).json({
                success: false,
                message: "Subscriber ID is required"
            });
        }

        if (!transactionId) {
            return res.status(400).json({
                success: false,
                message: "Transaction ID is required"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Payment receipt is required"
            });
        }

        const subscriber = await Subscriber.findById(subscriberId);
        if (!subscriber) {
            return res.status(404).json({
                success: false,
                message: "Subscriber record not found"
            });
        }

        if (subscriber.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized access"
            });
        }

        if (subscriber.subscriptionStatus === 'active') {
            return res.status(400).json({
                success: false,
                message: "This subscription is already active"
            });
        }

        const user = await User.findById(userId);
        
        if (user && user.hasActiveSubscription) {
            if (user.activeSubscriptionId && user.activeSubscriptionId.toString() !== subscriberId) {
                const existingActive = await Subscriber.findById(user.activeSubscriptionId);
                if (existingActive && existingActive.subscriptionStatus === 'active') {
                    existingActive.subscriptionStatus = 'cancelled';
                    existingActive.statusReason = 'Replaced by new subscription';
                    await existingActive.save();
                }
            } else {
                return res.status(400).json({
                    success: false,
                    message: "You already have an active subscription. Please wait until it expires."
                });
            }
        }

        const startDate = new Date();
        let endDate = new Date(startDate);
        const { value, unit } = subscriber.validity;
        
        if (unit === 'month') {
            endDate.setMonth(endDate.getMonth() + value);
        } else if (unit === 'year') {
            endDate.setFullYear(endDate.getFullYear() + value);
        }

        const uploadResult = await uploadImage(req.file, 'receipts');

        subscriber.transactionId = transactionId;
        subscriber.receiptUrl = uploadResult.url;
        subscriber.receiptFileId = uploadResult.fileId;
        subscriber.paymentStatus = 'review';
        subscriber.subscriptionStatus = 'active';
        subscriber.paymentDate = new Date();
        subscriber.startDate = startDate;
        subscriber.endDate = endDate;
        subscriber.notify = true
        await subscriber.save();

        await updateUserActiveSubscription(subscriber.userId, subscriber._id);

        return res.status(200).json({
            success: true,
            message: "Payment proof submitted successfully! Your subscription is now active. Admin will verify the payment.",
            data: {
                receiptUrl: uploadResult.url,
                startDate: startDate,
                endDate: endDate,
                subscriptionStatus: subscriber.subscriptionStatus,
                paymentStatus: subscriber.paymentStatus
            }
        });

    } catch (error) {
        console.error('Error submitting payment proof:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to submit payment proof"
        });
    }
};

export const getUserSubscriptions = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const { page = 1, limit = 10 } = req.query;

        const skip = (page - 1) * limit;

        const subscriptions = await Subscriber.find({
            userId: userId
        })
        .populate('subscriptionId', 'title icon features about')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

        const total = await Subscriber.countDocuments({ userId: userId });

        return res.status(200).json({
            success: true,
            subscriptions: subscriptions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching user subscriptions:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch subscriptions"
        });
    }
};

export const getUserActiveSubscription = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;

        const user = await User.findById(userId).populate('activeSubscriptionId');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.hasActiveSubscription || !user.activeSubscriptionId) {
            return res.status(200).json({
                success: true,
                hasSubscription: false,
                message: "No active subscription found"
            });
        }

        const subscription = user.activeSubscriptionId;
        
        if (subscription.endDate) {
            const now = new Date();
            const endDate = new Date(subscription.endDate);
            
            if (endDate < now && subscription.subscriptionStatus === 'active') {
                subscription.subscriptionStatus = 'expired';
                await subscription.save();
                
                user.hasActiveSubscription = false;
                user.activeSubscriptionId = null;
                await user.save();
                
                return res.status(200).json({
                    success: true,
                    hasSubscription: false,
                    message: "Subscription has expired"
                });
            }
        }

        return res.status(200).json({
            success: true,
            hasSubscription: true,
            subscription: subscription,
            remainingDays: subscription.endDate ? 
                Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)) : 
                null
        });

    } catch (error) {
        console.error('Error fetching active subscription:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch subscription"
        });
    }
};

export const getSubscriberById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id || req.user.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid subscriber ID format"
            });
        }

        const subscriber = await Subscriber.findById(id)
            .populate('subscriptionId', 'title icon features about price sellingPrice validity');

        if (!subscriber) {
            return res.status(404).json({
                success: false,
                message: "Subscriber record not found"
            });
        }

        // Check if the subscriber belongs to the authenticated user
        if (subscriber.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized access to this subscription"
            });
        }

        return res.status(200).json({
            success: true,
            data: subscriber
        });

    } catch (error) {
        console.error('Error fetching subscriber:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch subscriber"
        });
    }
};

export const getAllSubscribers = async (req, res) => {
    try {
        const { status, subscriptionStatus, plan, page = 1, limit = 20 } = req.query;
        
        let filter = {};
        if (status) filter.paymentStatus = status;
        if (subscriptionStatus) filter.subscriptionStatus = subscriptionStatus;
        if (plan) filter.subscriptionId = plan;

        const skip = (page - 1) * limit;

        const subscriptions = await Subscriber.find(filter)
            .populate('userId', 'name email username phone profilePicture')
            .populate('subscriptionId', 'title price sellingPrice icon')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Subscriber.countDocuments(filter);

        return res.status(200).json({
            success: true,
            subscriptions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching all subscriptions:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch subscriptions"
        });
    }
};

export const updateSubscriptionStatus = async (req, res) => {
    try {
        const { subscriberId } = req.params;
        const { subscriptionStatus, reason } = req.body;

        if (!subscriberId) {
            return res.status(400).json({
                success: false,
                message: "Subscriber ID is required"
            });
        }

        if (!subscriptionStatus) {
            return res.status(400).json({
                success: false,
                message: "Subscription status is required"
            });
        }

        const validStatuses = ['pending', 'review', 'active', 'expired', 'cancelled', 'terminated'];
        if (!validStatuses.includes(subscriptionStatus)) {
            return res.status(400).json({
                success: false,
                message: `Invalid subscription status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        const subscriber = await Subscriber.findById(subscriberId);
        if (!subscriber) {
            return res.status(404).json({
                success: false,
                message: "Subscriber record not found"
            });
        }

        const oldStatus = subscriber.subscriptionStatus;
        
        subscriber.subscriptionStatus = subscriptionStatus;
        
        if (reason) {
            subscriber.statusReason = reason;
        }

        if (subscriptionStatus === 'active') {
            const user = await User.findById(subscriber.userId);
            if (user && user.hasActiveSubscription && user.activeSubscriptionId) {
                const existingActive = await Subscriber.findById(user.activeSubscriptionId);
                if (existingActive && existingActive._id.toString() !== subscriberId) {
                    existingActive.subscriptionStatus = 'expired';
                    existingActive.statusReason = 'Replaced by new subscription';
                    await existingActive.save();
                }
            }

            if (!subscriber.startDate) {
                subscriber.startDate = new Date();
                let endDate = new Date(subscriber.startDate);
                const { value, unit } = subscriber.validity;
                
                if (unit === 'month') {
                    endDate.setMonth(endDate.getMonth() + value);
                } else if (unit === 'year') {
                    endDate.setFullYear(endDate.getFullYear() + value);
                }
                subscriber.endDate = endDate;
            }

            await updateUserActiveSubscription(subscriber.userId, subscriber._id);
            
            if (subscriber.paymentStatus === 'pending') {
                subscriber.paymentStatus = 'success';
            }
        } else if (subscriptionStatus === 'expired' || subscriptionStatus === 'cancelled' || subscriptionStatus === 'terminated') {
            const user = await User.findById(subscriber.userId);
            if (user && user.activeSubscriptionId && user.activeSubscriptionId.toString() === subscriberId) {
                user.hasActiveSubscription = false;
                user.activeSubscriptionId = null;
                await user.save();
            }
        }

        await subscriber.save();

        // Send subscription status update email
        const user = await User.findById(subscriber.userId);
        if (user) {
            sendSubscriptionStatusUpdateEmail(
                { name: user.name, email: user.email },
                subscriber,
                reason
            ).then(result => {
                if (result.success) {
                    console.log('Subscription status update email sent to:', user.email);
                } else {
                    console.error('Failed to send subscription status update email:', result.error);
                }
            }).catch(error => {
                console.error('Subscription status email error:', error);
            });
        }

        return res.status(200).json({
            success: true,
            message: `Subscription status updated from '${oldStatus}' to '${subscriptionStatus}'`,
            data: {
                subscriber,
                oldStatus,
                newStatus: subscriptionStatus,
                reason: reason || null
            }
        });

    } catch (error) {
        console.error('Error updating subscription status:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to update subscription status"
        });
    }
};

export const updatePaymentStatus = async (req, res) => {
    try {
        const { subscriberId } = req.params;
        const { paymentStatus, reason } = req.body;

        if (!subscriberId) {
            return res.status(400).json({
                success: false,
                message: "Subscriber ID is required"
            });
        }

        if (!paymentStatus || !['pending', 'review', 'success', 'failed'].includes(paymentStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment status"
            });
        }

        const subscriber = await Subscriber.findById(subscriberId);
        if (!subscriber) {
            return res.status(404).json({
                success: false,
                message: "Subscriber record not found"
            });
        }

        const oldStatus = subscriber.paymentStatus;
        subscriber.paymentStatus = paymentStatus;
        
        if (reason) {
            subscriber.statusReason = reason;
        }

        if (paymentStatus === 'success') {
            if (subscriber.subscriptionStatus !== 'active') {
                const user = await User.findById(subscriber.userId);
                if (user && user.hasActiveSubscription && user.activeSubscriptionId) {
                    const existingActive = await Subscriber.findById(user.activeSubscriptionId);
                    if (existingActive && existingActive._id.toString() !== subscriberId) {
                        existingActive.subscriptionStatus = 'expired';
                        existingActive.isActive = false;
                        existingActive.statusReason = 'Replaced by new subscription';
                        await existingActive.save();
                    }
                }

                if (!subscriber.startDate) {
                    subscriber.startDate = new Date();
                    let endDate = new Date(subscriber.startDate);
                    const { value, unit } = subscriber.validity;
                    
                    if (unit === 'month') {
                        endDate.setMonth(endDate.getMonth() + value);
                    } else if (unit === 'year') {
                        endDate.setFullYear(endDate.getFullYear() + value);
                    }
                    subscriber.endDate = endDate;
                }

                subscriber.subscriptionStatus = 'active';
                
                await updateUserActiveSubscription(subscriber.userId, subscriber._id);
            }
        } else if (paymentStatus === 'failed') {
            subscriber.subscriptionStatus = 'cancelled';
            
            const user = await User.findById(subscriber.userId);
            if (user && user.activeSubscriptionId && user.activeSubscriptionId.toString() === subscriberId) {
                user.hasActiveSubscription = false;
                user.activeSubscriptionId = null;
                await user.save();
            }
        }

        await subscriber.save();

        // Send payment status update email
        const user = await User.findById(subscriber.userId);
        if (user) {
            sendPaymentStatusUpdateEmail(
                { name: user.name, email: user.email },
                subscriber,
                reason
            ).then(result => {
                if (result.success) {
                    console.log('Payment status update email sent to:', user.email);
                } else {
                    console.error('Failed to send payment status update email:', result.error);
                }
            }).catch(error => {
                console.error('Payment status email error:', error);
            });
        }

        return res.status(200).json({
            success: true,
            message: `Payment status updated from '${oldStatus}' to '${paymentStatus}'`,
            data: {
                subscriber,
                oldStatus,
                newStatus: paymentStatus,
                reason: reason || null
            }
        });

    } catch (error) {
        console.error('Error updating payment status:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to update payment status"
        });
    }
};

const updateUserActiveSubscription = async (userId, subscriberId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        if (user.activeSubscriptionId && user.activeSubscriptionId.toString() !== subscriberId.toString()) {
            const oldSub = await Subscriber.findById(user.activeSubscriptionId);
            if (oldSub && oldSub.subscriptionStatus === 'active') {
                oldSub.subscriptionStatus = 'expired';
                oldSub.statusReason = 'Replaced by new subscription';
                await oldSub.save();
            }
        }

        user.activeSubscriptionId = subscriberId;
        user.hasActiveSubscription = true;
        await user.save();
    } catch (error) {
        console.error('Error updating user active subscription:', error);
    }
};

const removeUserActiveSubscription = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        user.activeSubscriptionId = null;
        user.hasActiveSubscription = false;
        await user.save();
    } catch (error) {
        console.error('Error removing user active subscription:', error);
    }
};

export const deleteReceipt = async (req, res) => {
    try {
        const { subscriberId } = req.params;

        const subscriber = await Subscriber.findById(subscriberId);
        if (!subscriber) {
            return res.status(404).json({
                success: false,
                message: "Subscriber record not found"
            });
        }

        if (!subscriber.receiptFileId) {
            return res.status(400).json({
                success: false,
                message: "No receipt found to delete"
            });
        }

        const deleteResult = await deleteImage(subscriber.receiptFileId);

        if (!deleteResult.success) {
            return res.status(500).json({
                success: false,
                message: "Failed to delete receipt"
            });
        }

        subscriber.receiptUrl = null;
        subscriber.receiptFileId = null;
        await subscriber.save();

        return res.status(200).json({
            success: true,
            message: "Receipt deleted successfully"
        });

    } catch (error) {
        console.error('Error deleting receipt:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to delete receipt"
        });
    }
};

export const getUpiDetails = async (req, res) => {
    try {
        const upiId = process.env.UPI_ID || 'edurary@pay';
        return res.status(200).json({
            success: true,
            upiId: upiId
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch UPI details"
        });
    }
};

export const updateUpiDetails = async (req, res) => {
    try {
        const { upiId } = req.body;
        if (!upiId) {
            return res.status(400).json({
                success: false,
                message: "UPI ID is required"
            });
        }
        return res.status(200).json({
            success: true,
            message: "UPI ID updated successfully",
            upiId: upiId
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update UPI details"
        });
    }
};

export const getSubscriptionStats = async (req, res) => {
    try {
        const stats = await Subscriber.aggregate([
            {
                $group: {
                    _id: '$subscriptionStatus',
                    count: { $sum: 1 }
                }
            }
        ]);

        const paymentStats = await Subscriber.aggregate([
            {
                $group: {
                    _id: '$paymentStatus',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalActive = await Subscriber.countDocuments({
            subscriptionStatus: 'active'
        });

        const totalPending = await Subscriber.countDocuments({
            paymentStatus: { $in: ['pending', 'review'] }
        });

        return res.status(200).json({
            success: true,
            data: {
                subscriptionStats: stats,
                paymentStats: paymentStats,
                totalActive,
                totalPending,
                totalSubscriptions: await Subscriber.countDocuments()
            }
        });

    } catch (error) {
        console.error('Error getting subscription stats:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to get statistics"
        });
    }
};


export const getInvoice = async (req, res) => {
    try {
        const { subscriberId } = req.params;
        const userId = req.user._id || req.user.id;

        if (!subscriberId) {
            return res.status(400).json({
                success: false,
                message: "Subscriber ID is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(subscriberId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid subscriber ID format"
            });
        }

        // Find the subscriber with populated fields
        const subscriber = await Subscriber.findById(subscriberId)
            .populate('userId', 'name email username phone profilePicture')
            .populate('subscriptionId', 'title icon features about');

        if (!subscriber) {
            return res.status(404).json({
                success: false,
                message: "Subscriber record not found"
            });
        }

        // Check if the subscriber belongs to the authenticated user
        if (subscriber.userId._id.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized access to this invoice"
            });
        }

        // Check if payment status is 'review' - don't allow fetching invoice
        if (subscriber.paymentStatus === 'review') {
            return res.status(400).json({
                success: false,
                message: "Invoice not available. Payment is under review.",
                paymentStatus: subscriber.paymentStatus
            });
        }

        // Check if payment status is 'pending' - don't allow fetching invoice
        if (subscriber.paymentStatus === 'pending') {
            return res.status(400).json({
                success: false,
                message: "Invoice not available. Payment is pending.",
                paymentStatus: subscriber.paymentStatus
            });
        }

        // Build invoice data
        const invoiceData = {
            // Invoice Information
            invoiceId: `INV-${subscriber._id.toString().slice(-8).toUpperCase()}`,
            subscriberId: subscriber._id,
            generatedDate: new Date().toISOString(),

            // Subscriber/User Information
            user: {
                id: subscriber.userId._id,
                name: subscriber.userId.name || subscriber.userId.username || 'User',
                email: subscriber.userId.email,
                phone: subscriber.userId.phone || subscriber.userPhone || 'N/A',
                profilePicture: subscriber.userId.profilePicture || null
            },

            // Plan Information
            subscription: {
                id: subscriber.subscriptionId._id,
                title: subscriber.subscriptionId.title || subscriber.planName,
                icon: subscriber.subscriptionId.icon || null,
                features: subscriber.subscriptionId.features || [],
                about: subscriber.subscriptionId.about || null
            },

            // Payment Details
            payment: {
                planName: subscriber.planName,
                price: subscriber.price,
                sellingPrice: subscriber.sellingPrice,
                transactionId: subscriber.transactionId || 'N/A',
                paymentStatus: subscriber.paymentStatus,
                paymentDate: subscriber.paymentDate || subscriber.createdAt,
                receiptUrl: subscriber.receiptUrl || null,
                currency: 'INR',
                paymentMethod: 'UPI'
            },

            // Subscription Details
            subscriptionDetails: {
                validity: subscriber.validity,
                subscriptionStatus: subscriber.subscriptionStatus,
                startDate: subscriber.startDate || null,
                endDate: subscriber.endDate || null,
                statusReason: subscriber.statusReason || null,
                createdAt: subscriber.createdAt,
                updatedAt: subscriber.updatedAt
            },

            // Financial Breakdown
            financialBreakdown: {
                subtotal: subscriber.price,
                discount: subscriber.price - subscriber.sellingPrice,
                total: subscriber.sellingPrice,
                discountPercentage: subscriber.price > subscriber.sellingPrice 
                    ? Math.round(((subscriber.price - subscriber.sellingPrice) / subscriber.price) * 100) 
                    : 0
            },

            // Additional Information
            additionalInfo: {
                isActive: subscriber.subscriptionStatus === 'active',
                isExpired: subscriber.subscriptionStatus === 'expired',
                remainingDays: subscriber.endDate ? 
                    Math.max(0, Math.ceil((new Date(subscriber.endDate) - new Date()) / (1000 * 60 * 60 * 24))) : 
                    null,
                daysActive: subscriber.startDate ? 
                    Math.ceil((new Date() - new Date(subscriber.startDate)) / (1000 * 60 * 60 * 24)) : 
                    null
            }
        };

        let invoiceNote = '';
        if (subscriber.paymentStatus === 'success') {
            invoiceNote = 'Payment completed successfully. Thank you for your subscription!';
        } else if (subscriber.paymentStatus === 'failed') {
            invoiceNote = 'Payment failed. Please contact support for assistance.';
        } else if (subscriber.subscriptionStatus === 'active') {
            invoiceNote = 'Subscription is currently active.';
        } else if (subscriber.subscriptionStatus === 'expired') {
            invoiceNote = 'Subscription has expired. Please renew to continue enjoying our services.';
        } else if (subscriber.subscriptionStatus === 'cancelled') {
            invoiceNote = 'Subscription has been cancelled.';
        }
        invoiceData.invoiceNote = invoiceNote;

        return res.status(200).json({
            success: true,
            message: "Invoice fetched successfully",
            data: invoiceData
        });

    } catch (error) {
        console.error('Error fetching invoice:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch invoice"
        });
    }
};

export const getAllInvoices = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const { page = 1, limit = 10, status } = req.query;

        const skip = (page - 1) * limit;

        let filter = { userId: userId };
        
        if (status) {
            filter.paymentStatus = status;
        } else {
            filter.paymentStatus = { $nin: ['review', 'pending'] };
        }

        const subscribers = await Subscriber.find(filter)
            .populate('userId', 'name email username phone')
            .populate('subscriptionId', 'title icon features')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Subscriber.countDocuments(filter);

        const invoices = subscribers.map(sub => ({
            invoiceId: `INV-${sub._id.toString().slice(-8).toUpperCase()}`,
            subscriberId: sub._id,
            planName: sub.planName,
            amount: sub.sellingPrice,
            paymentStatus: sub.paymentStatus,
            subscriptionStatus: sub.subscriptionStatus,
            paymentDate: sub.paymentDate || sub.createdAt,
            startDate: sub.startDate,
            endDate: sub.endDate,
            transactionId: sub.transactionId || 'N/A',
            receiptUrl: sub.receiptUrl || null
        }));

        return res.status(200).json({
            success: true,
            message: "Invoices fetched successfully",
            data: {
                invoices,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching all invoices:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch invoices"
        });
    }
};