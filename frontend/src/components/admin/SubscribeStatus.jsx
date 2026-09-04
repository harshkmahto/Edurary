// pages/admin/components/SubscribeStatus.jsx
import React, { useState } from 'react';
import { X, Loader2, CheckCircle, XCircle, Clock, AlertCircle, User, Mail, Phone, Calendar, CreditCard, FileText, Eye, Info, Edit2 } from 'lucide-react';
import authService from '../../services/auth.service';
import toast from 'react-hot-toast';

const SubscribeStatus = ({ subscriber, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(subscriber.subscriptionStatus || 'pending');
  const [paymentStatus, setPaymentStatus] = useState(subscriber.paymentStatus || 'pending');
  const [reason, setReason] = useState(subscriber.statusReason || '');
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available status options
  const subscriptionStatusOptions = [
    { value: 'pending', label: 'Pending', icon: <Clock className="w-3.5 h-3.5" />, color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
    { value: 'review', label: 'Review', icon: <AlertCircle className="w-3.5 h-3.5" />, color: 'bg-purple-500/20 text-purple-500 border-purple-500/30' },
    { value: 'active', label: 'Active', icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'bg-[#4ade80]/20 text-[#4ade80] border-[#4ade80]/30' },
    { value: 'expired', label: 'Expired', icon: <XCircle className="w-3.5 h-3.5" />, color: 'bg-red-500/20 text-red-500 border-red-500/30' },
    { value: 'cancelled', label: 'Cancelled', icon: <XCircle className="w-3.5 h-3.5" />, color: 'bg-gray-500/20 text-gray-500 border-gray-500/30' },
    { value: 'terminated', label: 'Terminated', icon: <XCircle className="w-3.5 h-3.5" />, color: 'bg-red-700/20 text-red-700 border-red-700/30' }
  ];

  const paymentStatusOptions = [
    { value: 'pending', label: 'Pending', icon: <Clock className="w-3.5 h-3.5" />, color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
    { value: 'review', label: 'Review', icon: <AlertCircle className="w-3.5 h-3.5" />, color: 'bg-purple-500/20 text-purple-500 border-purple-500/30' },
    { value: 'success', label: 'Success', icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'bg-[#4ade80]/20 text-[#4ade80] border-[#4ade80]/30' },
    { value: 'failed', label: 'Failed', icon: <XCircle className="w-3.5 h-3.5" />, color: 'bg-red-500/20 text-red-500 border-red-500/30' }
  ];

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Update subscription status
      const subscriptionResponse = await authService.updateSubscriberStatus(subscriber._id, {
        subscriptionStatus: subscriptionStatus,
        reason: reason || undefined
      });
      
      if (!subscriptionResponse?.success) {
        toast.error(subscriptionResponse?.message || 'Failed to update subscription status');
        setIsSubmitting(false);
        return;
      }

      // Update payment status if changed
      if (paymentStatus !== subscriber.paymentStatus) {
        const paymentResponse = await authService.updatePaymentStatus(subscriber._id, {
          paymentStatus: paymentStatus,
          reason: reason || undefined
        });
        
        if (!paymentResponse?.success) {
          toast.error(paymentResponse?.message || 'Failed to update payment status');
          setIsSubmitting(false);
          return;
        }
      }

      toast.success('Subscription updated successfully');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
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

  const getStatusBadge = (status, type = 'subscription') => {
    if (type === 'subscription') {
      const option = subscriptionStatusOptions.find(opt => opt.value === status);
      return option?.color || subscriptionStatusOptions[0].color;
    }
    const option = paymentStatusOptions.find(opt => opt.value === status);
    return option?.color || paymentStatusOptions[0].color;
  };

  const getStatusIcon = (status, type = 'subscription') => {
    if (type === 'subscription') {
      const option = subscriptionStatusOptions.find(opt => opt.value === status);
      return option?.icon || <Clock className="w-3.5 h-3.5" />;
    }
    const option = paymentStatusOptions.find(opt => opt.value === status);
    return option?.icon || <Clock className="w-3.5 h-3.5" />;
  };

  const getStatusLabel = (status, type = 'subscription') => {
    if (type === 'subscription') {
      const option = subscriptionStatusOptions.find(opt => opt.value === status);
      return option?.label || status.charAt(0).toUpperCase() + status.slice(1);
    }
    const option = paymentStatusOptions.find(opt => opt.value === status);
    return option?.label || status.charAt(0).toUpperCase() + status.slice(1);
  };

  const user = subscriber.userId || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0a0505] rounded-2xl max-w-2xl w-full border border-gray-200 dark:border-[#c8963e]/20 shadow-2xl overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-[#c8963e]/10 flex items-center justify-between sticky top-0 bg-white dark:bg-[#0a0505] z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#4ade80]/10 dark:bg-[#4ade80]/10 rounded-lg">
              <FileText className="w-5 h-5 text-[#4ade80] dark:text-[#4ade80]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-[#f5e6d3]">
              Subscription Details
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-[#c8963e]/10 rounded-lg transition-colors text-gray-500 dark:text-[#d4b8a0] hover:text-gray-700 dark:hover:text-[#f5e6d3]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body with Scroll */}
        <div className="p-6 space-y-5 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          {/* User Profile Section */}
          <div className="bg-gray-50 dark:bg-[#0a0505] rounded-xl p-4 border border-gray-200 dark:border-[#c8963e]/10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#4ade80] to-[#34d399] dark:from-[#4ade80] dark:to-[#34d399] flex items-center justify-center text-[#0a0505] dark:text-[#0a0505] font-bold text-xl flex-shrink-0">
                {user.name?.charAt(0) || user.username?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-[#f5e6d3] truncate">
                  {user.name || 'Unknown User'}
                </p>
                <p className="text-sm text-gray-500 dark:text-[#d4b8a0] truncate flex items-center gap-1">
                  @{user.username || 'unknown'}
                </p>
              </div>
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400 dark:text-[#d4b8a0]/50 flex-shrink-0" />
                <span className="text-gray-600 dark:text-[#d4b8a0] truncate">{user.email || 'No email'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400 dark:text-[#d4b8a0]/50 flex-shrink-0" />
                <span className="text-gray-600 dark:text-[#d4b8a0]">{user.phone || 'No phone'}</span>
              </div>
            </div>
          </div>

          {/* Plan Details */}
          <div className="bg-gray-50 dark:bg-[#0a0505] rounded-xl p-4 border border-gray-200 dark:border-[#c8963e]/10 space-y-2">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-[#d4b8a0]/60 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-[#4ade80] dark:text-[#4ade80]" />
              Plan Details
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500 dark:text-[#d4b8a0]">Plan Name</span>
                <p className="font-medium text-gray-900 dark:text-[#f5e6d3]">{subscriber.planName}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-[#d4b8a0]">Price</span>
                <p className="font-medium text-gray-900 dark:text-[#f5e6d3]">₹{subscriber.sellingPrice || subscriber.price}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-[#d4b8a0]">Validity</span>
                <p className="font-medium text-gray-900 dark:text-[#f5e6d3]">
                  {subscriber.validity?.value} {subscriber.validity?.unit}{subscriber.validity?.value > 1 ? 's' : ''}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-[#d4b8a0]">Purchased</span>
                <p className="font-medium text-gray-900 dark:text-[#f5e6d3]">{formatDateTime(subscriber.createdAt)}</p>
              </div>
            </div>
            {/* Start and End Date */}
            <div className="pt-2 border-t border-gray-200 dark:border-[#c8963e]/10">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-[#d4b8a0] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#4ade80] dark:text-[#4ade80]" />
                  Start Date
                </span>
                <span className="text-gray-900 dark:text-[#f5e6d3] font-medium">
                  {formatDate(subscriber.startDate)}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500 dark:text-[#d4b8a0] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-red-400 dark:text-red-400" />
                  End Date
                </span>
                <span className="text-gray-900 dark:text-[#f5e6d3] font-medium">
                  {formatDate(subscriber.endDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-gray-50 dark:bg-[#0a0505] rounded-xl p-4 border border-gray-200 dark:border-[#c8963e]/10 space-y-2">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-[#d4b8a0]/60 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-[#4ade80] dark:text-[#4ade80]" />
              Payment Details
            </h4>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-[#d4b8a0]">Transaction ID</span>
                <span className="font-mono text-xs text-gray-900 dark:text-[#f5e6d3] bg-white dark:bg-[#0a0505] px-2 py-0.5 rounded border border-gray-200 dark:border-[#c8963e]/10">
                  {subscriber.transactionId || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-[#d4b8a0]">Payment Date</span>
                <span className="text-gray-900 dark:text-[#f5e6d3]">{formatDateTime(subscriber.paymentDate || subscriber.createdAt)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-[#d4b8a0]">Payment Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusBadge(subscriber.paymentStatus, 'payment')}`}>
                  {getStatusIcon(subscriber.paymentStatus, 'payment')}
                  {getStatusLabel(subscriber.paymentStatus, 'payment')}
                </span>
              </div>
              {subscriber.receiptUrl && (
                <div className="flex justify-between text-sm pt-1">
                  <span className="text-gray-500 dark:text-[#d4b8a0]">Receipt</span>
                  <a
                    href={subscriber.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#4ade80] dark:text-[#4ade80] hover:underline flex items-center gap-1 text-xs font-medium"
                  >
                    <Eye className="w-3 h-3" />
                    View Receipt
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Current Status */}
          <div className="bg-gray-50 dark:bg-[#0a0505] rounded-xl p-4 border border-gray-200 dark:border-[#c8963e]/10 space-y-2">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-[#d4b8a0]/60 uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-[#4ade80] dark:text-[#4ade80]" />
              Current Status
            </h4>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-[#d4b8a0]">Subscription:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getStatusBadge(subscriber.subscriptionStatus, 'subscription')}`}>
                  {getStatusIcon(subscriber.subscriptionStatus, 'subscription')}
                  {getStatusLabel(subscriber.subscriptionStatus, 'subscription')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-[#d4b8a0]">Payment:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getStatusBadge(subscriber.paymentStatus, 'payment')}`}>
                  {getStatusIcon(subscriber.paymentStatus, 'payment')}
                  {getStatusLabel(subscriber.paymentStatus, 'payment')}
                </span>
              </div>
            </div>
            {subscriber.statusReason && (
              <div className="mt-2 p-2 bg-[#c8963e]/5 rounded-lg border border-[#c8963e]/10">
                <p className="text-xs text-[#d4b8a0]/60 flex items-center gap-1">
                  <Info className="w-3 h-3 text-[#d4a85a]" />
                  Reason: <span className="text-[#d4b8a0]">{subscriber.statusReason}</span>
                </p>
              </div>
            )}
          </div>

          {/* Update Status Section */}
          <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-[#c8963e]/10">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-[#f5e6d3] flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-[#4ade80] dark:text-[#4ade80]" />
              Update Status
            </h4>

            {/* Subscription Status */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-[#d4b8a0]/60 mb-2">
                Subscription Status
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {subscriptionStatusOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSubscriptionStatus(option.value)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-200 flex items-center justify-center gap-1.5
                      ${subscriptionStatus === option.value 
                        ? `${option.color} border-current shadow-sm` 
                        : 'bg-gray-50 dark:bg-[#0a0505] text-gray-600 dark:text-[#d4b8a0] border-gray-200 dark:border-[#c8963e]/20 hover:bg-gray-100 dark:hover:bg-[#1a0a0a]'
                      }`}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-[#d4b8a0]/60 mb-2">
                Payment Status
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {paymentStatusOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPaymentStatus(option.value)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-200 flex items-center justify-center gap-1.5
                      ${paymentStatus === option.value 
                        ? `${option.color} border-current shadow-sm` 
                        : 'bg-gray-50 dark:bg-[#0a0505] text-gray-600 dark:text-[#d4b8a0] border-gray-200 dark:border-[#c8963e]/20 hover:bg-gray-100 dark:hover:bg-[#1a0a0a]'
                      }`}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-gray-500 dark:text-[#d4b8a0]/60">
                  Reason <span className="text-gray-400 dark:text-[#d4b8a0]/40">(optional)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowReasonInput(!showReasonInput)}
                  className="text-xs text-[#4ade80] dark:text-[#4ade80] hover:underline"
                >
                  {showReasonInput ? 'Hide' : 'Add Reason'}
                </button>
              </div>
              {showReasonInput && (
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for status change (e.g., Payment verified, Subscription expired, etc.)"
                  className="w-full bg-gray-50 dark:bg-[#0a0505] border border-gray-200 dark:border-[#c8963e]/20 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-[#f5e6d3] placeholder-gray-400 dark:placeholder-[#d4b8a0]/40 focus:outline-none focus:border-[#4ade80] dark:focus:border-[#4ade80] transition-colors resize-none"
                  rows="3"
                />
              )}
              {reason && !showReasonInput && (
                <div className="mt-1 p-2 bg-[#c8963e]/5 rounded-lg border border-[#c8963e]/10">
                  <p className="text-xs text-[#d4b8a0] flex items-center gap-1">
                    <Info className="w-3 h-3 text-[#4ade80]" />
                    {reason}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t border-gray-200 dark:border-[#c8963e]/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-[#0a0505] text-gray-700 dark:text-[#d4b8a0] rounded-lg hover:bg-gray-200 dark:hover:bg-[#1a0a0a] transition-colors font-medium border border-gray-200 dark:border-[#c8963e]/20"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || (subscriptionStatus === subscriber.subscriptionStatus && paymentStatus === subscriber.paymentStatus && !reason)}
              className="flex-1 px-4 py-2.5 bg-[#4ade80] dark:bg-[#4ade80] text-[#0a0505] dark:text-[#0a0505] rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#4ade80]/30"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Update Status
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscribeStatus;