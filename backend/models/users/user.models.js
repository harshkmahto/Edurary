import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [2, "Name must be at least 2 characters"],
        maxlength: [50, "Name cannot exceed 50 characters"],
    },
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true, 
        trim: true,
        lowercase: true,
        minlength: [3, "Username must be at least 3 characters"],
        maxlength: [30, "Username cannot exceed 30 characters"],
        match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true, 
        trim: true,
        lowercase: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            "Please provide a valid email address"
        ],
    },
    phone: {
        type: String,
        unique: true, 
        trim: true,
        match: [
            /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/,
            "Please provide a valid phone number"
        ],
    },
    age: {
        type: Number,
        min: [13, "Age must be at least 13 years"],
        max: [120, "Age cannot exceed 120 years"],
        validate: {
            validator: Number.isInteger,
            message: "Age must be a whole number",
        },
    },
    city: {
        type: String,
        trim: true,
        maxlength: [100, "City name cannot exceed 100 characters"],
    },
    profession: {
        type: String,
        trim: true,
        maxlength: [100, "Profession cannot exceed 100 characters"],
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    role: {
        type: String,
        enum: ["user", "admin", "author"],
        default: "user",
    },
    otp: {
        type: String,
        select: false,
    },
    otpExpires: {
        type: Date,
        select: false,
    },
    otpAttempts: {
        type: Number,
        default: 0,
        select: false,
    },
    
 
    profilePicture: {
    type: String,
    default: "default-avatar.png",
},
profilePictureFileId: {
    type: String,
    default: null
},
bio: {
    type: String,
    maxlength: [500, "Bio cannot exceed 500 characters"],
    trim: true,
},
    
    // Social Links
    socialLinks: {
        website: { type: String, trim: true },
        github: { type: String, trim: true },
        linkedin: { type: String, trim: true },
        twitter: { type: String, trim: true },
    },
      

    activeSubscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscriber',
        default: null
    },
    hasActiveSubscription: {
        type: Boolean,
        default: false
    },
    notify:{
        type:Boolean,
        default:false
    },

}, {timestamps: true });

userSchema.index({ role: 1 });
userSchema.index({ isVerified: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ hasActiveSubscription: 1 });


const User = mongoose.model("User", userSchema);

export default User;