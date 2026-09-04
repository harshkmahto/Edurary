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
    welcome: (userData) => ({
        subject: 'Welcome to Edurary! 🎉 Start Your Learning Journey',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to Edurary</title>
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
                    .header p {
                        margin: 10px 0 0;
                        color: #0a0505;
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
                        color: #c8963e;
                    }
                    .message {
                        font-size: 16px;
                        line-height: 1.8;
                        color: #d4c5b5;
                        margin-bottom: 30px;
                    }
                    .features {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 15px;
                        margin: 30px 0;
                    }
                    .feature-box {
                        background: rgba(200, 150, 62, 0.1);
                        border: 1px solid rgba(200, 150, 62, 0.2);
                        border-radius: 12px;
                        padding: 15px;
                        text-align: center;
                    }
                    .feature-box .icon {
                        font-size: 28px;
                        display: block;
                        margin-bottom: 8px;
                    }
                    .feature-box h3 {
                        margin: 0;
                        font-size: 14px;
                        color: #f5e6d3;
                        font-weight: 600;
                    }
                    .feature-box p {
                        margin: 5px 0 0;
                        font-size: 12px;
                        color: #d4c5b5;
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
                        letter-spacing: 0.5px;
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
                    @media (max-width: 480px) {
                        .features {
                            grid-template-columns: 1fr;
                        }
                        .header h1 {
                            font-size: 24px;
                        }
                        .content {
                            padding: 30px 20px;
                        }
                        .greeting {
                            font-size: 20px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📚 Edurary</h1>
                        <p>Your Learning Journey Begins Here</p>
                    </div>
                    
                    <div class="content">
                        <div class="greeting">
                            Hello <span>${userData.name}</span>! 👋
                        </div>
                        
                        <div class="message">
                            Welcome to <strong>Edurary</strong>! We're thrilled to have you join our community of lifelong learners. 
                            Get ready to explore thousands of courses, books, and resources designed to help you grow and succeed.
                        </div>

                        <div class="features">
                            <div class="feature-box">
                                <span class="icon">🎓</span>
                                <h3>Premium Courses</h3>
                                <p>Learn from industry experts</p>
                            </div>
                            <div class="feature-box">
                                <span class="icon">📖</span>
                                <h3>Digital Library</h3>
                                <p>Access thousands of books</p>
                            </div>
                            <div class="feature-box">
                                <span class="icon">🏆</span>
                                <h3>Certificates</h3>
                                <p>Earn recognized credentials</p>
                            </div>
                            <div class="feature-box">
                                <span class="icon">💡</span>
                                <h3>Community</h3>
                                <p>Learn together, grow together</p>
                            </div>
                        </div>

                        <div class="button-container">
                            <a href="${config.CLIENT_URL}/dashboard" class="button">
                                🚀 Start Learning Now
                            </a>
                        </div>

                        <hr class="divider">

                        <div style="font-size: 14px; color: #d4c5b5; text-align: center;">
                            <p>Here's what you can do next:</p>
                            <p style="margin: 5px 0;">📚 Explore our <a href="${config.CLIENT_URL}/courses" style="color: #c8963e; text-decoration: none;">course catalog</a></p>
                            <p style="margin: 5px 0;">📖 Browse our <a href="${config.CLIENT_URL}/books" style="color: #c8963e; text-decoration: none;">digital library</a></p>
                            <p style="margin: 5px 0;">👥 Connect with <a href="${config.CLIENT_URL}/community" style="color: #c8963e; text-decoration: none;">other learners</a></p>
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

    accountStatusUpdate: (userData, statusData) => ({
        subject: `Account Status Update - ${statusData.status}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Account Status Update</title>
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
                        background: linear-gradient(135deg, ${statusData.status === 'active' ? '#10b981' : '#ef4444'}, ${statusData.status === 'active' ? '#059669' : '#dc2626'});
                        padding: 40px 30px;
                        text-align: center;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                        color: #ffffff;
                        font-weight: 700;
                    }
                    .header .status-icon {
                        font-size: 48px;
                        display: block;
                        margin-bottom: 10px;
                    }
                    .content {
                        padding: 40px 30px;
                        color: #f5e6d3;
                    }
                    .greeting {
                        font-size: 22px;
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
                    .status-box {
                        background: rgba(200, 150, 62, 0.1);
                        border: 2px solid ${statusData.status === 'active' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
                        border-radius: 12px;
                        padding: 20px;
                        text-align: center;
                        margin: 20px 0;
                    }
                    .status-box .status-label {
                        font-size: 14px;
                        color: #d4c5b5;
                        margin-bottom: 5px;
                    }
                    .status-box .status-value {
                        font-size: 24px;
                        font-weight: 700;
                        color: ${statusData.status === 'active' ? '#10b981' : '#ef4444'};
                        text-transform: uppercase;
                    }
                    .status-box .status-value .badge {
                        display: inline-block;
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 14px;
                        background: ${statusData.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
                    }
                    .button-container {
                        text-align: center;
                        margin: 25px 0 15px;
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
                    .details {
                        background: rgba(255, 255, 255, 0.05);
                        border-radius: 8px;
                        padding: 15px;
                        margin: 15px 0;
                    }
                    .details-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 8px 0;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    }
                    .details-row:last-child {
                        border-bottom: none;
                    }
                    .details-label {
                        color: #d4c5b5;
                        font-size: 14px;
                    }
                    .details-value {
                        color: #f5e6d3;
                        font-size: 14px;
                        font-weight: 600;
                    }
                    @media (max-width: 480px) {
                        .header h1 {
                            font-size: 22px;
                        }
                        .content {
                            padding: 30px 20px;
                        }
                        .greeting {
                            font-size: 18px;
                        }
                        .status-box .status-value {
                            font-size: 20px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <span class="status-icon">${statusData.status === 'active' ? '✅' : '⚠️'}</span>
                        <h1>Account Status Update</h1>
                    </div>
                    
                    <div class="content">
                        <div class="greeting">
                            Hello <span>${userData.name}</span>!
                        </div>
                        
                        <div class="message">
                            We're writing to inform you that your account status has been updated.
                            ${statusData.status === 'active' 
                                ? 'Your account is now active and you have full access to all features.' 
                                : 'Your account has been deactivated. Please contact support for assistance.'}
                        </div>

                        <div class="status-box">
                            <div class="status-label">Current Status</div>
                            <div class="status-value">
                                <span class="badge">${statusData.status === 'active' ? '🟢 ACTIVE' : '🔴 DEACTIVATED'}</span>
                            </div>
                        </div>

                        ${statusData.details ? `
                            <div class="details">
                                <div class="details-row">
                                    <span class="details-label">Updated By</span>
                                    <span class="details-value">${statusData.updatedBy || 'Admin'}</span>
                                </div>
                                <div class="details-row">
                                    <span class="details-label">Updated At</span>
                                    <span class="details-value">${new Date().toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</span>
                                </div>
                                ${statusData.reason ? `
                                    <div class="details-row">
                                        <span class="details-label">Reason</span>
                                        <span class="details-value">${statusData.reason}</span>
                                    </div>
                                ` : ''}
                            </div>
                        ` : ''}

                        ${statusData.status === 'active' ? `
                            <div class="button-container">
                                <a href="${config.CLIENT_URL}/dashboard" class="button">
                                    🚀 Go to Dashboard
                                </a>
                            </div>
                        ` : `
                            <div class="message" style="text-align: center; background: rgba(239, 68, 68, 0.1); padding: 15px; border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.2);">
                                <p style="margin: 0; color: #ef4444;">If you believe this is a mistake, please contact our support team.</p>
                            </div>
                            <div class="button-container">
                                <a href="mailto:support@edurary.com" class="button">
                                    📧 Contact Support
                                </a>
                            </div>
                        `}

                        <hr class="divider">

                        <div style="font-size: 14px; color: #d4c5b5; text-align: center;">
                            <p>Need help? Visit our <a href="${config.CLIENT_URL}/support" style="color: #c8963e; text-decoration: none;">Support Center</a></p>
                        </div>
                    </div>

                    <div class="footer">
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

// Send email function
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

// Send Welcome Email
export const sendWelcomeEmail = async (user) => {
    try {
        const template = emailTemplates.welcome({
            name: user.name,
            email: user.email
        });
        
        const result = await sendEmail(user.email, template.subject, template.html);
        return result;
    } catch (error) {
        console.error('Failed to send welcome email:', error);
        return { success: false, error: error.message };
    }
};

// Send Account Status Update Email
export const sendAccountStatusUpdateEmail = async (user, status, updatedBy = 'Admin', reason = '') => {
    try {
        const template = emailTemplates.accountStatusUpdate(
            { name: user.name, email: user.email },
            { 
                status: status, 
                updatedBy: updatedBy,
                reason: reason,
                details: true
            }
        );
        
        const result = await sendEmail(user.email, template.subject, template.html);
        return result;
    } catch (error) {
        console.error('Failed to send account status update email:', error);
        return { success: false, error: error.message };
    }
};

// Additional utility functions for common email scenarios
export const sendWelcomeAndBookRecommendations = async (user) => {
    try {
        // Send welcome email
        await sendWelcomeEmail(user);
        
        // You can add logic here to send book recommendations
        // or additional welcome content
        return { success: true };
    } catch (error) {
        console.error('Failed to send welcome with recommendations:', error);
        return { success: false, error: error.message };
    }
};

export default {
    sendEmail,
    sendWelcomeEmail,
    sendAccountStatusUpdateEmail,
    sendWelcomeAndBookRecommendations
};