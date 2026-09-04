// pages/admin/components/SubscriberCard.jsx
import React, { useState } from 'react';
import { 
  Copy, CheckCircle, XCircle, Clock, AlertCircle, 
  Eye, User, Mail, Calendar, CreditCard, FileText, Info,
  MoreVertical, ChevronDown, ChevronUp, Download, File
} from 'lucide-react';
import {Link, useNavigate} from 'react-router-dom'
import toast from 'react-hot-toast';

const SubscriberCard = ({ subscriber, onStatusUpdate, onPaymentUpdate, onViewInvoice }) => {
  const [expanded, setExpanded] = useState(false);

  const navigate = useNavigate()

  // Subscription status configurations
  const subscriptionStatusConfig = {
    active: { label: 'Active', icon: <CheckCircle className="w-4 h-4" />, color: 'bg-[#4ade80]/20 text-[#4ade80] border-[#4ade80]/30' },
    pending: { label: 'Pending', icon: <Clock className="w-4 h-4" />, color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
    review: { label: 'Review', icon: <AlertCircle className="w-4 h-4" />, color: 'bg-purple-500/20 text-purple-500 border-purple-500/30' },
    expired: { label: 'Expired', icon: <XCircle className="w-4 h-4" />, color: 'bg-red-500/20 text-red-500 border-red-500/30' },
    cancelled: { label: 'Cancelled', icon: <XCircle className="w-4 h-4" />, color: 'bg-gray-500/20 text-gray-500 border-gray-500/30' },
    terminated: { label: 'Terminated', icon: <XCircle className="w-4 h-4" />, color: 'bg-red-700/20 text-red-700 border-red-700/30' }
  };

  // Payment status configurations
  const paymentStatusConfig = {
    pending: { label: 'Pending', icon: <Clock className="w-4 h-4" />, color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
    review: { label: 'Review', icon: <AlertCircle className="w-4 h-4" />, color: 'bg-purple-500/20 text-purple-500 border-purple-500/30' },
    success: { label: 'Success', icon: <CheckCircle className="w-4 h-4" />, color: 'bg-[#4ade80]/20 text-[#4ade80] border-[#4ade80]/30' },
    failed: { label: 'Failed', icon: <XCircle className="w-4 h-4" />, color: 'bg-red-500/20 text-red-500 border-red-500/30' }
  };

  const getSubscriptionStatus = (status) => {
    return subscriptionStatusConfig[status] || subscriptionStatusConfig.pending;
  };

  const getPaymentStatus = (status) => {
    return paymentStatusConfig[status] || paymentStatusConfig.pending;
  };

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
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

  const canViewInvoice = () => {
    const paymentStatus = subscriber.paymentStatus || 'pending';
    return paymentStatus === 'success' || paymentStatus === 'failed';
  };

  const user = subscriber.userId || {};
  const subStatus = subscriber.subscriptionStatus || 'pending';
  const payStatus = subscriber.paymentStatus || 'pending';
  const subStatusConfig = getSubscriptionStatus(subStatus);
  const payStatusConfig = getPaymentStatus(payStatus);
  const isActive = subStatus === 'active';
  const invoiceAvailable = canViewInvoice();

  const handleProfileNavigate = (e) => {
    e.preventDefault(); // Prevent default if needed
    const username = user.username || 'user';
    const userId = user._id || subscriber.userId;
    navigate(`/admin/user-profile/${username}/${userId}`);
  };

  return (
    <div className="bg-white dark:bg-black backdrop-blur-xl rounded-xl border border-gray-200 dark:border-[#4ade80]/20 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Card Header */}
      <div className="p-4 border-b border-gray-100 dark:border-[#c8963e]/10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div 
              onClick={handleProfileNavigate}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-400 dark:from-[#4ade80] dark:to-[#34d399] flex items-center justify-center text-white dark:text-[#0a0505] font-semibold text-sm cursor-pointer flex-shrink-0">
              {user.profilePicture ? 
              (
                <img src={user.profilePicture} className='w-full h-full object-cover'/>
              ):(
             <span>  {user.name?.charAt(0) || user.username?.charAt(0) || user.email?.charAt(0) || 'U'}</span> 
              )}
            </div>
          
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-[#f5e6d3]">
                {user.name || 'Unknown User'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-[#d4b8a0] flex items-center gap-1">
                @{user.username || 'unknown'}
                {user.username && (
                  <button 
                    onClick={() => copyToClipboard(user.username, 'Username')}
                    className="p-0.5 hover:bg-gray-100 dark:hover:bg-[#c8963e]/10 rounded transition-colors"
                  >
                    <Copy className="w-3 h-3 text-gray-400 dark:text-[#d4b8a0]/50" />
                  </button>
                )}
              </p>
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 border ${subStatusConfig.color}`}>
            {subStatusConfig.icon}
            {subStatusConfig.label}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3">
        {/* Email */}
        <div className="flex items-center gap-2 text-sm">
          <Mail className="w-4 h-4 text-gray-400 dark:text-[#d4b8a0]/50 flex-shrink-0" />
          <span className="text-gray-600 dark:text-[#d4b8a0] truncate">{user.email || 'No email'}</span>
          {user.email && (
            <button 
              onClick={() => copyToClipboard(user.email, 'Email')}
              className="p-0.5 hover:bg-gray-100 dark:hover:bg-[#c8963e]/10 rounded transition-colors ml-auto flex-shrink-0"
            >
              <Copy className="w-3 h-3 text-gray-400 dark:text-[#d4b8a0]/50" />
            </button>
          )}
        </div>

        {/* Plan Name */}
        <div className="flex items-center gap-2 text-sm">
          <FileText className="w-4 h-4 text-gray-400 dark:text-[#d4b8a0]/50 flex-shrink-0" />
          <span className="text-gray-600 dark:text-[#d4b8a0]">
            Plan: <span className="font-medium text-gray-900 dark:text-[#f5e6d3]">{subscriber.planName}</span>
          </span>
        </div>

        {/* Amount */}
        <div className="flex items-center gap-2 text-sm">
          <CreditCard className="w-4 h-4 text-gray-400 dark:text-[#d4b8a0]/50 flex-shrink-0" />
          <span className="text-gray-600 dark:text-[#d4b8a0]">
            Amount: <span className="font-medium text-green-600 dark:text-[#4ade80]">₹{subscriber.sellingPrice || subscriber.price}</span>
          </span>
        </div>

        {/* Purchase Date */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-400 dark:text-[#d4b8a0]/50 flex-shrink-0" />
          <span className="text-gray-600 dark:text-[#d4b8a0]">
            Purchased: {formatDateTime(subscriber.createdAt)}
          </span>
        </div>

        {/* Payment Status */}
        <div className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 border ${payStatusConfig.color}`}>
          {payStatusConfig.icon}
          Payment: {payStatusConfig.label}
        </div>

        {/* Expandable Section */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#c8963e]/10 space-y-2">
            {/* User ID */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-[#d4b8a0]">User ID:</span>
              <span className="text-gray-900 dark:text-[#f5e6d3] font-mono text-xs flex items-center gap-1">
                {user._id || 'N/A'}
                {user._id && (
                  <button 
                    onClick={() => copyToClipboard(user._id, 'User ID')}
                    className="p-0.5 hover:bg-gray-100 dark:hover:bg-[#c8963e]/10 rounded transition-colors"
                  >
                    <Copy className="w-3 h-3 text-gray-400 dark:text-[#d4b8a0]/50" />
                  </button>
                )}
              </span>
            </div>

            {/* Transaction ID */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-[#d4b8a0]">Transaction ID:</span>
              <span className="text-gray-900 dark:text-[#f5e6d3] font-mono text-xs flex items-center gap-1">
                {subscriber.transactionId || 'N/A'}
                {subscriber.transactionId && (
                  <button 
                    onClick={() => copyToClipboard(subscriber.transactionId, 'Transaction ID')}
                    className="p-0.5 hover:bg-gray-100 dark:hover:bg-[#c8963e]/10 rounded transition-colors"
                  >
                    <Copy className="w-3 h-3 text-gray-400 dark:text-[#d4b8a0]/50" />
                  </button>
                )}
              </span>
            </div>

            {/* Validity Dates */}
            {subscriber.startDate && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-[#d4b8a0]">Valid:</span>
                <span className="text-gray-900 dark:text-[#f5e6d3] text-xs">
                  {formatDate(subscriber.startDate)} - {formatDate(subscriber.endDate)}
                </span>
              </div>
            )}

            {/* Validity */}
            {subscriber.validity && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-[#d4b8a0]">Validity:</span>
                <span className="text-gray-900 dark:text-[#f5e6d3] text-xs font-medium">
                  {subscriber.validity.value} {subscriber.validity.unit}{subscriber.validity.value > 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Payment Date */}
            {subscriber.paymentDate && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-[#d4b8a0]">Payment Date:</span>
                <span className="text-gray-900 dark:text-[#f5e6d3] text-xs">
                  {formatDateTime(subscriber.paymentDate)}
                </span>
              </div>
            )}

            {/* Status Reason */}
            {subscriber.statusReason && (
              <div className="mt-2 p-2 bg-green-50 dark:bg-[#4ade80]/5 rounded-lg border border-green-200 dark:border-[#4ade80]/20">
                <p className="text-xs text-gray-600 dark:text-[#d4b8a0] flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-green-600 dark:text-[#4ade80] flex-shrink-0 mt-0.5" />
                  <span>
                    <span className="font-medium text-gray-700 dark:text-[#d4b8a0]/80">Reason:</span>{' '}
                    <span className="text-gray-700 dark:text-[#d4b8a0]">{subscriber.statusReason}</span>
                  </span>
                </p>
              </div>
            )}

            {/* Receipt */}
            {subscriber.receiptUrl && (
              <div className="flex items-center justify-between text-sm pt-1">
                <span className="text-gray-500 dark:text-[#d4b8a0]">Receipt:</span>
                <a
                  href={subscriber.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 dark:text-[#4ade80] hover:underline flex items-center gap-1 text-xs font-medium"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Receipt
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-4 py-3 bg-green-50 dark:bg-[#0a0505]/50 border-t border-gray-100 dark:border-[#c8963e]/10 flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-gray-500 dark:text-[#d4b8a0] hover:text-gray-700 dark:hover:text-[#f5e6d3] flex items-center gap-1 transition-colors"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {expanded ? 'Less Details' : 'More Details'}
        </button>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onViewInvoice(subscriber)}
            disabled={!invoiceAvailable}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 border ${
              invoiceAvailable 
                ? 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/20' 
                : 'bg-gray-100 dark:bg-gray-500/10 text-gray-400 dark:text-gray-500 cursor-not-allowed border-gray-200 dark:border-gray-500/20'
            }`}
          >
            <File className="w-3 h-3" />
            Invoice
          </button>
          <button
            onClick={() => onPaymentUpdate(subscriber)}
            className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 border border-purple-500/20"
          >
            <CreditCard className="w-3 h-3" />
            Payment
          </button>
          <button
            onClick={() => onStatusUpdate(subscriber)}
            className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-[#4ade80] rounded-lg text-xs font-medium transition-colors flex items-center gap-1 border border-green-500/20"
          >
            <Eye className="w-3 h-3" />
            Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriberCard;