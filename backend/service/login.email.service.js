import nodemailer from 'nodemailer';
import config from '../config/config.js';


const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: config.EMAIL_USER, 
        pass: config.EMAIL_PASS  
    }
});

export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
};


export const sendOTP = async (email, name, otp) => {
    const mailOptions = {
        from: config.EMAIL_USER,
        to: email,
        subject: 'Email Verification - Your OTP Code',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Email Verification</h2>
                <p>Dear ${name},</p>
                <p>Thank you for registering . Please use the following OTP to verify your email address:</p>
                <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
                    <strong>${otp}</strong>
                </div>
                <p>This OTP is valid for 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <hr>
                <p style="color: #777; font-size: 12px;">This is an automated message, please do not reply.</p>
            </div>
        `
    };
    
    await transporter.sendMail(mailOptions);
};