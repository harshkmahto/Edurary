import mongoose from "mongoose";
import Subscription from "../../models/users/subscription.models.js";

export const createSubscription = async (req, res) => {
    try {
        let {
            title,
            price,
            sellingPrice,
            validity,
            features,
            about,
            termsAndConditions,
            isActive,
            order,
        } = req.body;

        if (typeof features === 'string') {
            try {
                features = JSON.parse(features);
            } catch (e) {
                features = features ? [features] : [];
            }
        }
        if (typeof termsAndConditions === 'string') {
            try {
                termsAndConditions = JSON.parse(termsAndConditions);
            } catch (e) {
                termsAndConditions = termsAndConditions ? [termsAndConditions] : [];
            }
        }
        if (typeof validity === 'string') {
            try {
                validity = JSON.parse(validity);
            } catch (e) {
                validity = { value: validity, unit: 'month' };
            }
        }

        if (!title || price === undefined || sellingPrice === undefined || !validity) {
            return res.status(400).json({
                success: false,
                message: "Title, price, selling price and validity are required",
            });
        }

        if (!validity.value || !validity.unit) {
            return res.status(400).json({
                success: false,
                message: "Validity value and unit are required",
            });
        }

        if (!["month", "year"].includes(validity.unit)) {
            return res.status(400).json({
                success: false,
                message: "Validity unit must be month or year",
            });
        }

        if (parseFloat(sellingPrice) > parseFloat(price)) {
            return res.status(400).json({
                success: false,
                message: "Selling price cannot be greater than price",
            });
        }

        const subscription = await Subscription.create({
            title,
            price: parseFloat(price),
            sellingPrice: parseFloat(sellingPrice),
            validity: {
                value: parseInt(validity.value),
                unit: validity.unit
            },
            features: features || [],
            about,
            termsAndConditions: termsAndConditions || [],
            isActive: isActive !== undefined ? isActive : true,
            order: parseInt(order) || 0,
        });

        return res.status(201).json({
            success: true,
            message: "Subscription created successfully",
            subscription,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

export const getAllSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({})
            .sort({ order: 1, createdAt: -1 });

        return res.status(200).json({
            success: true,
            total: subscriptions.length,
            subscriptions,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};



export const updateSubscription = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid subscription ID",
            });
        }

        let {
            title,
            price,
            sellingPrice,
            validity,
            features,
            about,
            termsAndConditions,
            isActive,
            order,
        } = req.body;

        if (typeof features === 'string') {
            try {
                features = JSON.parse(features);
            } catch (e) {
                features = features ? [features] : [];
            }
        }
        if (typeof termsAndConditions === 'string') {
            try {
                termsAndConditions = JSON.parse(termsAndConditions);
            } catch (e) {
                termsAndConditions = termsAndConditions ? [termsAndConditions] : [];
            }
        }
        if (typeof validity === 'string') {
            try {
                validity = JSON.parse(validity);
            } catch (e) {
                validity = { value: validity, unit: 'month' };
            }
        }

        const subscription = await Subscription.findById(id);
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: "Subscription not found",
            });
        }

        if (validity) {
            if (!validity.value || !validity.unit) {
                return res.status(400).json({
                    success: false,
                    message: "Validity value and unit are required",
                });
            }

            if (!["month", "year"].includes(validity.unit)) {
                return res.status(400).json({
                    success: false,
                    message: "Validity unit must be month or year",
                });
            }
        }

        if (
            price !== undefined &&
            sellingPrice !== undefined &&
            parseFloat(sellingPrice) > parseFloat(price)
        ) {
            return res.status(400).json({
                success: false,
                message: "Selling price cannot be greater than price",
            });
        }

        const updateData = {};

        if (title !== undefined) updateData.title = title;
        if (price !== undefined) updateData.price = parseFloat(price);
        if (sellingPrice !== undefined) updateData.sellingPrice = parseFloat(sellingPrice);
        if (validity !== undefined) {
            updateData.validity = {
                value: parseInt(validity.value),
                unit: validity.unit
            };
        }
        if (features !== undefined) updateData.features = features || [];
        if (about !== undefined) updateData.about = about;
        if (termsAndConditions !== undefined) updateData.termsAndConditions = termsAndConditions || [];
        if (isActive !== undefined) updateData.isActive = isActive;
        if (order !== undefined) updateData.order = parseInt(order) || 0;

        const updatedSubscription = await Subscription.findByIdAndUpdate(
            id,
            updateData,
            {
                returnDocument: 'after',
                runValidators: true,
            }
        );

        return res.status(200).json({
            success: true,
            message: "Subscription updated successfully",
            subscription: updatedSubscription,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

export const deleteSubscription = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid subscription ID",
            });
        }

        const subscription = await Subscription.findById(id);
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: "Subscription not found",
            });
        }

        await Subscription.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Subscription deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const activateSubscription = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid subscription ID",
            });
        }

        const subscription = await Subscription.findByIdAndUpdate(
            id,
            { isActive: true },
            {
                returnDocument: 'after',
                runValidators: true,
            }
        );

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: "Subscription not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Subscription activated successfully",
            subscription,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const activeSubscription = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ isActive: true })
            .sort({ order: 1, createdAt: -1 });

        return res.status(200).json({
            success: true,
            total: subscriptions.length,
            subscriptions,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const getSubscriptionById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid subscription ID",
            });
        }

        const subscription = await Subscription.findOne({
            _id: id,
            isActive: true 
        });

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: "Subscription not found",
            });
        }

        return res.status(200).json({
            success: true,
            subscription,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};