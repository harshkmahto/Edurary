// pages/user/MyOrders.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Calendar, Clock, CheckCircle, XCircle, AlertCircle, 
  CreditCard, FileText, Eye, Copy, ChevronDown, ChevronUp,
  TrendingUp, Award, Star, Package, Truck, DollarSign, 
  Calendar as CalendarIcon, User, Mail, Phone,
  Shield, BookOpen, Info, Loader2, Download
} from 'lucide-react';
import { useAuth } from '../../context/authContext';
import authService from '../../services/auth.service';
import toast from 'react-hot-toast';

// Import invoice generator
import { generateInvoicePDF } from '../../helper/generateInvoicePdf';

const MyOrders = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    pending: 0,
    cancelled: 0,
    terminated: 0,
    review: 0
  });

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      toast.error('Please login to view your orders');
      navigate('/auth/signin');
      return;
    }
    fetchSubscriptions();
    fetchActiveSubscription();
  }, [isAuthenticated, authLoading]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await authService.getUserSubscriptions();
      if (response?.success) {
        setSubscriptions(response.subscriptions || []);
        calculateStats(response.subscriptions || []);
      } else {
        toast.error(response?.message || 'Failed to fetch subscriptions');
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error(error.message || 'Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveSubscription = async () => {
    try {
      const response = await authService.getUserActiveSubscription();
      if (response?.success && response?.hasSubscription) {
        setActiveSubscription(response.subscription);
      } else {
        setActiveSubscription(null);
      }
    } catch (error) {
      console.error('Error fetching active subscription:', error);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const active = data.filter(s => s.subscriptionStatus === 'active').length;
    const expired = data.filter(s => s.subscriptionStatus === 'expired').length;
    const pending = data.filter(s => s.subscriptionStatus === 'pending').length;
    const review = data.filter(s => s.subscriptionStatus === 'review').length;
    const cancelled = data.filter(s => s.subscriptionStatus === 'cancelled').length;
    const terminated = data.filter(s => s.subscriptionStatus === 'terminated').length;
    
    setStats({ total, active, expired, pending, review, cancelled, terminated });
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSubscriptionStatusBadge = (status) => {
    const configs = {
      active: 'bg-[#4ade80]/20 text-[#4ade80] border-[#4ade80]/30',
      pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
      review: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
      expired: 'bg-red-500/20 text-red-500 border-red-500/30',
      cancelled: 'bg-gray-500/20 text-gray-500 border-gray-500/30',
      terminated: 'bg-red-700/20 text-red-700 border-red-700/30'
    };
    return configs[status] || configs.pending;
  };

  const getPaymentStatusBadge = (status) => {
    const configs = {
      pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
      review: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
      success: 'bg-[#4ade80]/20 text-[#4ade80] border-[#4ade80]/30',
      failed: 'bg-red-500/20 text-red-500 border-red-500/30'
    };
    return configs[status] || configs.pending;
  };

  const getSubscriptionStatusIcon = (status) => {
    const icons = {
      active: <CheckCircle className="w-4 h-4" />,
      pending: <Clock className="w-4 h-4" />,
      review: <AlertCircle className="w-4 h-4" />,
      expired: <XCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />,
      terminated: <XCircle className="w-4 h-4" />
    };
    return icons[status] || icons.pending;
  };

  const getPaymentStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      review: <AlertCircle className="w-4 h-4" />,
      success: <CheckCircle className="w-4 h-4" />,
      failed: <XCircle className="w-4 h-4" />
    };
    return icons[status] || icons.pending;
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const getRemainingDays = (endDate) => {
    if (!endDate) return null;
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleRefresh = async () => {
    setLoading(true);
    await refreshUser();
    await fetchSubscriptions();
    await fetchActiveSubscription();
    toast.success('Refreshed successfully');
    setLoading(false);
  };

  // Check if invoice can be downloaded
  const canDownloadInvoice = (sub) => {
    const paymentStatus = sub.paymentStatus || 'pending';
    // Only allow download if payment is success or failed (not pending or review)
    return paymentStatus === 'success' || paymentStatus === 'failed';
  };

  // Handle invoice download
  const handleDownloadInvoice = async (subscriberId) => {
    try {
      setDownloadingInvoice(subscriberId);
      
      // Fetch invoice data
      const response = await authService.getInvoice(subscriberId);
      
      if (response?.success && response?.data) {
        // Generate and download PDF
        await generateInvoicePDF(response.data);
        toast.success('Invoice downloaded successfully');
      } else {
        toast.error(response?.message || 'Failed to fetch invoice');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error(error.message || 'Failed to download invoice');
    } finally {
      setDownloadingInvoice(null);
    }
  };

  // Loading State
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0a0505] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#c8963e] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-[#d4b8a0] font-medium">
            {authLoading ? 'Checking authentication...' : 'Loading your orders...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0505] relative overflow-hidden py-8 sm:py-12">
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="px-4 py-1.5 rounded-full bg-[#c8963e]/10 border border-[#c8963e]/20 
                           text-[#d4a85a] text-xs sm:text-sm font-semibold tracking-wider uppercase
                           backdrop-blur-sm">
              My Orders
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#f5e6d3]">
            Your <span className="text-[#d4a85a]">Subscriptions</span>
          </h1>
          <p className="mt-2 text-[#d4b8a0]">
            Track and manage all your learning subscriptions
          </p>
          <button
            onClick={handleRefresh}
            className="mt-4 text-[#d4a85a] text-sm hover:underline flex items-center gap-1 mx-auto"
          >
            <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Active Subscription Banner */}
        {activeSubscription && (
          <div className="mb-8 bg-[#4ade80]/10 border border-[#4ade80]/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#4ade80] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[#f5e6d3] font-semibold">Active Subscription</p>
                <p className="text-[#d4b8a0] text-sm">
                  You are currently subscribed to <span className="text-[#4ade80] font-medium">{activeSubscription.planName}</span>
                  {' '}until {formatDate(activeSubscription.endDate)}
                  {' '}({getRemainingDays(activeSubscription.endDate)} days remaining)
                </p>
                {activeSubscription.paymentStatus === 'review' && (
                  <p className="text-yellow-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Payment is under review by admin
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <div className="bg-[#1a0a0a]/60 backdrop-blur-xl rounded-xl p-4 border border-[#c8963e]/20 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#c8963e]/10 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-[#d4a85a]" />
              </div>
              <div>
                <p className="text-xs text-[#d4b8a0]">Total</p>
                <p className="text-2xl font-bold text-[#f5e6d3]">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a0a0a]/60 backdrop-blur-xl rounded-xl p-4 border border-[#4ade80]/20 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#4ade80]/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-[#4ade80]" />
              </div>
              <div>
                <p className="text-xs text-[#d4b8a0]">Active</p>
                <p className="text-2xl font-bold text-[#4ade80]">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a0a0a]/60 backdrop-blur-xl rounded-xl p-4 border border-purple-500/20 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-[#d4b8a0]">Review</p>
                <p className="text-2xl font-bold text-purple-500">{stats.review}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a0a0a]/60 backdrop-blur-xl rounded-xl p-4 border border-yellow-500/20 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-xs text-[#d4b8a0]">Pending</p>
                <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a0a0a]/60 backdrop-blur-xl rounded-xl p-4 border border-red-500/20 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-[#d4b8a0]">Expired</p>
                <p className="text-2xl font-bold text-red-500">{stats.expired}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a0a0a]/60 backdrop-blur-xl rounded-xl p-4 border border-gray-500/20 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-500/10 rounded-lg">
                <XCircle className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-[#d4b8a0]">Cancelled</p>
                <p className="text-2xl font-bold text-gray-500">{stats.cancelled + stats.terminated}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscriptions List */}
        {subscriptions.length === 0 ? (
          <div className="bg-[#1a0a0a]/40 backdrop-blur-xl rounded-2xl p-16 text-center border border-[#c8963e]/20 shadow-xl">
            <BookOpen className="w-20 h-20 text-[#c8963e]/30 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-[#f5e6d3] mb-2">
              No Orders Yet
            </h3>
            <p className="text-[#d4b8a0]">
              You haven't purchased any subscription yet
            </p>
            <button
              onClick={() => navigate('/subscription')}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-[#c8963e] to-[#d4a85a] hover:from-[#b8860b] hover:to-[#c8963e] text-[#0a0505] font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#c8963e]/30"
            >
              Browse Plans
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((sub) => {
              const isExpanded = expandedId === sub._id;
              const subStatus = sub.subscriptionStatus || 'pending';
              const paymentStatus = sub.paymentStatus || 'pending';
              const userData = sub.userId || {};
              const remainingDays = getRemainingDays(sub.endDate);
              const isActive = subStatus === 'active';
              const invoiceAvailable = canDownloadInvoice(sub);
              
              return (
                <div 
                  key={sub._id}
                  className={`bg-[#1a0a0a]/60 backdrop-blur-xl rounded-xl border shadow-sm hover:shadow-[#c8963e]/10 transition-all duration-300 overflow-hidden
                    ${isActive ? 'border-[#4ade80]/30' : 'border-[#c8963e]/20'}`}
                >
                  {/* Card Header - Always Visible */}
                  <div 
                    className="p-4 sm:p-6 cursor-pointer hover:bg-[#c8963e]/5 transition-colors"
                    onClick={() => toggleExpand(sub._id)}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-[#c8963e]/10 border border-[#c8963e]/20 flex items-center justify-center text-2xl flex-shrink-0">
                          {sub.subscriptionId?.icon || '📚'}
                        </div>
                        
                        <div className="min-w-0">
                          <h4 className="font-semibold text-[#f5e6d3] truncate">
                            {sub.planName}
                          </h4>
                          <p className="text-sm text-[#d4b8a0] flex items-center gap-2">
                            <span>₹{sub.sellingPrice || sub.price}</span>
                            <span className="w-px h-3 bg-[#c8963e]/30"></span>
                            <span>{sub.validity?.value} {sub.validity?.unit}{sub.validity?.value > 1 ? 's' : ''}</span>
                            {remainingDays !== null && remainingDays > 0 && isActive && (
                              <>
                                <span className="w-px h-3 bg-[#c8963e]/30"></span>
                                <span className="text-[#4ade80]">{remainingDays} days left</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getSubscriptionStatusBadge(subStatus)}`}>
                          {getSubscriptionStatusIcon(subStatus)}
                          {getStatusLabel(subStatus)}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getPaymentStatusBadge(paymentStatus)}`}>
                          {getPaymentStatusIcon(paymentStatus)}
                          {getStatusLabel(paymentStatus)}
                        </span>
                        <button className="p-1 hover:bg-[#c8963e]/10 rounded-lg transition-colors">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-[#d4b8a0]" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-[#d4b8a0]" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="p-4 sm:p-6 pt-0 border-t border-[#c8963e]/10 space-y-4">
                      {/* User Info */}
                      <div className="bg-[#0a0505]/50 rounded-xl p-4 border border-[#c8963e]/10">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#c8963e] to-[#d4a85a] flex items-center justify-center text-[#0a0505] font-bold text-sm">
                            {userData.name?.charAt(0) || user?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-[#f5e6d3]">
                              {userData.name || user?.name || 'Unknown User'}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-[#d4b8a0]">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {userData.email || user?.email || 'No email'}
                              </span>
                              <span className="w-px h-3 bg-[#c8963e]/30"></span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {userData.phone || user?.phone || 'No phone'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Subscription Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-[#0a0505]/50 rounded-xl p-4 border border-[#c8963e]/10">
                          <h5 className="text-xs font-semibold text-[#d4b8a0]/60 uppercase tracking-wider flex items-center gap-2 mb-3">
                            <CalendarIcon className="w-3.5 h-3.5 text-[#d4a85a]" />
                            Subscription Details
                          </h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-[#d4b8a0]">Plan</span>
                              <span className="font-medium text-[#f5e6d3]">{sub.planName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#d4b8a0]">Amount</span>
                              <span className="font-medium text-[#d4a85a]">₹{sub.sellingPrice || sub.price}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#d4b8a0]">Purchased</span>
                              <span className="font-medium text-[#f5e6d3]">{formatDateTime(sub.createdAt)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#d4b8a0]">Status</span>
                              <span className={`font-medium flex items-center gap-1.5 ${getSubscriptionStatusBadge(subStatus)} px-2 py-0.5 rounded-full text-xs border`}>
                                {getSubscriptionStatusIcon(subStatus)}
                                {getStatusLabel(subStatus)}
                              </span>
                            </div>
                            {sub.statusReason && (
                              <div className="mt-2 p-2 bg-[#c8963e]/5 rounded-lg border border-[#c8963e]/10">
                                <p className="text-xs text-[#d4b8a0]/60 flex items-center gap-1">
                                  <Info className="w-3 h-3 text-[#d4a85a]" />
                                  Reason: <span className="text-[#d4b8a0]">{sub.statusReason}</span>
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-[#0a0505]/50 rounded-xl p-4 border border-[#c8963e]/10">
                          <h5 className="text-xs font-semibold text-[#d4b8a0]/60 uppercase tracking-wider flex items-center gap-2 mb-3">
                            <Clock className="w-3.5 h-3.5 text-[#d4a85a]" />
                            Validity
                          </h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-[#d4b8a0]">Start Date</span>
                              <span className="font-medium text-[#f5e6d3]">{formatDate(sub.startDate)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#d4b8a0]">End Date</span>
                              <span className="font-medium text-[#f5e6d3]">{formatDate(sub.endDate)}</span>
                            </div>
                            {remainingDays !== null && (
                              <div className="pt-2 border-t border-[#c8963e]/10">
                                <div className="flex justify-between">
                                  <span className="text-[#d4b8a0]">Remaining</span>
                                  <span className={`font-medium ${remainingDays > 7 ? 'text-[#4ade80]' : 'text-red-500'}`}>
                                    {remainingDays > 0 ? `${remainingDays} days` : 'Expired'}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Payment Details */}
                      <div className="bg-[#0a0505]/50 rounded-xl p-4 border border-[#c8963e]/10">
                        <h5 className="text-xs font-semibold text-[#d4b8a0]/60 uppercase tracking-wider flex items-center gap-2 mb-3">
                          <CreditCard className="w-3.5 h-3.5 text-[#d4a85a]" />
                          Payment Details
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-[#d4b8a0]">Transaction ID</span>
                            <p className="font-mono text-xs text-[#f5e6d3] bg-[#0a0505] px-2 py-1 rounded border border-[#c8963e]/10 mt-1 flex items-center justify-between">
                              {sub.transactionId || 'N/A'}
                              {sub.transactionId && (
                                <button 
                                  onClick={() => copyToClipboard(sub.transactionId, 'Transaction ID')}
                                  className="text-[#d4a85a] hover:opacity-70"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              )}
                            </p>
                          </div>
                          <div>
                            <span className="text-[#d4b8a0]">Payment Status</span>
                            <p className={`mt-1 font-medium flex items-center gap-1.5 ${getPaymentStatusBadge(paymentStatus)} px-2 py-0.5 rounded-full text-xs border inline-flex`}>
                              {getPaymentStatusIcon(paymentStatus)}
                              {getStatusLabel(paymentStatus)}
                            </p>
                          </div>
                          <div>
                            <span className="text-[#d4b8a0]">Payment Date</span>
                            <p className="font-medium text-[#f5e6d3] mt-1">
                              {formatDateTime(sub.paymentDate || sub.createdAt)}
                            </p>
                          </div>
                          {sub.receiptUrl && (
                            <div>
                              <span className="text-[#d4b8a0]">Receipt</span>
                              <a
                                href={sub.receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-[#d4a85a] hover:underline text-sm mt-1"
                              >
                                <Eye className="w-4 h-4" />
                                View Receipt
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Invoice Download Button */}
                      <div className="flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadInvoice(sub._id);
                          }}
                          disabled={!invoiceAvailable || downloadingInvoice === sub._id}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                            ${invoiceAvailable 
                              ? 'bg-gradient-to-r from-[#c8963e] to-[#d4a85a] hover:from-[#b8860b] hover:to-[#c8963e] text-[#0a0505] shadow-lg hover:shadow-[#c8963e]/30' 
                              : 'bg-[#1a0a0a] border border-[#c8963e]/20 text-[#d4b8a0]/50 cursor-not-allowed'
                            }`}
                        >
                          {downloadingInvoice === sub._id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              {invoiceAvailable ? 'Download Invoice' : 'Invoice Not Available'}
                            </>
                          )}
                        </button>
                      </div>

                      {/* Invoice Availability Note */}
                      {!invoiceAvailable && (
                        <p className="text-xs text-[#d4b8a0]/40 text-right">
                          {paymentStatus === 'pending' ? 'Invoice will be available after payment completion' : 
                           paymentStatus === 'review' ? 'Invoice will be available after team verification' : 
                           'Invoice not available for this order'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Trust Badges */}
        {subscriptions.length > 0 && (
          <div className="mt-12 text-center">
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
              <div className="flex items-center gap-2 text-[#d4b8a0] text-sm">
                <Award className="w-4 h-4 text-[#d4a85a]" />
                <span>Verified Plans</span>
              </div>
              <div className="flex items-center gap-2 text-[#d4b8a0] text-sm">
                <Star className="w-4 h-4 text-[#d4a85a]" />
                <span>Premium Content</span>
              </div>
              <div className="flex items-center gap-2 text-[#d4b8a0] text-sm">
                <Shield className="w-4 h-4 text-[#d4a85a]" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2 text-[#d4b8a0] text-sm">
                <TrendingUp className="w-4 h-4 text-[#d4a85a]" />
                <span>Unlimited Access</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;