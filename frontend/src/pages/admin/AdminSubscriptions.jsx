import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Edit, Trash2, CheckCircle, XCircle, IndianRupee,
  Package, Calendar, Tag, List, Info, FileText, Filter,
  Sparkles, TrendingUp, AlertCircle, Crown
} from 'lucide-react';
import CreateSubscription from '../../components/admin/CreateSubscription';
import UpdateSubscription from '../../components/admin/UpdateSubscription';
import authService from '../../services/auth.service';
import { useAuth } from '../../context/authContext';
import toast from 'react-hot-toast';

const AdminSubscriptions = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [totalPlans, setTotalPlans] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        setError('Please login to view this page');
        setLoading(false);
        return;
      }
      if (user?.role !== 'admin') {
        setError('You do not have permission to view this page');
        setLoading(false);
        return;
      }
      fetchSubscriptions();
    }
  }, [authLoading, isAuthenticated, user]);

  useEffect(() => {
    if (totalPlans > 0) {
      animateCount(totalPlans);
    }
  }, [totalPlans]);

  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredSubscriptions(subscriptions);
    } else if (activeFilter === 'active') {
      setFilteredSubscriptions(subscriptions.filter(s => s.isActive));
    } else if (activeFilter === 'inactive') {
      setFilteredSubscriptions(subscriptions.filter(s => !s.isActive));
    }
  }, [subscriptions, activeFilter]);

  const animateCount = (target) => {
    let start = 0;
    const duration = 1500;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
  };

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.getAllSubscriptions();
      const subscriptionData = response?.subscriptions || [];
      setSubscriptions(subscriptionData);
      setTotalPlans(subscriptionData.length);
      
      if (subscriptionData.length === 0) {
        toast('No subscriptions found. Create your first one!', {
          icon: 'ℹ️',
        });
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch subscriptions');
      toast.error(error.message || 'Failed to fetch subscriptions');
      setSubscriptions([]);
      setTotalPlans(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subscription?')) {
      return;
    }
    try {
      await authService.deleteSubscription(id);
      toast.success('Subscription deleted successfully');
      fetchSubscriptions();
    } catch (error) {
      toast.error(error.message || 'Failed to delete subscription');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      if (!currentStatus) {
        await authService.activateSubscription(id);
        toast.success('Subscription activated successfully');
      } else {
        await authService.updateSubscription(id, { isActive: false });
        toast.success('Subscription deactivated successfully');
      }
      fetchSubscriptions();
    } catch (error) {
      toast.error(error.message || 'Failed to update subscription status');
    }
  };

  const handleUpdate = (subscription) => {
    setSelectedSubscription(subscription);
    setShowUpdateModal(true);
  };

  const handleCreate = () => {
    setShowCreateModal(true);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#f5faf5] dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#22c55e] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-[#1a3a1a] dark:text-[#4ade80] font-medium">
            {authLoading ? 'Checking authentication...' : 'Loading subscriptions...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5faf5] dark:bg-black flex items-center justify-center p-6">
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl rounded-2xl p-12 max-w-md w-full border border-[#22c55e]/20 dark:border-[#4ade80]/10 shadow-2xl text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#1a3a1a] dark:text-white mb-2">
            {error === 'Please login to view this page' ? 'Authentication Required' : 'Access Denied'}
          </h3>
          <p className="text-[#2a5a2a] dark:text-[#6b8b6b] mb-6">{error}</p>
          {error === 'Please login to view this page' && (
            <button
              onClick={() => window.location.href = '/auth/signin'}
              className="px-6 py-3 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#22c55e]/30"
            >
              Login
            </button>
          )}
          {error === 'You do not have permission to view this page' && (
            <button
              onClick={() => window.location.href = '/admin/dashboard'}
              className="px-6 py-3 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#22c55e]/30"
            >
              Go to Dashboard
            </button>
          )}
          {(error !== 'Please login to view this page' && error !== 'You do not have permission to view this page') && (
            <button
              onClick={fetchSubscriptions}
              className="px-6 py-3 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#22c55e]/30"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5faf5] dark:bg-black p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/70 dark:bg-black/70 backdrop-blur-xl rounded-2xl p-8 mb-8 border border-[#22c55e]/20 dark:border-[#4ade80]/10 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-[#22c55e] to-[#16a34a] dark:from-[#4ade80] dark:to-[#22c55e] rounded-2xl shadow-lg shadow-[#22c55e]/30 dark:shadow-[#4ade80]/20">
                <Crown className="w-8 h-8 text-white dark:text-black" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#1a3a1a] dark:text-white flex items-center gap-2">
                  <IndianRupee className="w-8 h-8 text-[#22c55e] dark:text-[#4ade80]" />
                  EduRary Subscriptions
                </h1>
                <p className="text-[#2a5a2a] dark:text-[#6b8b6b]">Manage your subscription plans</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCreate}
                className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#22c55e]/40 dark:shadow-[#4ade80]/20"
              >
                <Plus className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
                <span className="font-semibold">Create Subscription</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Plans */}
          <div className="bg-white/70 dark:bg-black/70 backdrop-blur-xl rounded-2xl p-6 border border-[#22c55e]/20 dark:border-[#4ade80]/10 shadow-xl group hover:shadow-2xl transition-all duration-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#2a5a2a] dark:text-[#6b8b6b]">Total Plans</p>
                <div className="mt-1 flex items-end gap-2">
                  <h3 className="text-4xl font-bold text-[#1a3a1a] dark:text-white">
                    {count}
                  </h3>
                  <span className="text-sm text-[#22c55e] dark:text-[#4ade80] font-medium mb-1">
                    plans
                  </span>
                </div>
                <p className="text-xs text-[#2a5a2a]/60 dark:text-[#6b8b6b]/60 mt-1">
                  Total subscription plans available
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-[#22c55e]/10 to-[#16a34a]/10 dark:from-[#4ade80]/10 dark:to-[#22c55e]/10 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                <TrendingUp className="w-8 h-8 text-[#22c55e] dark:text-[#4ade80]" />
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full bg-[#22c55e]/10 dark:bg-[#4ade80]/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] dark:from-[#4ade80] dark:to-[#22c55e] rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((totalPlans / 100) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Active Plans */}
          <div className="bg-white/70 dark:bg-black/70 backdrop-blur-xl rounded-2xl p-6 border border-[#22c55e]/20 dark:border-[#4ade80]/10 shadow-xl group hover:shadow-2xl transition-all duration-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#2a5a2a] dark:text-[#6b8b6b]">Active Plans</p>
                <h3 className="text-4xl font-bold text-[#22c55e] dark:text-[#4ade80] mt-1">
                  {subscriptions.filter(s => s.isActive).length}
                </h3>
                <p className="text-xs text-[#2a5a2a]/60 dark:text-[#6b8b6b]/60 mt-1">
                  Currently active subscriptions
                </p>
              </div>
              <div className="p-4 bg-[#22c55e]/10 dark:bg-[#4ade80]/10 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                <CheckCircle className="w-8 h-8 text-[#22c55e] dark:text-[#4ade80]" />
              </div>
            </div>
          </div>

          {/* Inactive Plans */}
          <div className="bg-white/70 dark:bg-black/70 backdrop-blur-xl rounded-2xl p-6 border border-[#22c55e]/20 dark:border-[#4ade80]/10 shadow-xl group hover:shadow-2xl transition-all duration-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#2a5a2a] dark:text-[#6b8b6b]">Inactive Plans</p>
                <h3 className="text-4xl font-bold text-red-500 dark:text-red-400 mt-1">
                  {subscriptions.filter(s => !s.isActive).length}
                </h3>
                <p className="text-xs text-[#2a5a2a]/60 dark:text-[#6b8b6b]/60 mt-1">
                  Currently inactive subscriptions
                </p>
              </div>
              <div className="p-4 bg-red-500/10 dark:bg-red-400/10 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                <XCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white/70 dark:bg-black/70 backdrop-blur-xl rounded-2xl p-4 mb-8 border border-[#22c55e]/20 dark:border-[#4ade80]/10 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-[#22c55e] dark:text-[#4ade80]" />
              <span className="text-sm font-medium text-[#1a3a1a] dark:text-white">Filter:</span>
              <div className="flex gap-2">
                {['all', 'active', 'inactive'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                      activeFilter === filter
                        ? 'bg-[#22c55e] text-white shadow-lg shadow-[#22c55e]/30 dark:shadow-[#4ade80]/20'
                        : 'bg-[#22c55e]/10 dark:bg-[#4ade80]/10 text-[#1a3a1a] dark:text-[#6b8b6b] hover:bg-[#22c55e]/20 dark:hover:bg-[#4ade80]/20'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-sm text-[#2a5a2a] dark:text-[#6b8b6b]">
              Showing {filteredSubscriptions.length} of {subscriptions.length} plans
            </div>
          </div>
        </div>

        {/* Subscriptions Grid */}
        {filteredSubscriptions.length === 0 ? (
          <div className="bg-white/70 dark:bg-black/70 backdrop-blur-xl rounded-2xl p-16 text-center border border-[#22c55e]/20 dark:border-[#4ade80]/10 shadow-xl">
            <Package className="w-20 h-20 text-[#22c55e]/30 dark:text-[#4ade80]/20 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-[#1a3a1a] dark:text-white mb-2">
              No subscriptions found
            </h3>
            <p className="text-[#2a5a2a] dark:text-[#6b8b6b]">
              Create your first subscription plan to get started
            </p>
            <button
              onClick={handleCreate}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#22c55e]/40"
            >
              <Plus className="w-5 h-5" />
              Create Subscription
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSubscriptions.map((subscription, index) => (
              <div
                key={subscription._id}
                className="group bg-white/70 dark:bg-black/70 backdrop-blur-xl rounded-2xl overflow-hidden border border-[#22c55e]/20 dark:border-[#4ade80]/10 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-[#22c55e]/10 dark:border-[#4ade80]/10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      {subscription.icon ? (
                        <img 
                          src={subscription.icon} 
                          alt={subscription.title}
                          className="w-14 h-14 rounded-2xl object-cover border border-[#22c55e]/20 dark:border-[#4ade80]/10"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `
                              <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#22c55e]/10 to-[#16a34a]/10 dark:from-[#4ade80]/10 dark:to-[#22c55e]/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                                📦
                              </div>
                            `;
                          }}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#22c55e]/10 to-[#16a34a]/10 dark:from-[#4ade80]/10 dark:to-[#22c55e]/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                          📦
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-[#1a3a1a] dark:text-white group-hover:text-[#22c55e] dark:group-hover:text-[#4ade80] transition-colors">
                          {subscription.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            subscription.isActive
                              ? 'bg-[#22c55e]/10 text-[#22c55e] dark:bg-[#4ade80]/10 dark:text-[#4ade80]'
                              : 'bg-red-500/10 text-red-500 dark:bg-red-400/10 dark:text-red-400'
                          }`}>
                            {subscription.isActive ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            {subscription.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            onClick={() => handleToggleActive(subscription._id, subscription.isActive)}
                            className="text-xs text-[#22c55e] dark:text-[#4ade80] hover:underline font-medium transition-colors"
                          >
                            Toggle
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  {/* Pricing */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#2a5a2a]/60 dark:text-[#6b8b6b]/60 line-through">
                        ₹{subscription.price}
                      </p>
                      <p className="text-2xl font-bold text-[#22c55e] dark:text-[#4ade80]">
                        ₹{subscription.sellingPrice}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-sm text-[#1a3a1a] dark:text-[#6b8b6b]">
                        <Calendar className="w-4 h-4 text-[#22c55e] dark:text-[#4ade80]" />
                        <span className="font-medium">
                          {subscription.validity?.value} {subscription.validity?.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  {subscription.features?.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-[#2a5a2a]/60 dark:text-[#6b8b6b]/60 flex items-center gap-1.5">
                        <List className="w-3.5 h-3.5" />
                        Features
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {subscription.features.slice(0, 3).map((feature, idx) => (
                          <span key={idx} className="text-xs bg-[#22c55e]/5 dark:bg-[#4ade80]/5 text-[#1a3a1a] dark:text-[#6b8b6b] px-2 py-1 rounded-lg">
                            {feature}
                          </span>
                        ))}
                        {subscription.features.length > 3 && (
                          <span className="text-xs text-[#22c55e] dark:text-[#4ade80] font-medium">
                            +{subscription.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* About */}
                  {subscription.about && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-[#2a5a2a]/60 dark:text-[#6b8b6b]/60 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5" />
                        About
                      </p>
                      <p className="text-sm text-[#1a3a1a] dark:text-[#6b8b6b] line-clamp-2">
                        {subscription.about}
                      </p>
                    </div>
                  )}

                  {/* Terms */}
                  {subscription.termsAndConditions?.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-[#2a5a2a]/60 dark:text-[#6b8b6b]/60 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        Terms & Conditions
                      </p>
                      <p className="text-sm text-[#1a3a1a] dark:text-[#6b8b6b] line-clamp-1">
                        {subscription.termsAndConditions.join(', ')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="px-6 py-4 bg-[#22c55e]/5 dark:bg-[#4ade80]/5 border-t border-[#22c55e]/10 dark:border-[#4ade80]/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#22c55e] dark:text-[#4ade80]" />
                    <span className="text-sm text-[#1a3a1a] dark:text-[#6b8b6b]">
                      Order #{subscription.order || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleUpdate(subscription)}
                      className="p-2 text-[#22c55e] dark:text-[#4ade80] hover:bg-[#22c55e]/10 dark:hover:bg-[#4ade80]/10 rounded-lg transition-all duration-300 hover:scale-110"
                      title="Edit subscription"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(subscription._id)}
                      className="p-2 text-red-500 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-400/10 rounded-lg transition-all duration-300 hover:scale-110"
                      title="Delete subscription"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-black rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#22c55e]/20 dark:border-[#4ade80]/30 shadow-2xl">
            <CreateSubscription
              onClose={() => setShowCreateModal(false)}
              onSuccess={fetchSubscriptions}
            />
          </div>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedSubscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-black rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#22c55e]/20 dark:border-[#4ade80]/30 shadow-2xl">
            <UpdateSubscription
              subscription={selectedSubscription}
              onClose={() => {
                setShowUpdateModal(false);
                setSelectedSubscription(null);
              }}
              onSuccess={fetchSubscriptions}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AdminSubscriptions;