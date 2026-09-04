import jwt from "jsonwebtoken";
import Blacklist from "../models/users/blacklist.models.js";
import config from "../config/config.js";
import User from "../models/users/user.models.js";

export const auth = async (req, res, next) => {
    try {
        let token = req.cookies?.token;
        
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            return next();
        }

        const isBlacklisted = await Blacklist.findOne({ token });

        if (isBlacklisted) {
            res.clearCookie("token");
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Token is blacklisted",
            });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);
        console.log('Decoded token:', decoded);

        const user = await User.findById(decoded.id || decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User not found",
            });
        }

        req.user = user;
        req.token = token;

        next();
    } catch (error) {
        console.error("Auth middleware error:", error);

        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            res.clearCookie("token");

            return res.status(401).json({
                success: false,
                message:
                    error.name === "TokenExpiredError"
                        ? "Unauthorized: Token has expired"
                        : "Unauthorized: Invalid token",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const admin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Authentication required",
            });
        }

        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Forbidden: Admin access required",
            });
        }

        next();
    } catch (error) {
        console.error("Admin middleware error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};