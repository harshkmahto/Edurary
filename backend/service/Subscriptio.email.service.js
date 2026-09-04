// service/subscription.email.service.js
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
    subscriptionCreated: (userData, subscriptionData) => ({
        subject: '🎉 Welcome to Edurary Premium! Subscription Confirmed',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Subscription Confirmed</title>
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
                    .header .sub-icon {
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
                    .subscription-details {
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
                    .detail-value.price {
                        color: #c8963e;
                        font-size: 18px;
                    }
                    .benefits {
                        margin: 20px 0;
                        background: rgba(255, 255, 255, 0.05);
                        border-radius: 12px;
                        padding: 15px 20px;
                    }
                    .benefits li {
                        color: #d4c5b5;
                        padding: 8px 0;
                        list-style: none;
                        font-size: 14px;
                    }
                    .benefits li:before {
                        content: "✓ ";
                        color: #c8963e;
                        font-weight: 700;
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
                    .status-badge {
                        display: inline-block;
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: 600;
                        background: #10b981;
                        color: white;
                    }
                    .status-badge.pending {
                        background: #f59e0b;
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
                        <span class="sub-icon">🌟</span>
                        <h1>Premium Subscription Activated!</h1>
                    </div>
                    
                    <div class="content">
                        <div class="greeting">
                            Hello <span>${userData.name}</span>! 🎉
                        </div>
                        
                        <div class="message">
                            Thank you for subscribing to <strong>Edurary Premium</strong>! 
                            You now have access to exclusive content, premium courses, and our entire digital library.
                            ${subscriptionData.paymentStatus === 'pending' ? 
                                '<br><br><strong style="color: #f59e0b;">⚠️ Payment is pending verification. Your subscription will be fully activated once payment is confirmed.</strong>' : 
                                ''}
                        </div>

                        <div class="subscription-details">
                            <h3 style="color: #c8963e; margin: 0 0 15px 0;">📋 Subscription Details</h3>
                            <div class="detail-row">
                                <span class="detail-label">Plan</span>
                                <span class="detail-value">${subscriptionData.planName}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Price</span>
                                <span class="detail-value price">₹${subscriptionData.sellingPrice}</span>
                            </div>
                            ${subscriptionData.originalPrice && subscriptionData.originalPrice > subscriptionData.sellingPrice ? `
                                <div class="detail-row">
                                    <span class="detail-label">Original Price</span>
                                    <span class="detail-value" style="text-decoration: line-through; opacity: 0.6;">₹${subscriptionData.originalPrice}</span>
                                </div>
                            ` : ''}
                            <div class="detail-row">
                                <span class="detail-label">Validity</span>
                                <span class="detail-value">${subscriptionData.validityValue} ${subscriptionData.validityUnit}</span>
                            </div>
                            ${subscriptionData.startDate ? `
                                <div class="detail-row">
                                    <span class="detail-label">Start Date</span>
                                    <span class="detail-value">${new Date(subscriptionData.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                            ` : ''}
                            ${subscriptionData.endDate ? `
                                <div class="detail-row">
                                    <span class="detail-label">End Date</span>
                                    <span class="detail-value">${new Date(subscriptionData.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                            ` : ''}
                            <div class="detail-row">
                                <span class="detail-label">Status</span>
                                <span class="detail-value">
                                    <span class="status-badge ${subscriptionData.subscriptionStatus === 'active' ? '' : 'pending'}">
                                        ${subscriptionData.subscriptionStatus.toUpperCase()}
                                    </span>
                                </span>
                            </div>
                            ${subscriptionData.transactionId ? `
                                <div class="detail-row">
                                    <span class="detail-label">Transaction ID</span>
                                    <span class="detail-value">${subscriptionData.transactionId}</span>
                                </div>
                            ` : ''}
                        </div>

                        <div class="benefits">
                            <h4 style="color: #c8963e; margin: 0 0 10px 0;">✨ What You Get:</h4>
                            <ul style="margin: 0; padding: 0;">
                                <li>Access to 100+ premium courses</li>
                                <li>Digital library with 500+ books</li>
                                <li>Live sessions with industry experts</li>
                                <li>24/7 support and community access</li>
                                <li>Certificates upon course completion</li>
                                <li>Exclusive content and resources</li>
                            </ul>
                        </div>

                        <div class="button-container">
                            <a href="${config.CLIENT_URL}/" class="button">
                                🚀 Start Learning Now
                            </a>
                        </div>

                        <div style="text-align: center; color: #d4c5b5; font-size: 14px;">
                            <p>📚 Explore courses: <a href="${config.CLIENT_URL}/courses" style="color: #c8963e; text-decoration: none;">Browse Courses</a></p>
                            <p>📖 Read books: <a href="${config.CLIENT_URL}/books" style="color: #c8963e; text-decoration: none;">Digital Library</a></p>
                        </div>

                        <hr class="divider">

                        <div style="font-size: 14px; color: #d4c5b5; text-align: center;">
                            <p>Need help? Contact us at <a href="mailto:support@edurary.com" style="color: #c8963e; text-decoration: none;">support@edurary.com</a></p>
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
    }),

    subscriptionStatusUpdate: (userData, subscriptionData) => ({
        subject: `📋 Subscription Status Update - ${subscriptionData.subscriptionStatus}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Subscription Status Update</title>
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
                        background: linear-gradient(135deg, ${subscriptionData.subscriptionStatus === 'active' ? '#10b981' : subscriptionData.subscriptionStatus === 'pending' ? '#f59e0b' : '#ef4444'}, 
                            ${subscriptionData.subscriptionStatus === 'active' ? '#059669' : subscriptionData.subscriptionStatus === 'pending' ? '#d97706' : '#dc2626'});
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
                        border: 2px solid ${subscriptionData.subscriptionStatus === 'active' ? 'rgba(16, 185, 129, 0.3)' : 
                            subscriptionData.subscriptionStatus === 'pending' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
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
                        color: ${subscriptionData.subscriptionStatus === 'active' ? '#10b981' : 
                            subscriptionData.subscriptionStatus === 'pending' ? '#f59e0b' : '#ef4444'};
                        text-transform: uppercase;
                    }
                    .subscription-details {
                        background: rgba(255, 255, 255, 0.05);
                        border-radius: 12px;
                        padding: 15px;
                        margin: 15px 0;
                    }
                    .detail-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 8px 0;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
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
                        font-size: 14px;
                        font-weight: 600;
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
                        <span class="status-icon">${subscriptionData.subscriptionStatus === 'active' ? '✅' : 
                            subscriptionData.subscriptionStatus === 'pending' ? '⏳' : '⚠️'}</span>
                        <h1>Subscription Status Update</h1>
                    </div>
                    
                    <div class="content">
                        <div class="greeting">
                            Hello <span>${userData.name}</span>!
                        </div>
                        
                        <div class="message">
                            We're writing to inform you that your subscription status has been updated.
                            ${subscriptionData.subscriptionStatus === 'active' 
                                ? 'Your subscription is now active! You have full access to all premium features.' 
                                : subscriptionData.subscriptionStatus === 'pending'
                                ? 'Your subscription is currently pending review. We\'ll notify you once it\'s activated.'
                                : 'Your subscription has been deactivated or expired. Please contact support for assistance.'}
                        </div>

                        <div class="status-box">
                            <div class="status-label">Current Status</div>
                            <div class="status-value">${subscriptionData.subscriptionStatus.toUpperCase()}</div>
                        </div>

                        <div class="subscription-details">
                            <div class="detail-row">
                                <span class="detail-label">Plan</span>
                                <span class="detail-value">${subscriptionData.planName}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Price</span>
                                <span class="detail-value">₹${subscriptionData.sellingPrice}</span>
                            </div>
                            ${subscriptionData.startDate ? `
                                <div class="detail-row">
                                    <span class="detail-label">Start Date</span>
                                    <span class="detail-value">${new Date(subscriptionData.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                            ` : ''}
                            ${subscriptionData.endDate ? `
                                <div class="detail-row">
                                    <span class="detail-label">End Date</span>
                                    <span class="detail-value">${new Date(subscriptionData.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                            ` : ''}
                            ${subscriptionData.reason ? `
                                <div class="detail-row">
                                    <span class="detail-label">Reason</span>
                                    <span class="detail-value">${subscriptionData.reason}</span>
                                </div>
                            ` : ''}
                        </div>

                        ${subscriptionData.subscriptionStatus === 'active' ? `
                            <div class="button-container">
                                <a href="${config.CLIENT_URL}/dashboard" class="button">
                                    🚀 Go to Dashboard
                                </a>
                            </div>
                        ` : subscriptionData.subscriptionStatus === 'pending' ? `
                            <div class="button-container">
                                <a href="${config.CLIENT_URL}/subscription" class="button">
                                    📋 Check Status
                                </a>
                            </div>
                        ` : `
                            <div class="button-container">
                                <a href="${config.CLIENT_URL}/subscription" class="button">
                                    🔄 Renew Subscription
                                </a>
                            </div>
                        `}

                        <hr class="divider">

                        <div style="font-size: 14px; color: #d4c5b5; text-align: center;">
                            <p>Need help? <a href="mailto:support@edurary.com" style="color: #c8963e; text-decoration: none;">Contact Support</a></p>
                        </div>
                    </div>

                    <div class="footer">
                        <p>© 2026 Edurary. All rights reserved.</p>
                        <p style="font-size: 11px; opacity: 0.7;">
                            This email was sent to ${userData.email}
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    paymentStatusUpdate: (userData, subscriptionData) => ({
        subject: `💰 Payment Status Update - ${subscriptionData.paymentStatus}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Payment Status Update</title>
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
                        background: linear-gradient(135deg, ${subscriptionData.paymentStatus === 'success' ? '#10b981' : 
                            subscriptionData.paymentStatus === 'review' ? '#f59e0b' : '#ef4444'}, 
                            ${subscriptionData.paymentStatus === 'success' ? '#059669' : 
                            subscriptionData.paymentStatus === 'review' ? '#d97706' : '#dc2626'});
                        padding: 40px 30px;
                        text-align: center;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                        color: #ffffff;
                        font-weight: 700;
                    }
                    .header .payment-icon {
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
                    .payment-box {
                        background: rgba(200, 150, 62, 0.1);
                        border: 2px solid ${subscriptionData.paymentStatus === 'success' ? 'rgba(16, 185, 129, 0.3)' : 
                            subscriptionData.paymentStatus === 'review' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
                        border-radius: 12px;
                        padding: 20px;
                        text-align: center;
                        margin: 20px 0;
                    }
                    .payment-box .payment-label {
                        font-size: 14px;
                        color: #d4c5b5;
                        margin-bottom: 5px;
                    }
                    .payment-box .payment-value {
                        font-size: 24px;
                        font-weight: 700;
                        color: ${subscriptionData.paymentStatus === 'success' ? '#10b981' : 
                            subscriptionData.paymentStatus === 'review' ? '#f59e0b' : '#ef4444'};
                        text-transform: uppercase;
                    }
                    .payment-details {
                        background: rgba(255, 255, 255, 0.05);
                        border-radius: 12px;
                        padding: 15px;
                        margin: 15px 0;
                    }
                    .detail-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 8px 0;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
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
                        font-size: 14px;
                        font-weight: 600;
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
                        .payment-box .payment-value {
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
                        <span class="payment-icon">${subscriptionData.paymentStatus === 'success' ? '✅' : 
                            subscriptionData.paymentStatus === 'review' ? '⏳' : '❌'}</span>
                        <h1>Payment Status Update</h1>
                    </div>
                    
                    <div class="content">
                        <div class="greeting">
                            Hello <span>${userData.name}</span>!
                        </div>
                        
                        <div class="message">
                            We're writing to inform you about your payment status update.
                            ${subscriptionData.paymentStatus === 'success' 
                                ? 'Your payment has been successfully confirmed! Thank you for your purchase.' 
                                : subscriptionData.paymentStatus === 'review'
                                ? 'Your payment is currently under review. We\'ll notify you once it\'s confirmed.'
                                : 'Your payment could not be processed. Please try again or contact support.'}
                        </div>

                        <div class="payment-box">
                            <div class="payment-label">Payment Status</div>
                            <div class="payment-value">${subscriptionData.paymentStatus.toUpperCase()}</div>
                        </div>

                        <div class="payment-details">
                            <div class="detail-row">
                                <span class="detail-label">Plan</span>
                                <span class="detail-value">${subscriptionData.planName}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Amount</span>
                                <span class="detail-value">₹${subscriptionData.sellingPrice}</span>
                            </div>
                            ${subscriptionData.transactionId ? `
                                <div class="detail-row">
                                    <span class="detail-label">Transaction ID</span>
                                    <span class="detail-value">${subscriptionData.transactionId}</span>
                                </div>
                            ` : ''}
                            ${subscriptionData.paymentDate ? `
                                <div class="detail-row">
                                    <span class="detail-label">Payment Date</span>
                                    <span class="detail-value">${new Date(subscriptionData.paymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                            ` : ''}
                            ${subscriptionData.reason ? `
                                <div class="detail-row">
                                    <span class="detail-label">Reason</span>
                                    <span class="detail-value">${subscriptionData.reason}</span>
                                </div>
                            ` : ''}
                        </div>

                        ${subscriptionData.paymentStatus === 'success' ? `
                            <div class="button-container">
                                <a href="${config.CLIENT_URL}/" class="button">
                                    🚀 Go to Dashboard
                                </a>
                            </div>
                        ` : subscriptionData.paymentStatus === 'review' ? `
                            <div class="button-container">
                                <a href="${config.CLIENT_URL}/orders" class="button">
                                    📋 Track Payment
                                </a>
                            </div>
                        ` : `
                            <div class="button-container">
                                <a href="${config.CLIENT_URL}/orders" class="button">
                                    🔄 Retry Payment
                                </a>
                            </div>
                        `}

                        <hr class="divider">

                        <div style="font-size: 14px; color: #d4c5b5; text-align: center;">
                            <p>Need help? <a href="mailto:support@edurary.com" style="color: #c8963e; text-decoration: none;">Contact Support</a></p>
                        </div>
                    </div>

                    <div class="footer">
                        <p>© 2026 Edurary. All rights reserved.</p>
                        <p style="font-size: 11px; opacity: 0.7;">
                            This email was sent to ${userData.email}
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

// Send Subscription Created Email
export const sendSubscriptionCreatedEmail = async (user, subscription) => {
    try {
        const template = emailTemplates.subscriptionCreated(
            { name: user.name, email: user.email },
            {
                planName: subscription.planName,
                sellingPrice: subscription.sellingPrice,
                originalPrice: subscription.price,
                validityValue: subscription.validity?.value || 1,
                validityUnit: subscription.validity?.unit || 'month',
                startDate: subscription.startDate,
                endDate: subscription.endDate,
                subscriptionStatus: subscription.subscriptionStatus,
                paymentStatus: subscription.paymentStatus,
                transactionId: subscription.transactionId
            }
        );
        
        const result = await sendEmail(user.email, template.subject, template.html);
        return result;
    } catch (error) {
        console.error('Failed to send subscription created email:', error);
        return { success: false, error: error.message };
    }
};

// Send Subscription Status Update Email
export const sendSubscriptionStatusUpdateEmail = async (user, subscription, reason = '') => {
    try {
        const template = emailTemplates.subscriptionStatusUpdate(
            { name: user.name, email: user.email },
            {
                planName: subscription.planName,
                sellingPrice: subscription.sellingPrice,
                subscriptionStatus: subscription.subscriptionStatus,
                startDate: subscription.startDate,
                endDate: subscription.endDate,
                reason: reason || subscription.statusReason || ''
            }
        );
        
        const result = await sendEmail(user.email, template.subject, template.html);
        return result;
    } catch (error) {
        console.error('Failed to send subscription status update email:', error);
        return { success: false, error: error.message };
    }
};

// Send Payment Status Update Email
export const sendPaymentStatusUpdateEmail = async (user, subscription, reason = '') => {
    try {
        const template = emailTemplates.paymentStatusUpdate(
            { name: user.name, email: user.email },
            {
                planName: subscription.planName,
                sellingPrice: subscription.sellingPrice,
                paymentStatus: subscription.paymentStatus,
                transactionId: subscription.transactionId,
                paymentDate: subscription.paymentDate,
                reason: reason || subscription.statusReason || ''
            }
        );
        
        const result = await sendEmail(user.email, template.subject, template.html);
        return result;
    } catch (error) {
        console.error('Failed to send payment status update email:', error);
        return { success: false, error: error.message };
    }
};

export default {
    sendEmail,
    sendSubscriptionCreatedEmail,
    sendSubscriptionStatusUpdateEmail,
    sendPaymentStatusUpdateEmail
};