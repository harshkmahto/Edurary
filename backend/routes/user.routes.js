import { Router } from 'express';
import { register, verifyOTP, resendOTP, login, verifyLoginOTP, logout,
     getUserProfile,updateUserProfile,

     getAllUsers,
     getUserById,
     updateUser,
     deleteUser,  } from '../controller/users/user.controller.js';
import {  activateSubscription, activeSubscription, createSubscription, deleteSubscription, getAllSubscriptions, getSubscriptionById, updateSubscription } from '../controller/users/subscription.controller.js';

import { admin, auth } from '../middleware/auth.middleware.js';
import { createSubscriber, deleteReceipt, getAllInvoices, getAllSubscribers, getInvoice, getSubscriberById, getUpiDetails, getUserActiveSubscription, getUserSubscriptions, submitPaymentProof, updatePaymentStatus, updateSubscriptionStatus, updateUpiDetails } from '../controller/users/subscriber.controller.js';
import { upload } from '../middleware/upload.middleware.js';

const userRoute = Router();

userRoute.post('/register', register);
userRoute.post('/verify-otp', verifyOTP);
userRoute.post('/resend-otp', resendOTP);
userRoute.post('/login', login);
userRoute.post('/verify-login-otp', verifyLoginOTP);
userRoute.post('/logout', logout );

userRoute.get('/profile', auth, getUserProfile);
userRoute.patch('/profile', auth, upload.single('profilePicture'), updateUserProfile);

//----------------------ADMIN ROUTES----------------------//
userRoute.get('/admin/users', auth, admin, getAllUsers);
userRoute.get('/admin/users/:id', auth, admin, getUserById);

userRoute.patch('/update/:id', auth, admin, updateUser);
userRoute.delete('/delete/:id', deleteUser);

//----------------------SUBSCRIPTION ROUTES----------------------//
userRoute.get('/active/subscription',  activeSubscription);
userRoute.get('/subscription/:id', auth, getSubscriptionById);


userRoute.post('/subscription', auth, admin,  createSubscription);
userRoute.get('/subscription', auth, admin, getAllSubscriptions);
userRoute.patch('/subscription/:id', auth, admin,  updateSubscription);
userRoute.delete('/subscription/:id', auth, admin, deleteSubscription);
userRoute.patch('/subscription/:id/activate', auth, admin, activateSubscription);


//----------------------SUBSCRIBER ROUTES----------------------//

// User routes
userRoute.post('/create', auth, createSubscriber);
userRoute.post('/submit-payment', auth, upload.single('receipt'), submitPaymentProof);
userRoute.get('/my-subscriptions', auth, getUserSubscriptions);
userRoute.get('/active', auth, getUserActiveSubscription);
userRoute.get('/subscriber/:id', auth, getSubscriberById);

userRoute.get('/invoice/:subscriberId', auth, getInvoice);
userRoute.get('/invoices', auth, getAllInvoices);


// Admin routes
userRoute.get('/all', auth, admin, getAllSubscribers);
userRoute.put('/status/:subscriberId', auth, admin, updateSubscriptionStatus);
userRoute.put('/payment-status/:subscriberId', auth, admin, updatePaymentStatus);
userRoute.delete('/receipt/:subscriberId', auth, admin, deleteReceipt);

// UPI routes
userRoute.get('/upi', getUpiDetails);
userRoute.put('/upi', auth, admin, updateUpiDetails);



export default userRoute