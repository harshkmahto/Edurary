import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
    {

        title: {
            type: String,
            required: true,
            trim: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        sellingPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        validity: {
            value: {
                type: Number,
                required: true,
                min: 1,
            },

            unit: {
                type: String,
                required: true,
                enum: ["month", "year"],
            },
        },

        features: [
            {
                type: String,
                trim: true,
            },
        ],

        about: {
            type: String,
            trim: true,
        },

        termsAndConditions: [
            {
                type: String,
                trim: true,
            },
        ],

        isActive: {
            type: Boolean,
            default: true,
        },

        order: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;