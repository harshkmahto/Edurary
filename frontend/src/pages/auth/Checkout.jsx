// Checkout.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
  Check, Crown, Sparkles, Zap, Star, Shield, Users, BookOpen, Award, 
  IndianRupee, Calendar, Tag, Info, FileText, List, X, 
  ArrowLeft, CreditCard, Lock, Clock, AlertCircle, Loader2, 
  Phone, Mail, User, Edit2, Copy, CheckCircle, Upload, Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../../context/authContext';
import authService from '../../services/auth.service';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const resumeSubscriberId = searchParams.get('resume');
  
  const { user, isAuthenticated, loading: authLoading, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);
  const [subscriberId, setSubscriberId] = useState(null);
  
  // Resume mode state
  const [isResumeMode, setIsResumeMode] = useState(false);
  const [pendingSubscriber, setPendingSubscriber] = useState(null);
  
  // Phone and email state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);
  const [phoneUpdateSuccess, setPhoneUpdateSuccess] = useState(false);

  // Payment modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1); // 1: QR Code, 2: Transaction ID, 3: Upload Receipt
  const [transactionId, setTransactionId] = useState('');
  const [receiptImage, setReceiptImage] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [upiId, setUpiId] = useState('');

  // Check for existing active subscription
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [activeSubscription, setActiveSubscription] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      toast.error('Please sign in to continue');
      navigate('/auth/signin');
      return;
    }

    if (user) {
      const userPhone = user.phone || user.mobile || user.phoneNumber || user.contact || '';
      setPhoneNumber(userPhone);
      setEmailAddress(user.email || '');
      
      // Check if user has active subscription
      if (user.hasActiveSubscription && user.activeSubscriptionId) {
        setHasActiveSubscription(true);
        fetchActiveSubscription();
      }
    }

    // ✅ Check if this is a resume payment
    if (resumeSubscriberId) {
      setIsResumeMode(true);
      fetchPendingSubscriber(resumeSubscriberId);
    }

    if (id) {
      fetchPlanDetails();
      fetchUpiDetails();
    } else {
      setError('No plan selected');
      setLoading(false);
    }
  }, [id, isAuthenticated, authLoading, user, resumeSubscriberId]);

  // ✅ New: Fetch pending subscriber for resume
  const fetchPendingSubscriber = async (subscriberId) => {
    try {
      const response = await authService.getSubscriberById(subscriberId);
      if (response?.success) {
        const subscriber = response.data;
        // Check if subscriber is actually pending
        if (subscriber.paymentStatus === 'pending') {
          setPendingSubscriber(subscriber);
          setSubscriberId(subscriberId);
          // Set phone and email from subscriber
          if (subscriber.userPhone) setPhoneNumber(subscriber.userPhone);
          if (subscriber.userEmail) setEmailAddress(subscriber.userEmail);
          toast.success('Resuming your pending payment');
        } else if (subscriber.paymentStatus === 'review') {
          toast.error('This payment is already under review. Please wait for admin verification.');
          navigate('/subscription');
        } else if (subscriber.paymentStatus === 'success') {
          toast.success('This payment is already completed!');
          navigate('/subscription');
        } else {
          toast.error('This subscription is not pending. Please start a new payment.');
          navigate('/subscription');
        }
      } else {
        toast.error(response?.message || 'Failed to fetch pending subscription');
        navigate('/subscription');
      }
    } catch (error) {
      console.error('Error fetching pending subscriber:', error);
      toast.error('Failed to fetch pending payment details');
      navigate('/subscription');
    }
  };

  const fetchActiveSubscription = async () => {
    try {
      const response = await authService.getUserActiveSubscription();
      if (response?.success && response?.hasSubscription) {
        setActiveSubscription(response.subscription);
      }
    } catch (error) {
      console.error('Error fetching active subscription:', error);
    }
  };

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.getSubscriptionById(id);
      
      if (response?.success && response?.subscription) {
        setPlan(response.subscription);
      } else {
        setError(response?.message || 'Plan not found');
      }
    } catch (error) {
      console.error('Error fetching plan:', error);
      setError(error.message || 'Failed to fetch plan details');
      toast.error('Failed to load plan details');
    } finally {
      setLoading(false);
    }
  };

  const fetchUpiDetails = async () => {
    try {
      const response = await authService.getUpiDetails();
      if (response?.success) {
        setUpiId(response.upiId || 'edurary@pay');
      }
    } catch (error) {
      console.error('Error fetching UPI details:', error);
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, '');
    if (!cleaned) return '';
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }
    if (cleaned.length === 11 && cleaned.startsWith('91')) {
      return `+${cleaned}`;
    }
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+${cleaned}`;
    }
    if (phone.startsWith('+')) {
      return phone;
    }
    return cleaned;
  };

  const isValidPhone = (phone) => {
    if (!phone) return false;
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10;
  };

  const isValidEmail = (email) => {
    return email && email.includes('@') && email.includes('.');
  };

  const updateUserPhone = async () => {
    try {
      setIsUpdatingPhone(true);
      const cleanedPhone = phoneNumber.replace(/\D/g, '');
      if (cleanedPhone.length < 10) {
        toast.error('Please enter a valid phone number (minimum 10 digits)');
        setIsUpdatingPhone(false);
        return false;
      }
      const formattedPhone = formatPhoneNumber(cleanedPhone);
      const response = await authService.updateProfile({ phone: formattedPhone });
      
      if (response?.success) {
        toast.success('Phone number updated successfully');
        await refreshUser();
        setPhoneNumber(formattedPhone);
        setPhoneUpdateSuccess(true);
        setIsEditingPhone(false);
        return true;
      } else {
        toast.error(response?.message || 'Failed to update phone');
        return false;
      }
    } catch (error) {
      console.error('Error updating phone:', error);
      toast.error(error.message || 'Failed to update phone number');
      return false;
    } finally {
      setIsUpdatingPhone(false);
    }
  };

  // ✅ Modified: Handle payment initiation with resume support
  const handlePaymentInit = async () => {
    try {
      // If in resume mode, just open the modal
      if (isResumeMode && pendingSubscriber) {
        setShowPaymentModal(true);
        setPaymentStep(1);
        toast.success('Complete your pending payment');
        return;
      }

      // Check if user already has an active subscription
      if (hasActiveSubscription && activeSubscription) {
        const now = new Date();
        const endDate = new Date(activeSubscription.endDate);
        
        if (endDate > now) {
          toast.error(
            `You already have an active subscription (${activeSubscription.planName}) until ${endDate.toLocaleDateString()}. You can purchase a new plan after it expires.`,
            { duration: 5000 }
          );
          return;
        }
      }

      // Validate phone and email
      let rawPhone = phoneNumber || user?.phone || user?.mobile || '';
      const cleanedPhone = rawPhone.replace(/\D/g, '');
      if (cleanedPhone.length < 10) {
        toast.error('Please enter a valid phone number (minimum 10 digits)');
        return;
      }
      const userEmail = emailAddress || user?.email || '';
      if (!userEmail || !userEmail.includes('@') || !userEmail.includes('.')) {
        toast.error('Please add a valid email address');
        return;
      }

      setProcessing(true);

      // Create subscriber record
      const response = await authService.createSubscriber({
        subscriptionId: id,
        phone: formatPhoneNumber(cleanedPhone),
        email: userEmail
      });

      if (response?.success) {
        setSubscriberId(response.subscriberId);
        setShowPaymentModal(true);
        setPaymentStep(1);
        toast.success('Please complete the payment');
      } else {
        if (response?.message?.includes('already have an active subscription')) {
          toast.error(response.message, { duration: 5000 });
          await refreshUser();
        } else {
          toast.error(response?.message || 'Failed to initiate payment');
        }
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      if (error.message?.includes('active subscription')) {
        toast.error(error.message, { duration: 5000 });
        await refreshUser();
      } else {
        toast.error(error.message || 'Payment initiation failed');
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    toast.success('UPI ID copied to clipboard');
  };

  const handleNextStep = () => {
    if (paymentStep === 1) {
      setPaymentStep(2);
    } else if (paymentStep === 2) {
      if (!transactionId.trim()) {
        toast.error('Please enter transaction ID');
        return;
      }
      setPaymentStep(3);
    }
  };

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        toast.error('Please upload a JPEG or PNG image');
        return;
      }
      setReceiptImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setReceiptPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPayment = async () => {
    try {
      setIsSubmitting(true);

      if (!transactionId.trim()) {
        toast.error('Please enter transaction ID');
        setIsSubmitting(false);
        return;
      }

      if (!receiptImage) {
        toast.error('Please upload payment receipt');
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('subscriberId', subscriberId);
      formData.append('transactionId', transactionId);
      formData.append('receipt', receiptImage);

      const response = await authService.submitPaymentProof(formData);

      if (response?.success) {
        toast.success('Payment proof submitted successfully! Admin will verify it.');
        setShowPaymentModal(false);
        setPaymentStep(1);
        setTransactionId('');
        setReceiptImage(null);
        setReceiptPreview(null);
        await refreshUser();
        navigate('/subscription');
      } else {
        toast.error(response?.message || 'Failed to submit payment proof');
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error(error.message || 'Failed to submit payment proof');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateDiscount = (price, sellingPrice) => {
    if (!price || !sellingPrice || price <= sellingPrice) return 0;
    return Math.round(((price - sellingPrice) / price) * 100);
  };

  const getUserPhone = () => {
    const phone = phoneNumber || user?.phone || user?.mobile || user?.phoneNumber || '';
    return phone;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getRemainingDays = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Loading State
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0505] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#c8963e] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-[#d4b8a0] font-medium">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !plan) {
    return (
      <div className="min-h-screen bg-[#0a0505] flex items-center justify-center p-6">
        <div className="bg-[#1a0a0a]/80 backdrop-blur-xl rounded-2xl p-12 max-w-md w-full border border-[#c8963e]/20 shadow-2xl text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#f5e6d3] mb-2">Unable to Load Checkout</h3>
          <p className="text-[#d4b8a0] mb-6">{error || 'Plan not found'}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setError(null);
                fetchPlanDetails();
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#c8963e] to-[#d4a85a] hover:from-[#b8860b] hover:to-[#c8963e] text-[#0a0505] font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#c8963e]/30"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/subscription')}
              className="w-full px-6 py-3 bg-[#1a0a0a]/50 border border-[#c8963e]/20 text-[#d4b8a0] font-semibold rounded-xl transition-all duration-300 hover:bg-[#1a0a0a]"
            >
              Back to Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  const discount = calculateDiscount(plan.price, plan.sellingPrice);
  const userName = user?.fullName || user?.name || 'User';
  const currentPhone = getUserPhone();
  const currentEmail = emailAddress || user?.email || '';
  const phoneValid = isValidPhone(currentPhone);
  const emailValid = isValidEmail(currentEmail);

  return (
    <>
      <div className="min-h-screen bg-[#0a0505] relative overflow-hidden py-8 sm:py-12">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                        w-[600px] h-[600px] rounded-full 
                        bg-gradient-to-r from-[#8b0000]/15 via-[#4a0000]/10 to-transparent
                        blur-3xl" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] 
                        bg-gradient-to-bl from-[#8b0000]/20 to-transparent 
                        rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] 
                        bg-gradient-to-tr from-[#6b0000]/15 to-transparent 
                        rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          {/* Back Button */}
          <button
            onClick={() => navigate('/subscription')}
            className="flex items-center gap-2 text-[#d4b8a0] hover:text-[#d4a85a] transition-colors mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Plans</span>
          </button>

          {/* ✅ NEW: Resume Payment Banner */}
          {isResumeMode && pendingSubscriber && (
            <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[#f5e6d3] font-semibold">Resuming Pending Payment</p>
                  <p className="text-[#d4b8a0] text-sm">
                    You have a pending payment of <span className="text-yellow-500 font-medium">₹{pendingSubscriber.sellingPrice || pendingSubscriber.price}</span> for <span className="text-[#d4a85a] font-medium">{pendingSubscriber.planName}</span>
                  </p>
                  <p className="text-[#d4b8a0] text-xs mt-1">
                    Created on {formatDate(pendingSubscriber.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Active Subscription Warning */}
          {hasActiveSubscription && activeSubscription && (
            <div className="mb-6 bg-[#c8963e]/10 border border-[#c8963e]/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#c8963e] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#f5e6d3] font-semibold">You already have an active subscription!</p>
                  <p className="text-[#d4b8a0] text-sm">
                    You are currently subscribed to <span className="text-[#d4a85a] font-medium">{activeSubscription.planName}</span>
                    {' '}until {formatDate(activeSubscription.endDate)} 
                    {' '}({getRemainingDays(activeSubscription.endDate)} days remaining).
                  </p>
                  <p className="text-[#d4b8a0] text-sm mt-1">
                    You can purchase a new plan only after your current subscription expires.
                  </p>
                  <button
                    onClick={() => navigate('/subscription')}
                    className="mt-2 text-[#c8963e] hover:text-[#d4a85a] text-sm font-medium transition-colors"
                  >
                    View My Subscriptions →
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Plan Details */}
            <div>
              <div className="bg-[#1a0a0a]/60 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-[#c8963e]/20 shadow-xl">
                <h2 className="text-2xl font-bold text-[#f5e6d3] mb-6">Order Summary</h2>
                
                {/* Plan Card */}
                <div className="bg-[#0a0505]/50 rounded-xl p-6 border border-[#c8963e]/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#c8963e]/10 border border-[#c8963e]/20 flex items-center justify-center text-2xl">
                      {plan.icon || '📚'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#f5e6d3]">{plan.title}</h3>
                      <div className="flex items-center gap-2">
                        {plan.price > plan.sellingPrice && (
                          <span className="text-sm text-[#d4b8a0]/50 line-through">
                            ₹{plan.price}
                          </span>
                        )}
                        <span className="text-xl font-bold text-[#d4a85a]">
                          ₹{plan.sellingPrice}
                        </span>
                        {discount > 0 && (
                          <span className="text-xs bg-[#4ade80]/20 text-[#4ade80] px-2 py-0.5 rounded-full">
                            {discount}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Validity */}
                  <div className="flex items-center gap-2 text-sm text-[#d4b8a0] mb-3">
                    <Clock className="w-4 h-4 text-[#d4a85a]" />
                    <span>Valid for {plan.validity?.value} {plan.validity?.unit}{plan.validity?.value > 1 ? 's' : ''}</span>
                  </div>

                  {/* Features */}
                  {plan.features?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-[#d4b8a0]/60">What's included:</p>
                      <ul className="space-y-1.5">
                        {plan.features.slice(0, 5).map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-[#d4b8a0]">
                            <Check className="w-4 h-4 text-[#d4a85a] flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                        {plan.features.length > 5 && (
                          <li className="text-xs text-[#d4b8a0]/60 pl-6">
                            +{plan.features.length - 5} more features
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between text-[#d4b8a0] text-sm">
                    <span>Subtotal</span>
                    <span>₹{plan.price}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[#4ade80] text-sm">
                      <span>Discount</span>
                      <span>-₹{plan.price - plan.sellingPrice}</span>
                    </div>
                  )}
                  <div className="border-t border-[#c8963e]/10 pt-3 flex justify-between font-bold text-[#f5e6d3] text-lg">
                    <span>Total</span>
                    <span className="text-[#d4a85a]">₹{plan.sellingPrice}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Payment */}
            <div>
              <div className="bg-[#1a0a0a]/60 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-[#c8963e]/20 shadow-xl sticky top-8">
                <h2 className="text-2xl font-bold text-[#f5e6d3] mb-6">
                  {isResumeMode ? 'Complete Payment' : 'Payment Details'}
                </h2>

                {/* User Info with Editable Phone */}
                <div className="bg-[#0a0505]/50 rounded-xl p-4 mb-6 border border-[#c8963e]/10">
                  <p className="text-xs text-[#d4b8a0]/60 mb-3 flex items-center gap-2">
                    <User className="w-3 h-3" />
                    Contact Details
                  </p>
                  
                  {/* Name */}
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-[#d4b8a0]/40" />
                    <div>
                      <p className="text-[#f5e6d3] font-medium text-sm">{userName}</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="w-4 h-4 text-[#d4b8a0]/40" />
                    <div className="flex-1">
                      {user?.email ? (
                        <p className="text-[#d4b8a0] text-sm">{user.email}</p>
                      ) : (
                        <input
                          type="email"
                          value={emailAddress}
                          onChange={(e) => setEmailAddress(e.target.value)}
                          placeholder="Enter your email"
                          className="w-full bg-[#0a0505] border border-[#c8963e]/20 rounded-lg px-3 py-1.5 text-[#f5e6d3] text-sm focus:outline-none focus:border-[#c8963e]"
                        />
                      )}
                    </div>
                    {!user?.email && (
                      <span className="text-[#c8963e] text-xs">Required</span>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-[#d4b8a0]/40 mt-2" />
                    <div className="flex-1">
                      {isEditingPhone ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="tel"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                              placeholder="Enter 10-digit phone number"
                              className="flex-1 bg-[#0a0505] border border-[#c8963e]/20 rounded-lg px-3 py-2 text-[#f5e6d3] text-sm focus:outline-none focus:border-[#c8963e]"
                              maxLength="15"
                              autoFocus
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={updateUserPhone}
                              disabled={isUpdatingPhone}
                              className="px-4 py-1.5 bg-gradient-to-r from-[#c8963e] to-[#d4a85a] text-[#0a0505] rounded-lg text-xs font-semibold hover:from-[#b8860b] hover:to-[#c8963e] transition-all duration-300 disabled:opacity-50"
                            >
                              {isUpdatingPhone ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => {
                                setPhoneNumber(user?.phone || user?.mobile || '');
                                setIsEditingPhone(false);
                              }}
                              className="px-4 py-1.5 bg-[#1a0a0a] border border-[#c8963e]/20 text-[#d4b8a0] rounded-lg text-xs hover:bg-[#1a0a0a]/80 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                          <p className="text-[#d4b8a0]/40 text-xs">Enter 10-digit phone number</p>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            {currentPhone ? (
                              <p className="text-[#d4b8a0] text-sm">{currentPhone}</p>
                            ) : (
                              <p className="text-[#c8963e] text-sm">No phone number added</p>
                            )}
                            {phoneUpdateSuccess && (
                              <p className="text-[#4ade80] text-xs">✓ Phone updated successfully</p>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setPhoneNumber(currentPhone);
                              setIsEditingPhone(true);
                              setPhoneUpdateSuccess(false);
                            }}
                            className="text-[#c8963e] text-xs hover:text-[#d4a85a] transition-colors flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            {currentPhone ? 'Change' : 'Add'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ✅ Modified: Pay Button with Resume Mode support */}
                <button
                  onClick={handlePaymentInit}
                  disabled={processing || !phoneValid || !emailValid || hasActiveSubscription}
                  className={`w-full py-4 text-lg font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg
                    ${(!phoneValid || !emailValid || hasActiveSubscription)
                      ? 'bg-[#1a0a0a] border border-[#c8963e]/20 text-[#d4b8a0]/50 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-[#c8963e] to-[#d4a85a] hover:from-[#b8860b] hover:to-[#c8963e] text-[#0a0505] hover:shadow-[#c8963e]/30'
                    }`}
                >
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </span>
                  ) : hasActiveSubscription ? (
                    <span className="flex items-center justify-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Already Subscribed
                    </span>
                  ) : isResumeMode ? (
                    <span className="flex items-center justify-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Resume Payment
                    </span>
                  ) : !phoneValid ? (
                    <span className="flex items-center justify-center gap-2">
                      <Phone className="w-5 h-5" />
                      Add Phone Number
                    </span>
                  ) : !emailValid ? (
                    <span className="flex items-center justify-center gap-2">
                      <Mail className="w-5 h-5" />
                      Add Email Address
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Pay ₹{plan.sellingPrice}
                    </span>
                  )}
                </button>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 mt-4 text-[#d4b8a0]/40 text-xs">
                  <Lock className="w-3 h-3" />
                  <span>Your payment is secure and encrypted</span>
                </div>

                {/* Terms */}
                <p className="text-[#8b6b5a] text-xs text-center mt-3">
                  By proceeding, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a0a0a] rounded-2xl max-w-lg w-full border border-[#c8963e]/20 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#c8963e]/10 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#f5e6d3]">
                {paymentStep === 1 && 'Pay with UPI'}
                {paymentStep === 2 && 'Enter Transaction ID'}
                {paymentStep === 3 && 'Upload Payment Receipt'}
              </h3>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentStep(1);
                  setTransactionId('');
                  setReceiptImage(null);
                  setReceiptPreview(null);
                }}
                className="text-[#d4b8a0] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Step 1: QR Code */}
              {paymentStep === 1 && (
                <div className="text-center">
                  <div className="mb-4">
                    <div className="inline-block p-4 bg-white rounded-xl">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${upiId}`}
                        alt="UPI QR Code"
                        className="w-48 h-48 mx-auto"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-[#d4b8a0] text-sm mb-2">Pay using any UPI app</p>
                    <div className="flex items-center justify-center gap-2 bg-[#0a0505] rounded-lg p-3 border border-[#c8963e]/20">
                      <span className="text-[#f5e6d3] font-mono">{upiId}</span>
                      <button
                        onClick={handleCopyUpi}
                        className="text-[#c8963e] hover:text-[#d4a85a] transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="bg-[#c8963e]/10 rounded-lg p-3 mb-4 border border-[#c8963e]/20">
                    <p className="text-[#d4b8a0] text-xs">
                      Amount: <span className="text-[#d4a85a] font-bold">₹{plan.sellingPrice}</span>
                    </p>
                  </div>
                  <button
                    onClick={handleNextStep}
                    className="w-full py-3 bg-gradient-to-r from-[#c8963e] to-[#d4a85a] text-[#0a0505] font-semibold rounded-xl hover:from-[#b8860b] hover:to-[#c8963e] transition-all duration-300"
                  >
                    I've Made the Payment →
                  </button>
                </div>
              )}

              {/* Step 2: Transaction ID */}
              {paymentStep === 2 && (
                <div>
                  <p className="text-[#d4b8a0] text-sm mb-4">
                    Enter the transaction ID from your UPI app
                  </p>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction ID"
                    className="w-full bg-[#0a0505] border border-[#c8963e]/20 rounded-xl px-4 py-3 text-[#f5e6d3] placeholder-[#d4b8a0]/40 focus:outline-none focus:border-[#c8963e] transition-colors"
                  />
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setPaymentStep(1)}
                      className="flex-1 py-3 bg-[#1a0a0a] border border-[#c8963e]/20 text-[#d4b8a0] rounded-xl hover:bg-[#1a0a0a]/80 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="flex-1 py-3 bg-gradient-to-r from-[#c8963e] to-[#d4a85a] text-[#0a0505] font-semibold rounded-xl hover:from-[#b8860b] hover:to-[#c8963e] transition-all duration-300"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Upload Receipt */}
              {paymentStep === 3 && (
                <div>
                  <p className="text-[#d4b8a0] text-sm mb-4">
                    Upload a screenshot or photo of the payment receipt
                  </p>
                  <div className="mb-4">
                    {receiptPreview ? (
                      <div className="relative">
                        <img
                          src={receiptPreview}
                          alt="Receipt preview"
                          className="w-full max-h-64 object-contain rounded-xl"
                        />
                        <button
                          onClick={() => {
                            setReceiptImage(null);
                            setReceiptPreview(null);
                          }}
                          className="absolute top-2 right-2 bg-red-500/80 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[#c8963e]/20 rounded-xl cursor-pointer hover:border-[#c8963e] transition-colors bg-[#0a0505]">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-10 h-10 text-[#d4b8a0]/40 mb-2" />
                          <p className="text-sm text-[#d4b8a0]">
                            Click to upload receipt
                          </p>
                          <p className="text-xs text-[#d4b8a0]/40">
                            PNG, JPG (Max 5MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/jpeg,image/png,image/jpg"
                          onChange={handleReceiptUpload}
                        />
                      </label>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setPaymentStep(2)}
                      className="flex-1 py-3 bg-[#1a0a0a] border border-[#c8963e]/20 text-[#d4b8a0] rounded-xl hover:bg-[#1a0a0a]/80 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmitPayment}
                      disabled={isSubmitting || !receiptImage}
                      className="flex-1 py-3 bg-gradient-to-r from-[#c8963e] to-[#d4a85a] text-[#0a0505] font-semibold rounded-xl hover:from-[#b8860b] hover:to-[#c8963e] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting...
                        </span>
                      ) : (
                        'Submit Payment'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Checkout;