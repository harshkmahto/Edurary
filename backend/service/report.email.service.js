// service/report.email.service.js
import nodemailer from 'nodemailer';
import config from '../config/config.js';

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS
    }
});

// Email templates
const emailTemplates = {
    // ========== REPORT CREATED EMAIL ==========
    reportCreated: (userData, reportData) => ({
        subject: `📋 Report Received - ${reportData.subject}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Report Received</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 40px auto;
                        background: linear-gradient(135deg, #0a0505 0%, #1a0a0a 100%);
                        border-radius: 20px;
                        overflow: hidden;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.4);
                        border: 1px solid rgba(200, 150, 62, 0.2);
                    }
                    .header {
                        background: linear-gradient(135deg, #c8963e, #d4a85a);
                        padding: 40px 30px;
                        text-align: center;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 32px;
                        color: #0a0505;
                        font-weight: 800;
                        letter-spacing: 2px;
                    }
                    .header .icon {
                        font-size: 48px;
                        display: block;
                        margin-bottom: 10px;
                    }
                    .content {
                        padding: 40px 30px;
                        color: #f5e6d3;
                    }
                    .greeting {
                        font-size: 24px;
                        font-weight: 700;
                        margin-bottom: 20px;
                        color: #f5e6d3;
                    }
                    .greeting span {
                        color: #c8963e;
                    }
                    .message {
                        font-size: 16px;
                        line-height: 1.8;
                        color: #d4c5b5;
                        margin-bottom: 20px;
                    }
                    .report-details {
                        background: rgba(200, 150, 62, 0.1);
                        border: 1px solid rgba(200, 150, 62, 0.2);
                        border-radius: 12px;
                        padding: 20px;
                        margin: 20px 0;
                    }
                    .detail-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 10px 0;
                        border-bottom: 1px solid rgba(200, 150, 62, 0.1);
                    }
                    .detail-row:last-child {
                        border-bottom: none;
                    }
                    .detail-label {
                        color: #d4c5b5;
                        font-size: 14px;
                    }
                    .detail-value {
                        color: #f5e6d3;
                        font-weight: 600;
                        font-size: 14px;
                    }
                    .detail-value .type-badge {
                        display: inline-block;
                        padding: 2px 10px;
                        border-radius: 20px;
                        font-size: 12px;
                        background: rgba(200, 150, 62, 0.2);
                        color: #c8963e;
                    }
                    .status-box {
                        background: rgba(245, 158, 11, 0.1);
                        border: 1px solid rgba(245, 158, 11, 0.2);
                        border-radius: 8px;
                        padding: 12px;
                        text-align: center;
                        margin: 10px 0;
                    }
                    .status-box .status-label {
                        font-size: 12px;
                        color: #d4c5b5;
                    }
                    .status-box .status-value {
                        font-size: 16px;
                        font-weight: 700;
                        color: #f59e0b;
                        text-transform: uppercase;
                    }
                    .button-container {
                        text-align: center;
                        margin: 30px 0 20px;
                    }
                    .button {
                        display: inline-block;
                        background: linear-gradient(135deg, #c8963e, #d4a85a);
                        color: #0a0505 !important;
                        padding: 14px 40px;
                        border-radius: 50px;
                        text-decoration: none;
                        font-weight: 700;
                        font-size: 16px;
                        transition: all 0.3s ease;
                    }
                    .button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 10px 30px rgba(200, 150, 62, 0.3);
                    }
                    .divider {
                        border: none;
                        height: 1px;
                        background: linear-gradient(to right, transparent, rgba(200, 150, 62, 0.3), transparent);
                        margin: 25px 0;
                    }
                    .footer {
                        padding: 20px 30px;
                        text-align: center;
                        border-top: 1px solid rgba(200, 150, 62, 0.1);
                    }
                    .footer p {
                        margin: 5px 0;
                        font-size: 12px;
                        color: #8a7a6a;
                    }
                    .footer .social-links {
                        margin: 10px 0;
                    }
                    .footer .social-links a {
                        color: #c8963e;
                        text-decoration: none;
                        margin: 0 10px;
                        font-size: 14px;
                    }
                    .footer .social-links a:hover {
                        text-decoration: underline;
                    }
                    .report-id {
                        background: rgba(255, 255, 255, 0.05);
                        padding: 8px 12px;
                        border-radius: 6px;
                        font-family: monospace;
                        font-size: 12px;
                        color: #d4c5b5;
                        text-align: center;
                        margin-top: 10px;
                    }
                    @media (max-width: 480px) {
                        .header h1 {
                            font-size: 24px;
                        }
                        .content {
                            padding: 30px 20px;
                        }
                        .greeting {
                            font-size: 20px;
                        }
                        .detail-row {
                            flex-direction: column;
                            gap: 5px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <span class="icon">📋</span>
                        <h1>Report Received</h1>
                        <p style="margin: 10px 0 0; color: #0a0505; opacity: 0.9; font-size: 14px;">
                            Thank you for helping us improve
                        </p>
                    </div>
                    
                    <div class="content">
                        <div class="greeting">
                            Hello <span>${userData.name}</span>! 👋
                        </div>
                        
                        <div class="message">
                            Thank you for taking the time to submit a report. We have received your report and our team will review it promptly.
                            <br><br>
                            <strong>What happens next?</strong>
                            <ul style="color: #d4c5b5; padding-left: 20px; margin: 10px 0;">
                                <li style="margin: 5px 0;">Our support team will review your report</li>
                                <li style="margin: 5px 0;">We'll investigate the issue thoroughly</li>
                                <li style="margin: 5px 0;">You'll receive updates on the status</li>
                                <li style="margin: 5px 0;">We'll notify you once resolved</li>
                            </ul>
                        </div>

                        <div class="report-details">
                            <h3 style="color: #c8963e; margin: 0 0 15px 0;">📄 Report Details</h3>
                            <div class="detail-row">
                                <span class="detail-label">Subject</span>
                                <span class="detail-value">${reportData.subject}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Type</span>
                                <span class="detail-value">
                                    <span class="type-badge">${reportData.reportType.charAt(0).toUpperCase() + reportData.reportType.slice(1)}</span>
                                </span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Description</span>
                                <span class="detail-value" style="font-weight: 400; font-size: 13px;">${reportData.description}</span>
                            </div>
                            ${reportData.relatedItem?.name ? `
                                <div class="detail-row">
                                    <span class="detail-label">Related Item</span>
                                    <span class="detail-value">${reportData.relatedItem.name} ${reportData.relatedItem.id ? `(${reportData.relatedItem.id})` : ''}</span>
                                </div>
                            ` : ''}
                            <div class="detail-row">
                                <span class="detail-label">Submitted</span>
                                <span class="detail-value">${new Date(reportData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>

                        <div class="status-box">
                            <div class="status-label">Current Status</div>
                            <div class="status-value">🟡 Under Review</div>
                        </div>

                        <div class="report-id">
                            Report ID: #${reportData.reportId}
                        </div>

                        <div class="button-container">
                            <a href="${config.CLIENT_URL}/reports" class="button">
                                📊 View My Reports
                            </a>
                        </div>

                        <hr class="divider">

                        <div style="font-size: 14px; color: #d4c5b5; text-align: center;">
                            <p>Need to add more information? <a href="${config.CLIENT_URL}/support" style="color: #c8963e; text-decoration: none;">Contact Support</a></p>
                        </div>
                    </div>

                    <div class="footer">
                        <div class="social-links">
                            <a href="#">Twitter</a>
                            <a href="#">LinkedIn</a>
                            <a href="#">YouTube</a>
                            <a href="#">Instagram</a>
                        </div>
                        <p>© 2026 Edurary. All rights reserved.</p>
                        <p style="font-size: 11px; opacity: 0.7;">
                            This email was sent to ${userData.email}. 
                            If you have any questions, contact us at support@edurary.com
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    // ========== REPORT RESOLVED EMAIL ==========
    reportResolved: (userData, reportData) => ({
        subject: `✅ Report Resolved - ${reportData.subject}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Report Resolved</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 40px auto;
                        background: linear-gradient(135deg, #0a0505 0%, #1a0a0a 100%);
                        border-radius: 20px;
                        overflow: hidden;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.4);
                        border: 1px solid rgba(34, 197, 94, 0.2);
                    }
                    .header {
                        background: linear-gradient(135deg, #22c55e, #16a34a);
                        padding: 40px 30px;
                        text-align: center;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 32px;
                        color: #ffffff;
                        font-weight: 800;
                        letter-spacing: 2px;
                    }
                    .header .icon {
                        font-size: 48px;
                        display: block;
                        margin-bottom: 10px;
                    }
                    .header p {
                        margin: 10px 0 0;
                        color: #ffffff;
                        font-size: 16px;
                        opacity: 0.9;
                    }
                    .content {
                        padding: 40px 30px;
                        color: #f5e6d3;
                    }
                    .greeting {
                        font-size: 24px;
                        font-weight: 700;
                        margin-bottom: 20px;
                        color: #f5e6d3;
                    }
                    .greeting span {
                        color: #22c55e;
                    }
                    .message {
                        font-size: 16px;
                        line-height: 1.8;
                        color: #d4c5b5;
                        margin-bottom: 20px;
                    }
                    .report-details {
                        background: rgba(34, 197, 94, 0.1);
                        border: 1px solid rgba(34, 197, 94, 0.2);
                        border-radius: 12px;
                        padding: 20px;
                        margin: 20px 0;
                    }
                    .detail-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 10px 0;
                        border-bottom: 1px solid rgba(34, 197, 94, 0.1);
                    }
                    .detail-row:last-child {
                        border-bottom: none;
                    }
                    .detail-label {
                        color: #d4c5b5;
                        font-size: 14px;
                    }
                    .detail-value {
                        color: #f5e6d3;
                        font-weight: 600;
                        font-size: 14px;
                    }
                    .status-box {
                        background: rgba(34, 197, 94, 0.15);
                        border: 2px solid rgba(34, 197, 94, 0.3);
                        border-radius: 12px;
                        padding: 20px;
                        text-align: center;
                        margin: 20px 0;
                    }
                    .status-box .status-label {
                        font-size: 14px;
                        color: #d4c5b5;
                    }
                    .status-box .status-value {
                        font-size: 24px;
                        font-weight: 700;
                        color: #22c55e;
                        text-transform: uppercase;
                    }
                    .button-container {
                        text-align: center;
                        margin: 30px 0 20px;
                    }
                    .button {
                        display: inline-block;
                        background: linear-gradient(135deg, #22c55e, #16a34a);
                        color: #ffffff !important;
                        padding: 14px 40px;
                        border-radius: 50px;
                        text-decoration: none;
                        font-weight: 700;
                        font-size: 16px;
                        transition: all 0.3s ease;
                    }
                    .button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 10px 30px rgba(34, 197, 94, 0.3);
                    }
                    .divider {
                        border: none;
                        height: 1px;
                        background: linear-gradient(to right, transparent, rgba(34, 197, 94, 0.3), transparent);
                        margin: 25px 0;
                    }
                    .footer {
                        padding: 20px 30px;
                        text-align: center;
                        border-top: 1px solid rgba(34, 197, 94, 0.1);
                    }
                    .footer p {
                        margin: 5px 0;
                        font-size: 12px;
                        color: #8a7a6a;
                    }
                    .footer .social-links {
                        margin: 10px 0;
                    }
                    .footer .social-links a {
                        color: #22c55e;
                        text-decoration: none;
                        margin: 0 10px;
                        font-size: 14px;
                    }
                    .footer .social-links a:hover {
                        text-decoration: underline;
                    }
                    .report-id {
                        background: rgba(255, 255, 255, 0.05);
                        padding: 8px 12px;
                        border-radius: 6px;
                        font-family: monospace;
                        font-size: 12px;
                        color: #d4c5b5;
                        text-align: center;
                        margin-top: 10px;
                    }
                    .resolution-box {
                        background: rgba(255, 255, 255, 0.05);
                        border-radius: 8px;
                        padding: 15px;
                        margin: 15px 0;
                    }
                    .resolution-box p {
                        margin: 5px 0;
                        color: #d4c5b5;
                        font-size: 14px;
                    }
                    @media (max-width: 480px) {
                        .header h1 {
                            font-size: 24px;
                        }
                        .content {
                            padding: 30px 20px;
                        }
                        .greeting {
                            font-size: 20px;
                        }
                        .detail-row {
                            flex-direction: column;
                            gap: 5px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <span class="icon">✅</span>
                        <h1>Report Resolved</h1>
                        <p>Your report has been successfully resolved</p>
                    </div>
                    
                    <div class="content">
                        <div class="greeting">
                            Hello <span>${userData.name}</span>! 🎉
                        </div>
                        
                        <div class="message">
                            We're happy to inform you that your report has been <strong>resolved</strong> by our team. 
                            We appreciate your patience and cooperation in helping us improve our platform.
                            <br><br>
                            <strong>What was done:</strong>
                            <ul style="color: #d4c5b5; padding-left: 20px; margin: 10px 0;">
                                <li style="margin: 5px 0;">Your report was thoroughly reviewed</li>
                                <li style="margin: 5px 0;">The issue has been investigated and addressed</li>
                                <li style="margin: 5px 0;">Resolution has been implemented</li>
                            </ul>
                        </div>

                        <div class="report-details">
                            <h3 style="color: #22c55e; margin: 0 0 15px 0;">📄 Resolution Details</h3>
                            <div class="detail-row">
                                <span class="detail-label">Subject</span>
                                <span class="detail-value">${reportData.subject}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Type</span>
                                <span class="detail-value">${reportData.reportType.charAt(0).toUpperCase() + reportData.reportType.slice(1)}</span>
                            </div>
                            ${reportData.resolvedAt ? `
                                <div class="detail-row">
                                    <span class="detail-label">Resolved On</span>
                                    <span class="detail-value">${new Date(reportData.resolvedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            ` : ''}
                            ${reportData.adminNotes ? `
                                <div class="detail-row" style="flex-direction: column; gap: 5px;">
                                    <span class="detail-label">Admin Notes</span>
                                    <span class="detail-value" style="font-weight: 400; font-size: 13px;">${reportData.adminNotes}</span>
                                </div>
                            ` : ''}
                        </div>

                        <div class="status-box">
                            <div class="status-label">Current Status</div>
                            <div class="status-value">✅ Resolved</div>
                        </div>

                        <div class="resolution-box">
                            <p style="text-align: center; color: #22c55e; font-weight: 600;">✨ Thank you for your valuable feedback!</p>
                            <p style="text-align: center; font-size: 13px;">Your report has been closed. If you have any further questions, please don't hesitate to contact us.</p>
                        </div>

                        <div class="report-id">
                            Report ID: #${reportData.reportId}
                        </div>

                       

                        <hr class="divider">

                        <div style="font-size: 14px; color: #d4c5b5; text-align: center;">
                            <p>Need help? <a href="${config.CLIENT_URL}/support" style="color: #22c55e; text-decoration: none;">Contact Support</a></p>
                        </div>
                    </div>

                    <div class="footer">
                        <div class="social-links">
                            <a href="#">Twitter</a>
                            <a href="#">LinkedIn</a>
                            <a href="#">YouTube</a>
                            <a href="#">Instagram</a>
                        </div>
                        <p>© 2026 Edurary. All rights reserved.</p>
                        <p style="font-size: 11px; opacity: 0.7;">
                            This email was sent to ${userData.email}. 
                            If you have any questions, contact us at support@edurary.com
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `
    })
};

// ========== SEND EMAIL FUNCTION ==========
export const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: `"Edurary" <${config.EMAIL_USER}>`,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error: error.message };
    }
};

// ========== SEND REPORT CREATED EMAIL ==========
export const sendReportCreatedEmail = async (user, report) => {
    try {
        const template = emailTemplates.reportCreated(
            { name: user.name, email: user.email },
            {
                subject: report.subject,
                reportType: report.reportType,
                description: report.description,
                relatedItem: report.relatedItem,
                createdAt: report.createdAt,
                reportId: report._id.toString().slice(-8).toUpperCase()
            }
        );
        
        const result = await sendEmail(user.email, template.subject, template.html);
        return result;
    } catch (error) {
        console.error('Failed to send report created email:', error);
        return { success: false, error: error.message };
    }
};

// ========== SEND REPORT RESOLVED EMAIL ==========
export const sendReportResolvedEmail = async (user, report) => {
    try {
        const template = emailTemplates.reportResolved(
            { name: user.name, email: user.email },
            {
                subject: report.subject,
                reportType: report.reportType,
                resolvedAt: report.resolvedAt || new Date(),
                adminNotes: report.adminNotes || 'Your report has been resolved successfully.',
                reportId: report._id.toString().slice(-8).toUpperCase()
            }
        );
        
        const result = await sendEmail(user.email, template.subject, template.html);
        return result;
    } catch (error) {
        console.error('Failed to send report resolved email:', error);
        return { success: false, error: error.message };
    }
};

export default {
    sendEmail,
    sendReportCreatedEmail,
    sendReportResolvedEmail
};