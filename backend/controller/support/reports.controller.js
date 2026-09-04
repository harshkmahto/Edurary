// controller/support/reports.controller.js (Updated)
import Report from '../../models/support/reports.models.js';
import User from '../../models/users/user.models.js';
import mongoose from 'mongoose';
import { sendReportCreatedEmail, sendReportResolvedEmail } from '../../service/report.email.service.js';

// ========== CREATE REPORT (USER) ==========
export const createReport = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User not found"
            });
        }

        const { reportType, subject, description, relatedItem } = req.body;

        if (!reportType || !subject || !description) {
            return res.status(400).json({
                success: false,
                message: "Report type, subject, and description are required"
            });
        }

        const validReportTypes = ['book', 'course', 'system', 'other'];
        if (!validReportTypes.includes(reportType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid report type. Must be: book, course, system, or other"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const report = new Report({
            userId,
            reportType,
            subject: subject.trim(),
            description: description.trim(),
            relatedItem: relatedItem || {},
            status: 'review'
        });

        await report.save();

        const populatedReport = await Report.findById(report._id)
            .populate('userId', 'name username email profilePicture');

        // Send email notification (async)
        sendReportCreatedEmail(
            { name: user.name, email: user.email },
            report
        ).then(result => {
            if (result.success) {
                console.log('Report created email sent to:', user.email);
            } else {
                console.error('Failed to send report created email:', result.error);
            }
        }).catch(error => {
            console.error('Report email error:', error);
        });

        return res.status(201).json({
            success: true,
            message: "Report created successfully",
            data: populatedReport
        });

    } catch (error) {
        console.error('Create report error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// ========== GET ALL REPORTS (ADMIN) ==========
export const getAllReports = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            reportType,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const filter = {};
        
        if (status) {
            filter.status = status;
        }
        
        if (reportType) {
            filter.reportType = reportType;
        }
        
        if (search) {
            filter.$or = [
                { subject: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const limitInt = parseInt(limit);

        const reports = await Report.find(filter)
            .populate('userId', 'name username email profilePicture phone')
            .sort(sort)
            .skip(skip)
            .limit(limitInt);

        const total = await Report.countDocuments(filter);

        const statusCounts = await Report.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const typeCounts = await Report.aggregate([
            { $group: { _id: '$reportType', count: { $sum: 1 } } }
        ]);

        const stats = {
            total,
            byStatus: statusCounts.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {}),
            byType: typeCounts.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {})
        };

        return res.status(200).json({
            success: true,
            data: {
                reports,
                stats,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit)),
                    hasNext: page < Math.ceil(total / parseInt(limit)),
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Get all reports error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// ========== UPDATE REPORT STATUS (ADMIN) ==========
export const updateReportStatus = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { status, adminNotes } = req.body;
        const adminId = req.user?._id || req.user?.id;

        if (!reportId) {
            return res.status(400).json({
                success: false,
                message: "Report ID is required"
            });
        }

        if (!adminId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Admin not found"
            });
        }

        const validStatuses = ['review', 'basic', 'mediate', 'serious', 'resolved'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found"
            });
        }

        const admin = await User.findById(adminId);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin user not found"
            });
        }

        const oldStatus = report.status;
        report.status = status;
        
        if (adminNotes) {
            report.adminNotes = adminNotes.trim();
        }
        
        if (status === 'resolved') {
            report.resolvedAt = new Date();
        }
        
        await report.save();

        const updatedReport = await Report.findById(reportId)
            .populate('userId', 'name username email profilePicture phone');

        // Send email only if status changed to 'resolved'
        if (status === 'resolved' && oldStatus !== 'resolved') {
            const user = await User.findById(report.userId);
            if (user) {
                sendReportResolvedEmail(
                    { name: user.name, email: user.email },
                    report
                ).then(result => {
                    if (result.success) {
                        console.log('Report resolved email sent to:', user.email);
                    } else {
                        console.error('Failed to send report resolved email:', result.error);
                    }
                }).catch(error => {
                    console.error('Report resolved email error:', error);
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: `Report status updated from '${oldStatus}' to '${status}'`,
            data: {
                report: updatedReport,
                oldStatus,
                newStatus: status
            }
        });

    } catch (error) {
        console.error('Update report status error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// ========== GET TOTAL REPORTS COUNT ==========
export const getTotalReports = async (req, res) => {
    try {
        const totalReports = await Report.countDocuments();
        
        return res.status(200).json({
            success: true,
            data: {
                totalReports
            }
        });

    } catch (error) {
        console.error('Get total reports error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};