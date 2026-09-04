// pages/admin/Subscribers.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, UserCheck, Clock, AlertCircle, CreditCard, 
  Search, Calendar, Filter, Download, Eye, 
  ChevronDown, ChevronUp, PieChart, BarChart3,
  TrendingUp, TrendingDown, Activity, XCircle,
  CheckCircle, FileText, Mail, Phone, User,
  File, X, Hash
} from 'lucide-react';
import authService from '../../services/auth.service';
import toast from 'react-hot-toast';
import SubscriberCard from '../../components/admin/SubscriberCard';
import SubscribeStatus from '../../components/admin/SubscribeStatus';
import PaymentUpdate from '../../components/admin/PaymentUpdate';
import { generateInvoicePDF } from '../../helper/generateInvoicePdf';

const Subscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    review: 0,
    expired: 0,
    cancelled: 0,
    terminated: 0,
    paymentSuccess: 0,
    paymentFailed: 0,
    paymentPending: 0,
    paymentReview: 0
  });
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [invoiceSearchTerm, setInvoiceSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedSubscriber, setSelectedSubscriber] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [analytics, setAnalytics] = useState({
    monthlyData: [],
    planData: []
  });

  // Count animation refs
  const countRefs = useRef({});

  useEffect(() => {
    fetchSubscribers();
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (!loading && subscribers.length > 0) {
      animateCounts();
    }
  }, [loading, stats]);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const response = await authService.getAllSubscribers();
      if (response?.success) {
        setSubscribers(response.subscriptions || []);
        calculateStats(response.subscriptions || []);
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast.error('Failed to fetch subscribers');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      // Mock data - replace with actual API call
      setAnalytics({
        monthlyData: [
          { month: 'Jan', count: 12 },
          { month: 'Feb', count: 19 },
          { month: 'Mar', count: 25 },
          { month: 'Apr', count: 18 },
          { month: 'May', count: 30 },
          { month: 'Jun', count: 22 },
        ],
        planData: [
          { name: 'Basic', value: 35 },
          { name: 'Premium', value: 45 },
          { name: 'Elite', value: 20 },
        ]
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    
    // Subscription status counts
    const active = data.filter(s => s.subscriptionStatus === 'active').length;
    const pending = data.filter(s => s.subscriptionStatus === 'pending').length;
    const review = data.filter(s => s.subscriptionStatus === 'review').length;
    const expired = data.filter(s => s.subscriptionStatus === 'expired').length;
    const cancelled = data.filter(s => s.subscriptionStatus === 'cancelled').length;
    const terminated = data.filter(s => s.subscriptionStatus === 'terminated').length;
    
    // Payment status counts
    const paymentSuccess = data.filter(s => s.paymentStatus === 'success').length;
    const paymentFailed = data.filter(s => s.paymentStatus === 'failed').length;
    const paymentPending = data.filter(s => s.paymentStatus === 'pending').length;
    const paymentReview = data.filter(s => s.paymentStatus === 'review').length;

    setStats({ 
      total, active, pending, review, expired, cancelled, terminated,
      paymentSuccess, paymentFailed, paymentPending, paymentReview
    });
  };

  const animateCounts = () => {
    Object.keys(stats).forEach(key => {
      const el = countRefs.current[key];
      if (el) {
        const target = stats[key];
        let current = 0;
        const increment = Math.ceil(target / 30);
        const interval = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(interval);
          }
          el.textContent = current;
        }, 30);
      }
    });
  };

  const getFilteredSubscribers = () => {
    let filtered = [...subscribers];

    // Filter by status
    if (filter === 'active') {
      filtered = filtered.filter(s => s.subscriptionStatus === 'active');
    } else if (filter === 'pending') {
      filtered = filtered.filter(s => s.subscriptionStatus === 'pending');
    } else if (filter === 'review') {
      filtered = filtered.filter(s => s.subscriptionStatus === 'review');
    } else if (filter === 'expired') {
      filtered = filtered.filter(s => s.subscriptionStatus === 'expired');
    } else if (filter === 'cancelled') {
      filtered = filtered.filter(s => s.subscriptionStatus === 'cancelled');
    } else if (filter === 'terminated') {
      filtered = filtered.filter(s => s.subscriptionStatus === 'terminated');
    } else if (filter === 'payment-success') {
      filtered = filtered.filter(s => s.paymentStatus === 'success');
    } else if (filter === 'payment-failed') {
      filtered = filtered.filter(s => s.paymentStatus === 'failed');
    } else if (filter === 'payment-pending') {
      filtered = filtered.filter(s => s.paymentStatus === 'pending');
    } else if (filter === 'payment-review') {
      filtered = filtered.filter(s => s.paymentStatus === 'review');
    }

    // Search filter - by name, email, plan
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.userId?.name?.toLowerCase().includes(term) ||
        s.userId?.email?.toLowerCase().includes(term) ||
        s.planName?.toLowerCase().includes(term) ||
        s.userId?.username?.toLowerCase().includes(term)
      );
    }

    // Invoice ID search filter
    if (invoiceSearchTerm) {
      const term = invoiceSearchTerm.toLowerCase().trim();
      filtered = filtered.filter(s => {
        // Generate invoice ID format: INV-{subscriberId last 8 chars}
        const invoiceId = `INV-${s._id?.toString().slice(-8).toUpperCase() || ''}`;
        // Also check if transaction ID matches
        const transactionId = s.transactionId?.toLowerCase() || '';
        return invoiceId.toLowerCase().includes(term) || 
               transactionId.includes(term) ||
               s._id?.toString().includes(term);
      });
    }

    // Date filter
    if (dateRange.start) {
      const start = new Date(dateRange.start);
      filtered = filtered.filter(s => new Date(s.createdAt) >= start);
    }
    if (dateRange.end) {
      const end = new Date(dateRange.end);
      end.setHours(23, 59, 59);
      filtered = filtered.filter(s => new Date(s.createdAt) <= end);
    }

    return filtered;
  };

  const handleStatusUpdate = (subscriber) => {
    setSelectedSubscriber(subscriber);
    setShowStatusModal(true);
  };

  const handlePaymentUpdate = (subscriber) => {
    setSelectedSubscriber(subscriber);
    setShowPaymentModal(true);
  };

  const handleViewInvoice = async (subscriber) => {
    setSelectedSubscriber(subscriber);
    setLoadingInvoice(true);
    setShowInvoiceModal(true);
    
    try {
      const response = await authService.getInvoice(subscriber._id);
      if (response?.success && response?.data) {
        setInvoiceData(response.data);
      } else {
        toast.error(response?.message || 'Failed to fetch invoice');
        setShowInvoiceModal(false);
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast.error(error.message || 'Failed to fetch invoice');
      setShowInvoiceModal(false);
    } finally {
      setLoadingInvoice(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!invoiceData) return;
    
    try {
      setDownloadingInvoice(true);
      await generateInvoicePDF(invoiceData);
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const handleStatusModalClose = () => {
    setShowStatusModal(false);
    setSelectedSubscriber(null);
    fetchSubscribers();
  };

  const handlePaymentModalClose = () => {
    setShowPaymentModal(false);
    setSelectedSubscriber(null);
    fetchSubscribers();
  };

  const handleInvoiceModalClose = () => {
    setShowInvoiceModal(false);
    setInvoiceData(null);
    setSelectedSubscriber(null);
  };

  const filteredSubscribers = getFilteredSubscribers();

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 dark:bg-[#0a0505] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 dark:border-[#4ade80] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-green-700 dark:text-[#d4b8a0]">Loading subscribers...</p>
        </div>
      </div>
    );
  }

  // Tab configurations
  const tabs = [
    { id: 'all', label: 'All', icon: <Users className="w-3.5 h-3.5" />, count: stats.total },
    { id: 'active', label: 'Active', icon: <CheckCircle className="w-3.5 h-3.5" />, count: stats.active, color: 'text-[#4ade80]' },
    { id: 'pending', label: 'Pending', icon: <Clock className="w-3.5 h-3.5" />, count: stats.pending, color: 'text-yellow-500' },
    { id: 'review', label: 'Review', icon: <AlertCircle className="w-3.5 h-3.5" />, count: stats.review, color: 'text-purple-500' },
    { id: 'expired', label: 'Expired', icon: <XCircle className="w-3.5 h-3.5" />, count: stats.expired, color: 'text-red-500' },
    { id: 'cancelled', label: 'Cancelled', icon: <XCircle className="w-3.5 h-3.5" />, count: stats.cancelled, color: 'text-gray-500' },
    { id: 'terminated', label: 'Terminated', icon: <XCircle className="w-3.5 h-3.5" />, count: stats.terminated, color: 'text-red-700' },
  ];

  const paymentTabs = [
    { id: 'payment-success', label: 'Success', icon: <CheckCircle className="w-3.5 h-3.5" />, count: stats.paymentSuccess, color: 'text-[#4ade80]' },
    { id: 'payment-failed', label: 'Failed', icon: <XCircle className="w-3.5 h-3.5" />, count: stats.paymentFailed, color: 'text-red-500' },
    { id: 'payment-pending', label: 'Pending', icon: <Clock className="w-3.5 h-3.5" />, count: stats.paymentPending, color: 'text-yellow-500' },
    { id: 'payment-review', label: 'Review', icon: <AlertCircle className="w-3.5 h-3.5" />, count: stats.paymentReview, color: 'text-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-green-50 dark:bg-[#051406] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-green-900 dark:text-[#f5e6d3] flex items-center gap-2">
          <Users className="w-8 h-8 text-green-600 dark:text-[#4ade80]" />
          All Subscribers
        </h1>
        <p className="text-green-700 dark:text-[#d4b8a0] mt-1">
          Manage and monitor all subscription purchases
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-6">
        <div className="bg-white dark:bg-black backdrop-blur-xl rounded-xl p-4 border border-green-200 dark:border-[#4ade80]/20 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-500/10 rounded-lg">
              <Users className="w-5 h-5 text-green-600 dark:text-[#4ade80]" />
            </div>
            <div>
              <p className="text-xs text-green-600 dark:text-[#d4b8a0]">Total</p>
              <p ref={el => countRefs.current.total = el} className="text-xl font-bold text-green-900 dark:text-[#f5e6d3]">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-black backdrop-blur-xl rounded-xl p-4 border border-green-200 dark:border-[#4ade80]/20 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-[#4ade80]" />
            </div>
            <div>
              <p className="text-xs text-green-600 dark:text-[#d4b8a0]">Active</p>
              <p ref={el => countRefs.current.active = el} className="text-xl font-bold text-green-900 dark:text-[#f5e6d3]">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-black backdrop-blur-xl rounded-xl p-4 border border-yellow-200 dark:border-yellow-500/20 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-yellow-600 dark:text-[#d4b8a0]">Pending</p>
              <p ref={el => countRefs.current.pending = el} className="text-xl font-bold text-yellow-900 dark:text-[#f5e6d3]">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-black backdrop-blur-xl rounded-xl p-4 border border-purple-200 dark:border-purple-500/20 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-500/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-purple-600 dark:text-[#d4b8a0]">Review</p>
              <p ref={el => countRefs.current.review = el} className="text-xl font-bold text-purple-900 dark:text-[#f5e6d3]">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-black backdrop-blur-xl rounded-xl p-4 border border-red-200 dark:border-red-500/20 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-500/10 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-red-600 dark:text-[#d4b8a0]">Expired</p>
              <p ref={el => countRefs.current.expired = el} className="text-xl font-bold text-red-900 dark:text-[#f5e6d3]">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-black backdrop-blur-xl rounded-xl p-4 border border-gray-200 dark:border-gray-500/20 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-500/10 rounded-lg">
              <XCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-[#d4b8a0]">Cancelled</p>
              <p ref={el => countRefs.current.cancelled = el} className="text-xl font-bold text-gray-900 dark:text-[#f5e6d3]">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Chart */}
        <div className="bg-white dark:bg-black backdrop-blur-xl rounded-xl p-6 border border-green-200 dark:border-[#4ade80]/20 shadow-sm">
          <h3 className="text-sm font-semibold text-green-700 dark:text-[#f5e6d3] mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-green-600 dark:text-[#4ade80]" />
            Monthly Subscriptions
          </h3>
          <div className="h-48 flex items-end gap-2">
            {analytics.monthlyData.map((item, index) => {
              const max = Math.max(...analytics.monthlyData.map(d => d.count));
              const height = (item.count / max) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full bg-green-200 dark:bg-[#4ade80]/20 rounded-t transition-all duration-500 hover:bg-green-300 dark:hover:bg-[#4ade80]/40"
                    style={{ height: `${height}%`, minHeight: '4px' }}
                  >
                    <div 
                      className="w-full h-full bg-gradient-to-t from-green-600 to-green-400 dark:from-[#4ade80] dark:to-[#4ade80]/60 rounded-t opacity-80"
                      style={{ height: `${height}%`, minHeight: '4px' }}
                    />
                  </div>
                  <span className="text-xs text-green-600 dark:text-[#d4b8a0]">{item.month}</span>
                  <span className="text-xs font-semibold text-green-700 dark:text-[#f5e6d3]">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="bg-white dark:bg-black backdrop-blur-xl rounded-xl p-6 border border-green-200 dark:border-[#4ade80]/20 shadow-sm">
          <h3 className="text-sm font-semibold text-green-700 dark:text-[#f5e6d3] mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-green-600 dark:text-[#4ade80]" />
            Plan Distribution
          </h3>
          <div className="flex items-center justify-center gap-8">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {analytics.planData.reduce((acc, item, index) => {
                  const total = analytics.planData.reduce((sum, d) => sum + d.value, 0);
                  const percentage = (item.value / total) * 100;
                  const startAngle = acc;
                  const endAngle = startAngle + (percentage / 100) * 360;
                  
                  const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                  const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                  const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
                  const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
                  
                  const largeArc = percentage > 50 ? 1 : 0;
                  
                  const colors = ['#4ade80', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];
                  
                  const path = (
                    <path
                      key={index}
                      d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                      fill={colors[index % colors.length]}
                      className="transition-all duration-500 hover:opacity-80 cursor-pointer"
                    />
                  );
                  
                  acc.push(path);
                  return [...acc, endAngle];
                }, [])}
                <circle cx="50" cy="50" r="20" fill="white" className="dark:fill-[#0a0505]" />
              </svg>
            </div>
            <div className="space-y-2">
              {analytics.planData.map((item, index) => {
                const colors = ['#4ade80', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];
                const total = analytics.planData.reduce((sum, d) => sum + d.value, 0);
                const percentage = Math.round((item.value / total) * 100);
                return (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                    <span className="text-sm text-green-600 dark:text-[#d4b8a0]">{item.name}</span>
                    <span className="text-sm font-semibold text-green-700 dark:text-[#f5e6d3]">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-black backdrop-blur-xl rounded-xl p-4 border border-green-200 dark:border-[#4ade80]/20 mb-6 shadow-sm">
        <div className="space-y-3">
          {/* Row 1: Search by Name/Email/Plan */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 dark:text-[#d4b8a0]" />
              <input
                type="text"
                placeholder="Search by name, email, plan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-green-50 dark:bg-[#0a0505] border border-green-200 dark:border-[#4ade80]/20 rounded-lg text-green-900 dark:text-[#f5e6d3] placeholder-green-500 dark:placeholder-[#d4b8a0]/40 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-[#4ade80]"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 dark:text-[#d4b8a0]" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="pl-10 pr-3 py-2 bg-green-50 dark:bg-[#0a0505] border border-green-200 dark:border-[#4ade80]/20 rounded-lg text-green-900 dark:text-[#f5e6d3] focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-[#4ade80]"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 dark:text-[#d4b8a0]" />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="pl-10 pr-3 py-2 bg-green-50 dark:bg-[#0a0505] border border-green-200 dark:border-[#4ade80]/20 rounded-lg text-green-900 dark:text-[#f5e6d3] focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-[#4ade80]"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Search by Invoice ID / Transaction ID */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 dark:text-[#d4b8a0]" />
              <input
                type="text"
                placeholder="Search by Invoice ID (e.g., INV-ABC12345) or Transaction ID..."
                value={invoiceSearchTerm}
                onChange={(e) => setInvoiceSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-green-50 dark:bg-[#0a0505] border border-green-200 dark:border-[#4ade80]/20 rounded-lg text-green-900 dark:text-[#f5e6d3] placeholder-green-500 dark:placeholder-[#d4b8a0]/40 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-[#4ade80]"
              />
              {invoiceSearchTerm && (
                <button
                  onClick={() => setInvoiceSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center text-xs text-green-600 dark:text-[#d4b8a0]/60 whitespace-nowrap">
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                Search by Invoice ID or Transaction ID
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Status Tabs */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-green-600 dark:text-[#d4b8a0]/60 uppercase tracking-wider mb-2 flex items-center gap-2">
          <FileText className="w-3.5 h-3.5" />
          Subscription Status
        </h4>
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-1.5 capitalize ${
                filter === tab.id
                  ? 'bg-green-600 dark:bg-[#4ade80] text-white dark:text-[#0a0505] shadow-lg shadow-green-600/30 dark:shadow-[#4ade80]/30'
                  : 'bg-green-50 dark:bg-[#1a0a0a]/40 text-green-600 dark:text-[#d4b8a0] hover:bg-green-100 dark:hover:bg-[#1a0a0a] border border-green-200 dark:border-[#4ade80]/20'
              }`}
            >
              {tab.icon}
              {tab.label}
              <span className={`ml-1 text-xs ${filter === tab.id ? 'opacity-100' : 'opacity-70'}`}>
                ({tab.count})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Status Tabs */}
      <div className="mb-6">
        <h4 className="text-xs font-semibold text-green-600 dark:text-[#d4b8a0]/60 uppercase tracking-wider mb-2 flex items-center gap-2">
          <CreditCard className="w-3.5 h-3.5" />
          Payment Status
        </h4>
        <div className="flex flex-wrap gap-2">
          {paymentTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-1.5 capitalize ${
                filter === tab.id
                  ? 'bg-green-600 dark:bg-[#4ade80] text-white dark:text-[#0a0505] shadow-lg shadow-green-600/30 dark:shadow-[#4ade80]/30'
                  : 'bg-green-50 dark:bg-[#1a0a0a]/40 text-green-600 dark:text-[#d4b8a0] hover:bg-green-100 dark:hover:bg-[#1a0a0a] border border-green-200 dark:border-[#4ade80]/20'
              }`}
            >
              {tab.icon}
              {tab.label}
              <span className={`ml-1 text-xs ${filter === tab.id ? 'opacity-100' : 'opacity-70'}`}>
                ({tab.count})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Subscriber Cards */}
      {filteredSubscribers.length === 0 ? (
        <div className="bg-white dark:bg-[#1a0a0a]/40 backdrop-blur-xl rounded-xl p-12 text-center border border-green-200 dark:border-[#4ade80]/20">
          <Users className="w-16 h-16 text-green-300 dark:text-[#d4b8a0]/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-700 dark:text-[#f5e6d3]">No subscribers found</h3>
          <p className="text-green-600 dark:text-[#d4b8a0]">Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSubscribers.map((subscriber) => (
            <SubscriberCard
              key={subscriber._id}
              subscriber={subscriber}
              onStatusUpdate={handleStatusUpdate}
              onPaymentUpdate={handlePaymentUpdate}
              onViewInvoice={handleViewInvoice}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showStatusModal && selectedSubscriber && (
        <SubscribeStatus
          subscriber={selectedSubscriber}
          onClose={handleStatusModalClose}
          onUpdate={handleStatusModalClose}
        />
      )}

      {showPaymentModal && selectedSubscriber && (
        <PaymentUpdate
          subscriber={selectedSubscriber}
          onClose={handlePaymentModalClose}
          onUpdate={handlePaymentModalClose}
        />
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-black rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-[#4ade80]/20 shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-black p-6 border-b border-gray-200 dark:border-[#4ade80]/10 flex items-center justify-between rounded-t-2xl z-10">
              <div className="flex items-center gap-3">
                <File className="w-6 h-6 text-green-600 dark:text-[#4ade80]" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-[#f5e6d3]">
                    Invoice Details
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-[#d4b8a0]">
                    {selectedSubscriber?.planName || 'Subscription Invoice'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleInvoiceModalClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#c8963e]/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {loadingInvoice ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 dark:border-[#4ade80] border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-[#d4b8a0]">Loading invoice data...</p>
                  </div>
                </div>
              ) : invoiceData ? (
                <div className="space-y-6">
                  {/* Invoice Header */}
                  <div className="flex justify-between items-start pb-4 border-b border-gray-200 dark:border-[#4ade80]/10">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-[#d4b8a0]">Invoice ID</p>
                      <p className="font-semibold text-gray-900 dark:text-[#f5e6d3]">{invoiceData.invoiceId || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-[#d4b8a0]">Date</p>
                      <p className="font-semibold text-gray-900 dark:text-[#f5e6d3]">
                        {invoiceData.generatedDate ? new Date(invoiceData.generatedDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-[#d4b8a0]">Billing Information</p>
                      <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-[#d4b8a0]">
                        <p><span className="font-medium">Name:</span> {invoiceData.user?.name || 'N/A'}</p>
                        <p><span className="font-medium">Email:</span> {invoiceData.user?.email || 'N/A'}</p>
                        <p><span className="font-medium">Phone:</span> {invoiceData.user?.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-[#d4b8a0]">Plan Details</p>
                      <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-[#d4b8a0]">
                        <p><span className="font-medium">Plan:</span> {invoiceData.subscription?.title || invoiceData.payment?.planName || 'N/A'}</p>
                        <p><span className="font-medium">Transaction ID:</span> {invoiceData.payment?.transactionId || 'N/A'}</p>
                        <p><span className="font-medium">Payment Status:</span> 
                          <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            invoiceData.payment?.paymentStatus === 'success' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' 
                              : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                          }`}>
                            {invoiceData.payment?.paymentStatus || 'N/A'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Breakdown */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-[#d4b8a0] mb-2">Payment Breakdown</p>
                    <div className="bg-gray-50 dark:bg-[#0a0505] rounded-xl p-4 space-y-2 border border-gray-200 dark:border-[#4ade80]/10">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-[#d4b8a0]">Subtotal</span>
                        <span className="font-medium text-gray-900 dark:text-[#f5e6d3]">₹{invoiceData.financialBreakdown?.subtotal || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-[#d4b8a0]">Discount</span>
                        <span className="font-medium text-red-600 dark:text-red-400">-₹{invoiceData.financialBreakdown?.discount || 0}</span>
                      </div>
                      <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200 dark:border-[#4ade80]/10">
                        <span className="text-gray-900 dark:text-[#f5e6d3]">Total</span>
                        <span className="text-green-600 dark:text-[#4ade80]">₹{invoiceData.financialBreakdown?.total || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Status */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-[#d4b8a0] mb-2">Subscription Details</p>
                    <div className="bg-gray-50 dark:bg-[#0a0505] rounded-xl p-4 space-y-2 border border-gray-200 dark:border-[#4ade80]/10">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-[#d4b8a0]">Status</span>
                        <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${
                          invoiceData.subscriptionDetails?.subscriptionStatus === 'active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                            : invoiceData.subscriptionDetails?.subscriptionStatus === 'expired'
                            ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
                        }`}>
                          {invoiceData.subscriptionDetails?.subscriptionStatus?.toUpperCase() || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-[#d4b8a0]">Start Date</span>
                        <span className="font-medium text-gray-900 dark:text-[#f5e6d3]">
                          {invoiceData.subscriptionDetails?.startDate ? new Date(invoiceData.subscriptionDetails.startDate).toLocaleDateString('en-IN') : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-[#d4b8a0]">End Date</span>
                        <span className="font-medium text-gray-900 dark:text-[#f5e6d3]">
                          {invoiceData.subscriptionDetails?.endDate ? new Date(invoiceData.subscriptionDetails.endDate).toLocaleDateString('en-IN') : 'N/A'}
                        </span>
                      </div>
                      {invoiceData.additionalInfo?.remainingDays !== null && invoiceData.additionalInfo?.remainingDays !== undefined && (
                        <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-[#4ade80]/10">
                          <span className="text-gray-600 dark:text-[#d4b8a0]">Remaining Days</span>
                          <span className={`font-medium ${
                            invoiceData.additionalInfo.remainingDays > 7 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {invoiceData.additionalInfo.remainingDays} days
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Invoice Note */}
                  {invoiceData.invoiceNote && (
                    <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-4 border border-blue-200 dark:border-blue-500/20">
                      <p className="text-sm text-gray-700 dark:text-[#d4b8a0] italic">
                        {invoiceData.invoiceNote}
                      </p>
                    </div>
                  )}

                  {/* Download Button */}
                  <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-[#4ade80]/10">
                    <button
                      onClick={handleDownloadInvoice}
                      disabled={downloadingInvoice}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 dark:from-[#4ade80] dark:to-[#34d399] hover:from-green-700 hover:to-green-600 dark:hover:from-[#34d399] dark:hover:to-[#4ade80] text-white dark:text-[#0a0505] font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-600/30 dark:hover:shadow-[#4ade80]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloadingInvoice ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white dark:border-[#0a0505] border-t-transparent"></div>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          Download Invoice
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-[#d4b8a0]">No invoice data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscribers;