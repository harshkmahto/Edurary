import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, User, Mail, Clock, RefreshCw, CheckCircle, CreditCard, Wallet } from 'lucide-react';
import analyticsService from '../../services/analytics.service';
import toast from 'react-hot-toast';

const Notifications = ({ onClose }) => {
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasMarkedRead, setHasMarkedRead] = useState(false);

  useEffect(() => {
    fetchNotifications();
    
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose?.();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await analyticsService.getusernotification();
      if (response.success) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unreadCount || 0);
        
        if (response.data.unreadCount > 0 && !hasMarkedRead) {
          await markAllAsRead();
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error(error.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await analyticsService.markAllNotificationsRead();
      if (response.success) {
        setHasMarkedRead(true);
        setUnreadCount(0);
        setNotifications(prev => 
          prev.map(notification => ({
            ...notification,
            isRead: true
          }))
        );
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDate(date);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const handleRefresh = async () => {
    setHasMarkedRead(false);
    await fetchNotifications();
  };

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(34, 197, 94, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34, 197, 94, 0.3);
          border-radius: 10px;
          transition: background 0.3s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 197, 94, 0.5);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(34, 197, 94, 0.05);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34, 197, 94, 0.3);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 197, 94, 0.5);
        }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(34, 197, 94, 0.3) transparent;
        }
        .dark .custom-scrollbar {
          scrollbar-color: rgba(34, 197, 94, 0.3) transparent;
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scale-up {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse-dot {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.7;
          }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-scale-up {
          animation: scale-up 0.3s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }

        .animate-spin {
          animation: spin 0.8s linear infinite;
        }

        .animate-pulse-dot {
          animation: pulse-dot 1.5s ease-in-out infinite;
        }

        .notification-item {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .notification-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(34, 197, 94, 0.15);
        }

        .dark .notification-item:hover {
          box-shadow: 0 8px 30px rgba(34, 197, 94, 0.08);
        }

        .glass-modal {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .dark .glass-modal {
          background: rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.2);
        }

        @keyframes badge-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        .badge-bounce {
          animation: badge-bounce 0.5s ease-in-out 2;
        }

        .smooth-scroll {
          scroll-behavior: smooth;
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-start justify-end p-4 backdrop-blur-md animate-fade-in">
        <div
          ref={modalRef}
          className="glass-modal w-full max-w-xl max-h-[95vh] rounded-2xl shadow-2xl shadow-black/20 overflow-hidden animate-scale-up"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-[#22c55e]/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#22c55e]/10 relative">
                <Bell className="w-5 h-5 text-[#22c55e]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium badge-bounce">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Notifications</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2 rounded-xl hover:bg-[#22c55e]/10 text-[#22c55e] transition-colors duration-300"
                title="Refresh"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-200/50 dark:hover:bg-gray-700/50 text-gray-500 dark:text-gray-400 transition-colors duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(95vh-130px)] p-3 space-y-2 custom-scrollbar smooth-scroll">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <RefreshCw className="w-6 h-6 text-[#22c55e] animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center animate-slide-in-right">
                <div className="p-6 rounded-full bg-gray-100/50 dark:bg-[#0a0a0a]/50 mb-4 transition-all duration-300 hover:scale-110">
                  <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  No Notifications
                </h3>
                <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs">
                  You're all caught up! Check back later for new updates.
                </p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={`notification-item bg-white/50 dark:bg-[#0a0a0a]/50 rounded-xl border p-4 hover:shadow-lg transition-all duration-300 hover:border-[#22c55e]/30 ${
                    !notification.isRead 
                      ? 'border-[#22c55e]/30 bg-[#22c55e]/5' 
                      : 'border-gray-200/50 dark:border-[#22c55e]/10'
                  } animate-slide-in-right`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 transition-transform duration-300 hover:scale-105">
                      {notification.user?.profilePicture ? (
                        <img
                          src={notification.user.profilePicture}
                          alt={notification.user.name}
                          className="w-10 h-10 rounded-full object-cover border border-[#22c55e]/30"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#22c55e]/10 flex items-center justify-center border border-[#22c55e]/30">
                          <span className="text-[#22c55e] font-semibold text-sm">
                            {getInitials(notification.user?.name)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {notification.user?.name || 'Unknown User'}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {getTimeAgo(notification.createdAt)}
                        </span>
                        {!notification.isRead && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 border border-green-500/20">
                            New
                          </span>
                        )}
                        {notification.type === 'subscription_purchase' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20">
                            Subscription
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          @{notification.user?.username || 'unknown'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {notification.user?.email || 'No email'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>

                      {notification.user?.isVerified !== undefined && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            notification.user.isVerified 
                              ? 'bg-green-500/10 text-green-600' 
                              : 'bg-yellow-500/10 text-yellow-600'
                          }`}>
                            {notification.user.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            notification.user?.role === 'admin' 
                              ? 'bg-purple-500/10 text-purple-600' 
                              : notification.user?.role === 'author'
                              ? 'bg-blue-500/10 text-blue-600'
                              : 'bg-gray-500/10 text-gray-600'
                          }`}>
                            {notification.user?.role || 'user'}
                          </span>
                        </div>
                      )}

                      {notification.subscription && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20 flex items-center gap-1">
                            <Wallet className="w-3 h-3" />
                            {notification.subscription.planName}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 border border-green-500/20 flex items-center gap-1">
                            <CreditCard className="w-3 h-3" />
                            ₹{notification.subscription.amount}
                          </span>
                          {notification.subscription.subscriptionStatus === 'active' && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                              Active
                            </span>
                          )}
                          {notification.subscription.paymentStatus === 'success' && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 border border-green-500/20">
                              Paid
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {!notification.isRead && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse-dot"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200/50 dark:border-[#22c55e]/10">
              <button
                onClick={() => {
                  navigate('/admin/users');
                  onClose();
                }}
                className="w-full py-2.5 bg-[#22c55e]/10 hover:bg-[#22c55e]/20 text-[#22c55e] rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 text-sm group"
              >
                View All Users
                <span className="text-xs transition-transform duration-300 group-hover:translate-x-1">→</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Notifications;