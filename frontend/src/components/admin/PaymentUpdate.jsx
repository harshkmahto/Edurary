// pages/admin/components/PaymentUpdate.jsx
import React, { useState } from 'react';
import { X, Loader2, CheckCircle, XCircle, Clock, AlertCircle, CreditCard, Eye, Download } from 'lucide-react';
import authService from '../../services/auth.service';
import toast from 'react-hot-toast';

const PaymentUpdate = ({ subscriber, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(subscriber.paymentStatus || 'pending');

  const paymentOptions = [
    { value: 'pending', label: 'Pending', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { value: 'review', label: 'Review', icon: AlertCircle, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { value: 'success', label: 'Success', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
    { value: 'failed', label: 'Failed', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await authService.updatePaymentStatus(subscriber._id, { paymentStatus });
      if (response?.success) {
        toast.success('Payment status updated successfully');
        onUpdate();
      } else {
        toast.error(response?.message || 'Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error(error.message || 'Failed to update payment status');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
      review: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      success: 'text-green-500 bg-green-500/10 border-green-500/20',
      failed: 'text-red-500 bg-red-500/10 border-red-500/20'
    };
    return colors[status] || colors.pending;
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
      review: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
      success: 'bg-green-500/20 text-green-500 border-green-500/30',
      failed: 'bg-red-500/20 text-red-500 border-red-500/30'
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-green-50 dark:bg-black rounded-2xl max-w-lg w-full border border-gray-200 dark:border-[#c8963e]/20 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-[#c8963e]/10 flex items-center justify-between sticky top-0 bg-green-50 dark:bg-black z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg">
              <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-[#f5e6d3]">
              Update Payment Status
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-[#c8963e]/10 rounded-lg transition-colors text-gray-500 dark:text-[#d4b8a0] hover:text-gray-700 dark:hover:text-[#f5e6d3]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Receipt Image */}
          {subscriber.receiptUrl && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-[#d4b8a0]">
                Payment Receipt
              </label>
              <div 
                className="relative group cursor-pointer rounded-xl overflow-hidden border border-gray-200 dark:border-[#c8963e]/20 bg-gray-50 dark:bg-[#0a0505]"
                onClick={() => window.open(subscriber.receiptUrl, '_blank')}
              >
                <img
                  src={subscriber.receiptUrl}
                  alt="Payment Receipt"
                  className="w-full h-48 object-cover object-center"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `
                      <div class="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-[#d4b8a0]/40">
                        <Eye class="w-12 h-12 mb-2" />
                        <p class="text-sm">Click to view receipt</p>
                      </div>
                    `;
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-sm font-medium flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    View Receipt
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-[#d4b8a0]">Click image to view full receipt</span>
                <a
                  href={subscriber.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 dark:text-[#4ade80] hover:underline flex items-center gap-1 text-xs font-medium"
                >
                  <Eye className="w-3 h-3" />
                  Open in new tab
                </a>
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="bg-gray-50 dark:bg-[#0a0505] rounded-xl p-4 border border-gray-200 dark:border-[#c8963e]/10 space-y-2.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-[#d4b8a0]">Transaction ID</span>
              <span className="font-mono text-xs text-gray-900 dark:text-[#f5e6d3] bg-white dark:bg-[#1a0a0a] px-2 py-1 rounded border border-gray-200 dark:border-[#c8963e]/10">
                {subscriber.transactionId || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-[#d4b8a0]">Amount</span>
              <span className="font-semibold text-gray-900 dark:text-[#f5e6d3] text-base">
                ₹{subscriber.sellingPrice || subscriber.price}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-[#d4b8a0]">Payment Date</span>
              <span className="text-gray-900 dark:text-[#f5e6d3]">
                {formatDate(subscriber.paymentDate || subscriber.createdAt)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-200 dark:border-[#c8963e]/10">
              <span className="text-gray-500 dark:text-[#d4b8a0]">Current Status</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(subscriber.paymentStatus)}`}>
                {subscriber.paymentStatus.charAt(0).toUpperCase() + subscriber.paymentStatus.slice(1)}
              </span>
            </div>
          </div>

          {/* Payment Status Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-[#d4b8a0]">
              Select New Payment Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {paymentOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = paymentStatus === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPaymentStatus(option.value)}
                    className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                      isSelected
                        ? option.value === 'success'
                          ? 'bg-green-600 dark:bg-[#4ade80] text-white dark:text-[#0a0505] shadow-lg shadow-green-600/30 dark:shadow-[#4ade80]/30'
                          : option.value === 'failed'
                          ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                          : option.value === 'review'
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                          : 'bg-yellow-600 text-white shadow-lg shadow-yellow-600/30'
                        : 'bg-gray-100 dark:bg-[#0a0505] text-gray-600 dark:text-[#d4b8a0] border border-gray-200 dark:border-[#c8963e]/20 hover:bg-gray-200 dark:hover:bg-[#1a0a0a]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-white dark:text-[#0a0505]' : option.color}`} />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Info */}
          <div className="bg-gray-50 dark:bg-[#0a0505] rounded-lg p-3 border border-gray-200 dark:border-[#c8963e]/10">
            <p className="text-xs text-gray-500 dark:text-[#d4b8a0]">Subscriber</p>
            <p className="text-sm font-medium text-gray-900 dark:text-[#f5e6d3]">
              {subscriber.userId?.name || 'Unknown User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-[#d4b8a0] flex items-center gap-2 mt-0.5">
              <span>{subscriber.userId?.email || 'No email'}</span>
              <span className="w-px h-3 bg-gray-300 dark:bg-[#c8963e]/20"></span>
              <span>Plan: <span className="text-gray-700 dark:text-[#f5e6d3] font-medium">{subscriber.planName}</span></span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-[#0a0505] text-gray-700 dark:text-[#d4b8a0] rounded-lg hover:bg-gray-200 dark:hover:bg-[#1a0a0a] transition-colors font-medium border border-gray-200 dark:border-[#c8963e]/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || paymentStatus === subscriber.paymentStatus}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-[#4ade80] dark:to-[#34d399] text-white dark:text-[#0a0505] rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-600/30 dark:shadow-[#4ade80]/30"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Update Payment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentUpdate;