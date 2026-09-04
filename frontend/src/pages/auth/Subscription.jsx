// Subscription.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, Crown, Sparkles, Zap, Star, Shield, Users, BookOpen, Award, 
  IndianRupee, Calendar, Tag, Info, FileText, List, X, User, Mail, Phone, 
  Edit2, LogIn, ShoppingBag, Clock, AlertCircle
} from 'lucide-react';
import MainButton from '../../components/style/MainButton';
import { useAuth } from '../../context/authContext';
import authService from '../../services/auth.service';
import toast from 'react-hot-toast';

const Subscription = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading, refreshUser } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSubscription, setActiveSubscription] = useState(null);

  useEffect(() => {
    fetchActiveSubscriptions();
    fetchUserActiveSubscription();
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserActiveSubscription();
    }
  }, [isAuthenticated, user]);

  const fetchActiveSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.activeSubscription();
      
      const subscriptionData = response?.subscriptions || [];
      setSubscriptions(subscriptionData);
      
      if (subscriptionData.length === 0) {
        toast('No active subscriptions available', {
          icon: 'ℹ️',
          duration: 4000,
          style: {
            background: '#1a0a0a',
            color: '#d4b8a0',
            border: '1px solid #c8963e/20',
          },
        });
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      setError(error.message || 'Failed to fetch subscriptions');
      toast.error(error.message || 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's active subscription using the new user model
  const fetchUserActiveSubscription = async () => {
    if (!isAuthenticated || !user) {
      setUserSubscriptions([]);
      setActiveSubscription(null);
      return;
    }

    try {
      setRefreshing(true);
      
      // First, check if user has active subscription from user object
      if (user.hasActiveSubscription && user.activeSubscriptionId) {
        // Fetch the full subscription details
        const response = await authService.getUserActiveSubscription();
        
        if (response?.success && response?.hasSubscription) {
          const sub = response.subscription;
          setActiveSubscription(sub);
          
          // Check if subscription is still valid
          const now = new Date();
          const endDate = new Date(sub.endDate);
          
          if (endDate > now && sub.subscriptionStatus === 'active') {
            setUserSubscriptions([sub]);
          } else {
            // If expired, update user
            setUserSubscriptions([]);
            setActiveSubscription(null);
            await refreshUser();
          }
        } else {
          setUserSubscriptions([]);
          setActiveSubscription(null);
        }
      } else {
        setUserSubscriptions([]);
        setActiveSubscription(null);
      }
    } catch (error) {
      console.error('Error fetching user active subscription:', error);
      setUserSubscriptions([]);
      setActiveSubscription(null);
    } finally {
      setRefreshing(false);
    }
  };

  // Get remaining days for subscription
  const getRemainingDays = (endDate) => {
    if (!endDate) return null;
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get icon based on subscription icon or use default
  const getIcon = (icon, title) => {
    if (icon) return icon;
    
    const titleLower = title?.toLowerCase() || '';
    if (titleLower.includes('basic')) return '📘';
    if (titleLower.includes('premium')) return '👑';
    if (titleLower.includes('elite')) return '✨';
    if (titleLower.includes('pro')) return '⚡';
    if (titleLower.includes('gold')) return '⭐';
    if (titleLower.includes('standard')) return '📚';
    if (titleLower.includes('advanced')) return '🚀';
    return '📚';
  };

  // Calculate discount percentage
  const calculateDiscount = (price, sellingPrice) => {
    if (!price || !sellingPrice || price <= sellingPrice) return 0;
    return Math.round(((price - sellingPrice) / price) * 100);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Handle Get Started button click
  const handleGetStarted = (planId) => {
    if (!isAuthenticated) {
      toast('Please sign in to continue', {
        icon: '🔐',
        duration: 3000,
      });
      navigate('/auth/signin');
      return;
    }

    // Check if user already has active subscription
    if (user?.hasActiveSubscription && activeSubscription) {
      const remainingDays = getRemainingDays(activeSubscription.endDate);
      if (remainingDays > 0) {
        toast.error(
          `You already have an active subscription (${activeSubscription.planName}) with ${remainingDays} days remaining.`,
          { duration: 5000 }
        );
        return;
      }
    }

    if (!user?.phone) {
      toast('Please add your phone number to continue', {
        icon: '📱',
        duration: 4000,
      });
      navigate('/profile');
      return;
    }

    navigate(`/checkout/${planId}`);
  };

  // Get button text based on auth state
  const getButtonText = () => {
    if (!isAuthenticated) return 'Login to Subscribe';
    if (!user?.phone) return 'Add Phone to Subscribe';
    if (user?.hasActiveSubscription && activeSubscription) {
      const remainingDays = getRemainingDays(activeSubscription.endDate);
      if (remainingDays > 0) return 'Already Subscribed';
    }
    return 'Get Started';
  };

  // Get button icon based on auth state
  const getButtonIcon = () => {
    if (!isAuthenticated) return <LogIn className="w-4 h-4" />;
    if (!user?.phone) return <Phone className="w-4 h-4" />;
    if (user?.hasActiveSubscription && activeSubscription) {
      const remainingDays = getRemainingDays(activeSubscription.endDate);
      if (remainingDays > 0) return <Check className="w-4 h-4" />;
    }
    return <ShoppingBag className="w-4 h-4" />;
  };

  // Navigate to profile
  const handleEditProfile = () => {
    navigate('/profile');
  };

  // Format user name
  const getUserName = () => {
    if (!user) return 'Guest User';
    return user.fullName || user.name || user.username || 'User';
  };

  // Get user initial for avatar
  const getUserInitial = () => {
    const name = getUserName();
    return name.charAt(0).toUpperCase();
  };

  // Function to manually refresh subscriptions
  const handleRefreshSubscriptions = async () => {
    await refreshUser();
    await fetchActiveSubscriptions();
    await fetchUserActiveSubscription();
    toast.success('Subscriptions refreshed!');
  };

  // Loading State
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0a0505] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#c8963e] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-[#d4b8a0] font-medium">
            {authLoading ? 'Checking authentication...' : 'Loading subscriptions...'}
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0505] flex items-center justify-center p-6">
        <div className="bg-[#1a0a0a]/80 backdrop-blur-xl rounded-2xl p-12 max-w-md w-full border border-[#c8963e]/20 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <X className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-[#f5e6d3] mb-2">Unable to Load Plans</h3>
          <p className="text-[#d4b8a0] mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={fetchActiveSubscriptions}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#c8963e] to-[#d4a85a] hover:from-[#b8860b] hover:to-[#c8963e] text-[#0a0505] font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#c8963e]/30"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 bg-[#1a0a0a]/50 border border-[#c8963e]/20 text-[#d4b8a0] font-semibold rounded-xl transition-all duration-300 hover:bg-[#1a0a0a]"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAlreadySubscribed = user?.hasActiveSubscription && activeSubscription;
  const remainingDays = isAlreadySubscribed ? getRemainingDays(activeSubscription.endDate) : null;

  return (
    <div className="min-h-screen bg-[#0a0505] relative overflow-hidden">
      {/* Background Gradient Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                      w-[800px] h-[800px] rounded-full 
                      bg-gradient-to-r from-[#8b0000]/20 via-[#4a0000]/10 to-transparent
                      blur-3xl animate-pulse" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] 
                      bg-gradient-to-bl from-[#8b0000]/30 to-transparent 
                      rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] 
                      bg-gradient-to-tr from-[#6b0000]/20 to-transparent 
                      rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 
                      bg-[#c8963e]/5 rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 
                      bg-[#d4a85a]/5 rounded-full blur-2xl" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        
        {/* User Profile Card - Top Right */}
        <div className="flex justify-end mb-8">
          <div className="bg-[#1a0a0a]/60 backdrop-blur-xl rounded-2xl p-4 border border-[#c8963e]/20 shadow-xl hover:shadow-[#c8963e]/10 transition-all duration-300 max-w-xs w-full">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#c8963e] to-[#d4a85a] flex items-center justify-center text-[#0a0505] font-bold text-lg flex-shrink-0">
                {getUserInitial()}
              </div>
              
              {/* User Info */}
              <div className="flex-1 min-w-0">
                {isAuthenticated ? (
                  <>
                    <p className="text-[#f5e6d3] font-semibold text-sm truncate">
                      @{user?.username || user?.email?.split('@')[0] || 'user'}
                    </p>
                    <p className="text-[#d4b8a0] text-xs truncate">{user?.email || 'No email'}</p>
                    {user?.phone ? (
                      <p className="text-[#d4b8a0] text-xs">{user.phone}</p>
                    ) : (
                      <p className="text-[#c8963e] text-xs flex items-center gap-1">
                        <span>⚠️ Phone required</span>
                      </p>
                    )}
                    {isAlreadySubscribed && (
                      <p className="text-[#4ade80] text-xs flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Active: {activeSubscription.planName}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-[#f5e6d3] font-semibold text-sm">Guest User</p>
                    <p className="text-[#d4b8a0] text-xs">Please login to subscribe</p>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Refresh Button */}
                {isAuthenticated && (
                  <button
                    onClick={handleRefreshSubscriptions}
                    disabled={refreshing}
                    className="p-2 rounded-lg bg-[#c8963e]/10 hover:bg-[#c8963e]/20 border border-[#c8963e]/20 transition-all duration-300 hover:scale-105 flex-shrink-0"
                    title="Refresh Subscriptions"
                  >
                    <div className={`${refreshing ? 'animate-spin' : ''}`}>
                      <svg className="w-4 h-4 text-[#d4a85a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                  </button>
                )}
                
                <button
                  onClick={isAuthenticated ? handleEditProfile : () => navigate('/auth/signin')}
                  className="p-2 rounded-lg bg-[#c8963e]/10 hover:bg-[#c8963e]/20 border border-[#c8963e]/20 transition-all duration-300 hover:scale-105 flex-shrink-0"
                  title={isAuthenticated ? 'Edit Profile' : 'Login'}
                >
                  {isAuthenticated ? (
                    <Edit2 className="w-4 h-4 text-[#d4a85a]" />
                  ) : (
                    <LogIn className="w-4 h-4 text-[#d4a85a]" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User's Active Subscription Section */}
        {isAuthenticated && isAlreadySubscribed && (
          <div className="mb-12">
            <div className="bg-[#1a0a0a]/60 backdrop-blur-xl rounded-2xl p-6 border border-[#4ade80]/20 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#4ade80]/10 flex items-center justify-center">
                  <Check className="w-5 h-5 text-[#4ade80]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#f5e6d3]">Your Active Subscription</h2>
                  <p className="text-[#d4b8a0] text-sm">You have an active subscription</p>
                </div>
              </div>
              
              <div className="bg-[#0a0505]/50 rounded-xl p-4 border border-[#4ade80]/10">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[#f5e6d3] font-semibold text-lg">{activeSubscription.planName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3 text-[#d4b8a0]/40" />
                      <span className="text-[#d4b8a0] text-xs">
                        {formatDate(activeSubscription.startDate)} - {formatDate(activeSubscription.endDate)}
                      </span>
                    </div>
                    {activeSubscription.paymentStatus === 'review' && (
                      <p className="text-yellow-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Payment is under review by admin
                      </p>
                    )}
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                    remainingDays <= 7 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/20' 
                      : 'bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/20'
                  }`}>
                    {remainingDays <= 7 ? `${remainingDays} days left` : `${remainingDays} days remaining`}
                  </div>
                </div>
                <div>
                  <p className="text-[#d4b8a0] text-sm mt-2">
                  Paid: <span className='font-bold'>₹{activeSubscription.sellingPrice} </span> 
                    </p>
                </div>
                <div className="mt-3 w-full bg-[#1a0a0a] rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      remainingDays <= 7 ? 'bg-red-500' : 'bg-[#4ade80]'
                    }`}
                    style={{ 
                      width: `${Math.max(0, Math.min(100, (remainingDays / 30) * 100))}%` 
                    }}
                  />
                </div>
                {remainingDays <= 7 && (
                  <p className="mt-2 text-red-400 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Your subscription is expiring soon! Renew now.
                  </p>
                )}
                <button
                  onClick={() => navigate('/orders')}
                  className="mt-3 text-[#4ade80] text-sm hover:underline flex items-center gap-1"
                >
                  View Details →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No Active Subscriptions Message */}
        {isAuthenticated && !isAlreadySubscribed && (
          <div className="mb-12">
            <div className="bg-[#1a0a0a]/40 backdrop-blur-xl rounded-2xl p-6 border border-[#c8963e]/20 shadow-xl text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#c8963e]/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#d4a85a]" />
                </div>
                <h2 className="text-lg font-bold text-[#f5e6d3]">No Active Subscriptions</h2>
              </div>
              <p className="text-[#d4b8a0] text-sm">
                You don't have any active subscriptions. Choose a plan below to get started!
              </p>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="inline-block mb-4">
            <span className="px-4 py-1.5 rounded-full bg-[#c8963e]/10 border border-[#c8963e]/20 
                           text-[#d4a85a] text-xs sm:text-sm font-semibold tracking-wider uppercase
                           backdrop-blur-sm">
              EDURARY Premium
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-[#d4a85a] via-[#e8c87a] to-[#d4a85a] 
                           bg-clip-text text-transparent">
              Choose Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#f5e6d3] via-[#e8c87a] to-[#d4a85a] 
                           bg-clip-text text-transparent">
              Learning Path
            </span>
          </h1>

          <p className="text-[#d4b8a0] text-base sm:text-lg max-w-2xl mx-auto">
            Unlock your full potential with our comprehensive learning plans. 
            Start your journey to mastery today.
          </p>
        </div>

        {/* Subscription Cards */}
        {subscriptions.length === 0 ? (
          <div className="bg-[#1a0a0a]/40 backdrop-blur-xl rounded-2xl p-16 text-center border border-[#c8963e]/20 shadow-xl">
            <BookOpen className="w-20 h-20 text-[#c8963e]/30 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-[#f5e6d3] mb-2">
              No Active Plans Available
            </h3>
            <p className="text-[#d4b8a0]">
              Please check back later for our subscription plans
            </p>
            <button
              onClick={fetchActiveSubscriptions}
              className="mt-6 px-6 py-2 bg-[#c8963e]/10 hover:bg-[#c8963e]/20 border border-[#c8963e]/20 text-[#d4a85a] rounded-xl transition-all duration-300"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {subscriptions.map((plan, index) => {
              const discount = calculateDiscount(plan.price, plan.sellingPrice);
              const iconEmoji = getIcon(plan.icon, plan.title);
              const isPlanActive = isAlreadySubscribed && activeSubscription?.subscriptionId?._id === plan._id;
              
              return (
                <div
                  key={plan._id}
                  className={`
                    relative group rounded-2xl p-6 sm:p-8
                    backdrop-blur-xl bg-[#1a0a0a]/40
                    border transition-all duration-500
                    ${isPlanActive 
                      ? 'border-[#4ade80]/60 shadow-[0_0_40px_rgba(74,222,128,0.15)]' 
                      : discount > 20 
                        ? 'border-[#c8963e]/40 shadow-[0_0_40px_rgba(200,150,62,0.1)] hover:shadow-[0_0_60px_rgba(200,150,62,0.2)]' 
                        : 'border-[#8b4513]/20 hover:border-[#c8963e]/20 shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_40px_rgba(200,150,62,0.05)]'
                    }
                    hover:-translate-y-2 hover:scale-[1.02]
                  `}
                >
                  {/* Glass reflection effect */}
                  <div className="absolute inset-0 rounded-2xl overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8963e]/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8963e]/20 to-transparent" />
                  </div>

                  {/* Best Value Badge */}
                  {discount > 30 && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                     bg-gradient-to-r from-[#c8963e] to-[#d4a85a] text-[#0a0505]
                                     shadow-[0_0_20px_rgba(200,150,62,0.3)]">
                        Best Value
                      </span>
                    </div>
                  )}

                  {/* Discount Badge */}
                  {discount > 0 && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-lg text-xs font-bold
                                     bg-red-500/20 text-red-400
                                     border border-red-500/20">
                        {discount}% OFF
                      </span>
                    </div>
                  )}

                  {/* Active Badge */}
                  {isPlanActive && (
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-lg text-xs font-bold
                                     bg-[#4ade80]/20 text-[#4ade80]
                                     border border-[#4ade80]/20 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Active
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl
                                  bg-[#c8963e]/10 border border-[#c8963e]/20
                                  text-[#d4a85a] mb-4 overflow-hidden">
                      {plan.icon && plan.icon.startsWith('http') ? (
                        <img 
                          src={plan.icon} 
                          alt={plan.title} 
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.textContent = iconEmoji;
                          }}
                        />
                      ) : (
                        <span className="text-2xl">{iconEmoji}</span>
                      )}
                    </div>

                    {/* Plan Name */}
                    <h3 className="text-xl sm:text-2xl font-bold text-[#f5e6d3] mb-2">
                      {plan.title}
                    </h3>

                    {/* Price */}
                    <div className="flex items-center justify-center gap-3">
                      {plan.price > plan.sellingPrice && (
                        <span className="text-lg text-[#d4b8a0]/50 line-through">
                          ₹{plan.price}
                        </span>
                      )}
                      <span className="text-3xl sm:text-4xl font-extrabold text-[#d4a85a]">
                        ₹{plan.sellingPrice}
                      </span>
                    </div>

                    {/* Validity */}
                    <div className="flex items-center justify-center gap-1 mt-2 text-sm text-[#d4b8a0]">
                      <Calendar className="w-4 h-4 text-[#d4a85a]" />
                      <span>Valid for {plan.validity?.value} {plan.validity?.unit}{plan.validity?.value > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* Features List */}
                  {plan.features?.length > 0 && (
                    <ul className="space-y-3 mb-6">
                      {plan.features.slice(0, 8).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-[#d4b8a0] text-sm">
                          <Check className="w-4 h-4 text-[#d4a85a] flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {plan.features.length > 8 && (
                        <li className="text-xs text-[#d4b8a0]/60 pl-7">
                          +{plan.features.length - 8} more features
                        </li>
                      )}
                    </ul>
                  )}

                  {/* About */}
                  {plan.about && (
                    <div className="mb-6 p-3 bg-[#c8963e]/5 rounded-xl border border-[#c8963e]/10">
                      <p className="text-xs font-medium text-[#d4b8a0]/60 flex items-center gap-1.5 mb-1">
                        <Info className="w-3.5 h-3.5 text-[#d4a85a]" />
                        About this plan
                      </p>
                      <p className="text-sm text-[#d4b8a0] line-clamp-2">
                        {plan.about}
                      </p>
                    </div>
                  )}

                  {/* Terms & Conditions */}
                  {plan.termsAndConditions?.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs font-medium text-[#d4b8a0]/60 flex items-center gap-1.5 mb-2">
                        <FileText className="w-3.5 h-3.5 text-[#d4a85a]" />
                        Terms & Conditions
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {plan.termsAndConditions.slice(0, 3).map((term, idx) => (
                          <span key={idx} className="text-xs bg-[#c8963e]/5 text-[#d4b8a0] px-3 py-1.5 rounded-lg border border-[#c8963e]/10">
                            {term}
                          </span>
                        ))}
                        {plan.termsAndConditions.length > 3 && (
                          <span className="text-xs text-[#d4b8a0]/60 px-3 py-1.5">
                            +{plan.termsAndConditions.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Subscribe Button */}
                  <div className="text-center">
                    <MainButton
                      text={getButtonText()}
                      icon={getButtonIcon()}
                      size="default"
                      variant={isPlanActive ? 'success' : discount > 20 ? 'primary' : 'secondary'}
                      fullWidth
                      className="w-full"
                      onClick={() => handleGetStarted(plan._id)}
                      disabled={isPlanActive}
                    />
                    {isPlanActive && (
                      <p className="text-[#4ade80] text-xs mt-2">
                        ✓ You are currently subscribed to this plan
                      </p>
                    )}
                  </div>

                  {/* Footer Text */}
                  <p className="text-[#8b6b5a] text-xs text-center mt-4">
                    Cancel anytime • No hidden fees
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Trust Badges */}
        {subscriptions.length > 0 && (
          <div className="mt-16 sm:mt-20 text-center">
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
              <div className="flex items-center gap-2 text-[#8b6b5a] text-sm">
                <Users className="w-4 h-4 text-[#d4a85a]" />
                <span>10,000+ Students</span>
              </div>
              <div className="flex items-center gap-2 text-[#8b6b5a] text-sm">
                <Star className="w-4 h-4 text-[#d4a85a]" />
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2 text-[#8b6b5a] text-sm">
                <Shield className="w-4 h-4 text-[#d4a85a]" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-2 text-[#8b6b5a] text-sm">
                <Award className="w-4 h-4 text-[#d4a85a]" />
                <span>Certified Courses</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscription;