// pages/user/MyBill.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Download, Eye, Search, Calendar, Filter, 
  ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, 
  AlertCircle, CreditCard, User, Mail, Phone, 
  Calendar as CalendarIcon, Loader2, File, X,
  TrendingUp, Award, Star, Shield, BookOpen, DollarSign,
  Receipt, Printer,
  IndianRupee
} from 'lucide-react';
import { useAuth } from '../../context/authContext';
import authService from '../../services/auth.service';
import toast from 'react-hot-toast';
import { generateInvoicePDF } from '../../helper/generateInvoicePdf';

const MyBill = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    failed: 0,
    totalAmount: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [expandedId, setExpandedId] = useState(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      toast.error('Please login to view your invoices');
      navigate('/auth/signin');
      return;
    }
    fetchInvoices();
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    applyFilters();
  }, [invoices, searchTerm, statusFilter, dateRange]);

  const fetchInvoices = async (page = 1) => {
    try {
      setLoading(true);
      const response = await authService.getAllInvoices({
        page,
        limit: pagination.limit,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      
      if (response?.success) {
        setInvoices(response.data.invoices || []);
        setPagination({
          page: response.data.pagination.page,
          limit: response.data.pagination.limit,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages
        });
        calculateStats(response.data.invoices || []);
      } else {
        toast.error(response?.message || 'Failed to fetch invoices');
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error(error.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const success = data.filter(i => i.paymentStatus === 'success').length;
    const failed = data.filter(i => i.paymentStatus === 'failed').length;
    const totalAmount = data.reduce((sum, i) => sum + (i.amount || 0), 0);
    setStats({ total, success, failed, totalAmount });
  };

  const applyFilters = () => {
    let filtered = [...invoices];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(i => 
        i.invoiceId?.toLowerCase().includes(term) ||
        i.planName?.toLowerCase().includes(term) ||
        i.transactionId?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(i => i.paymentStatus === statusFilter);
    }

    // Date filter
    if (dateRange.start) {
      const start = new Date(dateRange.start);
      filtered = filtered.filter(i => new Date(i.paymentDate) >= start);
    }
    if (dateRange.end) {
      const end = new Date(dateRange.end);
      end.setHours(23, 59, 59);
      filtered = filtered.filter(i => new Date(i.paymentDate) <= end);
    }

    setFilteredInvoices(filtered);
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

  const getPaymentStatusBadge = (status) => {
    const configs = {
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-500', border: 'border-yellow-500/30', icon: Clock },
      review: { bg: 'bg-purple-500/20', text: 'text-purple-500', border: 'border-purple-500/30', icon: AlertCircle },
      success: { bg: 'bg-[#4ade80]/20', text: 'text-[#4ade80]', border: 'border-[#4ade80]/30', icon: CheckCircle },
      failed: { bg: 'bg-red-500/20', text: 'text-red-500', border: 'border-red-500/30', icon: XCircle }
    };
    return configs[status] || configs.pending;
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

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleViewInvoice = async (invoice) => {
    try {
      setLoadingInvoice(true);
      setShowInvoiceModal(true);
      const response = await authService.getInvoice(invoice.subscriberId);
      if (response?.success && response?.data) {
        setInvoiceData(response.data);
        setViewingInvoice(invoice);
      } else {
        toast.error(response?.message || 'Failed to fetch invoice details');
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

  const handleDownloadInvoice = async (subscriberId) => {
    try {
      setDownloadingInvoice(subscriberId);
      const response = await authService.getInvoice(subscriberId);
      if (response?.success && response?.data) {
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

  const handleDownloadFromModal = async () => {
    if (!invoiceData) return;
    try {
      setDownloadingInvoice('modal');
      await generateInvoicePDF(invoiceData);
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    } finally {
      setDownloadingInvoice(null);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchInvoices(newPage);
    }
  };

  // Loading State
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0a0505] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#c8963e] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-[#d4b8a0] font-medium">
            {authLoading ? 'Checking authentication...' : 'Loading your invoices...'}
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
            <span className="flex items-center px-4 py-1.5 rounded-full bg-[#c8963e]/10 border border-[#c8963e]/20 
                           text-[#d4a85a] text-xs sm:text-sm font-semibold tracking-wider uppercase
                           backdrop-blur-sm">
             <IndianRupee size={18}/> My Bills
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#f5e6d3]">
            Your <span className="text-[#d4a85a]">Invoices</span>
          </h1>
          <p className="mt-2 text-[#d4b8a0]">
            View and download all your subscription invoices
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1a0a0a]/60 backdrop-blur-xl rounded-xl p-4 border border-[#c8963e]/20 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#c8963e]/10 rounded-lg">
                <Receipt className="w-5 h-5 text-[#d4a85a]" />
              </div>
              <div>
                <p className="text-xs text-[#d4b8a0]">Total Invoices</p>
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
                <p className="text-xs text-[#d4b8a0]">Paid</p>
                <p className="text-2xl font-bold text-[#4ade80]">{stats.success}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a0a0a]/60 backdrop-blur-xl rounded-xl p-4 border border-red-500/20 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-[#d4b8a0]">Failed</p>
                <p className="text-2xl font-bold text-red-500">{stats.failed}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a0a0a]/60 backdrop-blur-xl rounded-xl p-4 border border-[#d4a85a]/20 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#d4a85a]/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-[#d4a85a]" />
              </div>
              <div>
                <p className="text-xs text-[#d4b8a0]">Total Spent</p>
                <p className="text-2xl font-bold text-[#d4a85a]">₹{stats.totalAmount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#1a0a0a]/60 backdrop-blur-xl rounded-xl p-4 border border-[#c8963e]/20 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4b8a0]/50" />
              <input
                type="text"
                placeholder="Search by Invoice ID, Plan, or Transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#0a0505] border border-[#c8963e]/20 rounded-lg text-[#f5e6d3] placeholder-[#d4b8a0]/40 focus:outline-none focus:ring-2 focus:ring-[#c8963e]"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-[#0a0505] border border-[#c8963e]/20 rounded-lg text-[#f5e6d3] focus:outline-none focus:ring-2 focus:ring-[#c8963e]"
              >
                <option value="all">All Status</option>
                <option value="success">Paid</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
                <option value="review">Review</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4b8a0]/50" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="pl-10 pr-3 py-2 bg-[#0a0505] border border-[#c8963e]/20 rounded-lg text-[#f5e6d3] focus:outline-none focus:ring-2 focus:ring-[#c8963e]"
              />
            </div>
            <span className="text-[#d4b8a0] self-center">to</span>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4b8a0]/50" />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="pl-10 pr-3 py-2 bg-[#0a0505] border border-[#c8963e]/20 rounded-lg text-[#f5e6d3] focus:outline-none focus:ring-2 focus:ring-[#c8963e]"
              />
            </div>
            {(dateRange.start || dateRange.end) && (
              <button
                onClick={() => setDateRange({ start: '', end: '' })}
                className="text-[#d4b8a0] hover:text-[#f5e6d3] text-sm flex items-center gap-1"
              >
                <X className="w-4 h-4" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Invoices List */}
        {filteredInvoices.length === 0 ? (
          <div className="bg-[#1a0a0a]/40 backdrop-blur-xl rounded-2xl p-16 text-center border border-[#c8963e]/20 shadow-xl">
            <Receipt className="w-20 h-20 text-[#c8963e]/30 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-[#f5e6d3] mb-2">
              No Invoices Found
            </h3>
            <p className="text-[#d4b8a0]">
              {searchTerm || statusFilter !== 'all' || dateRange.start || dateRange.end
                ? 'No invoices match your search filters'
                : 'You haven\'t generated any invoices yet'}
            </p>
            {(searchTerm || statusFilter !== 'all' || dateRange.start || dateRange.end) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setDateRange({ start: '', end: '' });
                }}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-[#c8963e] to-[#d4a85a] hover:from-[#b8860b] hover:to-[#c8963e] text-[#0a0505] font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#c8963e]/30"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => {
              const isExpanded = expandedId === invoice.subscriberId;
              const paymentStatus = invoice.paymentStatus || 'pending';
              const statusConfig = getPaymentStatusBadge(paymentStatus);
              const StatusIcon = statusConfig.icon;
              const subStatusConfig = getSubscriptionStatusBadge(invoice.subscriptionStatus);

              return (
                <div 
                  key={invoice.subscriberId}
                  className="bg-[#1a0a0a]/60 backdrop-blur-xl rounded-xl border border-[#c8963e]/20 shadow-sm hover:shadow-[#c8963e]/10 transition-all duration-300 overflow-hidden"
                >
                  {/* Card Header */}
                  <div 
                    className="p-4 sm:p-6 cursor-pointer hover:bg-[#c8963e]/5 transition-colors"
                    onClick={() => toggleExpand(invoice.subscriberId)}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-[#c8963e]/10 border border-[#c8963e]/20 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-[#d4a85a]" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-[#f5e6d3] truncate">
                            {invoice.invoiceId}
                          </h4>
                          <p className="text-sm text-[#d4b8a0] truncate">
                            {invoice.planName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${subStatusConfig}`}>
                          {invoice.subscriptionStatus?.charAt(0).toUpperCase() + invoice.subscriptionStatus?.slice(1) || 'N/A'}
                        </span>
                        <span className="text-lg font-bold text-[#d4a85a]">
                          ₹{invoice.amount || 0}
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-[#0a0505]/50 rounded-xl p-4 border border-[#c8963e]/10">
                          <h5 className="text-xs font-semibold text-[#d4b8a0]/60 uppercase tracking-wider flex items-center gap-2 mb-3">
                            <CalendarIcon className="w-3.5 h-3.5 text-[#d4a85a]" />
                            Invoice Details
                          </h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-[#d4b8a0]">Invoice ID</span>
                              <span className="font-medium text-[#f5e6d3]">{invoice.invoiceId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#d4b8a0]">Plan</span>
                              <span className="font-medium text-[#f5e6d3]">{invoice.planName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#d4b8a0]">Amount</span>
                              <span className="font-medium text-[#d4a85a]">₹{invoice.amount || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#d4b8a0]">Payment Date</span>
                              <span className="font-medium text-[#f5e6d3]">{formatDateTime(invoice.paymentDate)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-[#0a0505]/50 rounded-xl p-4 border border-[#c8963e]/10">
                          <h5 className="text-xs font-semibold text-[#d4b8a0]/60 uppercase tracking-wider flex items-center gap-2 mb-3">
                            <CreditCard className="w-3.5 h-3.5 text-[#d4a85a]" />
                            Payment & Subscription
                          </h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-[#d4b8a0]">Transaction ID</span>
                              <span className="font-medium text-[#f5e6d3] font-mono text-xs">
                                {invoice.transactionId || 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#d4b8a0]">Payment Status</span>
                              <span className={`font-medium flex items-center gap-1.5 ${statusConfig.bg} ${statusConfig.text} px-2 py-0.5 rounded-full text-xs border ${statusConfig.border}`}>
                                <StatusIcon className="w-3 h-3" />
                                {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#d4b8a0]">Subscription Status</span>
                              <span className={`font-medium px-2 py-0.5 rounded-full text-xs border ${subStatusConfig}`}>
                                {invoice.subscriptionStatus?.charAt(0).toUpperCase() + invoice.subscriptionStatus?.slice(1) || 'N/A'}
                              </span>
                            </div>
                            {invoice.startDate && invoice.endDate && (
                              <div className="flex justify-between">
                                <span className="text-[#d4b8a0]">Validity</span>
                                <span className="font-medium text-[#f5e6d3] text-xs">
                                  {formatDate(invoice.startDate)} - {formatDate(invoice.endDate)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 justify-end pt-2">
                        <button
                          onClick={() => handleViewInvoice(invoice)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium transition-colors border border-blue-500/20"
                        >
                          <Eye className="w-4 h-4" />
                          View Invoice
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(invoice.subscriberId)}
                          disabled={downloadingInvoice === invoice.subscriberId}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#c8963e] to-[#d4a85a] hover:from-[#b8860b] hover:to-[#c8963e] text-[#0a0505] rounded-lg text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-[#c8963e]/30 disabled:opacity-50"
                        >
                          {downloadingInvoice === invoice.subscriberId ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              Download PDF
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 bg-[#1a0a0a]/60 border border-[#c8963e]/20 rounded-lg text-[#d4b8a0] hover:bg-[#1a0a0a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-[#d4b8a0] text-sm">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 bg-[#1a0a0a]/60 border border-[#c8963e]/20 rounded-lg text-[#d4b8a0] hover:bg-[#1a0a0a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* Trust Badges */}
        {filteredInvoices.length > 0 && (
          <div className="mt-12 text-center">
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
              <div className="flex items-center gap-2 text-[#d4b8a0] text-sm">
                <Shield className="w-4 h-4 text-[#d4a85a]" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2 text-[#d4b8a0] text-sm">
                <FileText className="w-4 h-4 text-[#d4a85a]" />
                <span>Verified Invoices</span>
              </div>
              <div className="flex items-center gap-2 text-[#d4b8a0] text-sm">
                <Printer className="w-4 h-4 text-[#d4a85a]" />
                <span>Downloadable PDF</span>
              </div>
              <div className="flex items-center gap-2 text-[#d4b8a0] text-sm">
                <TrendingUp className="w-4 h-4 text-[#d4a85a]" />
                <span>Track Your Bills</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invoice View Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a0a0a] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#c8963e]/20 shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#1a0a0a] p-6 border-b border-[#c8963e]/10 flex items-center justify-between rounded-t-2xl z-10">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-[#d4a85a]" />
                <div>
                  <h3 className="text-xl font-bold text-[#f5e6d3]">
                    Invoice Details
                  </h3>
                  <p className="text-sm text-[#d4b8a0]">
                    {viewingInvoice?.invoiceId || 'Subscription Invoice'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowInvoiceModal(false);
                  setInvoiceData(null);
                  setViewingInvoice(null);
                }}
                className="text-[#d4b8a0] hover:text-white transition-colors p-1 rounded-lg hover:bg-[#c8963e]/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {loadingInvoice ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#c8963e] border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-[#d4b8a0]">Loading invoice data...</p>
                  </div>
                </div>
              ) : invoiceData ? (
                <div className="space-y-6">
                  {/* Invoice Header */}
                  <div className="flex justify-between items-start pb-4 border-b border-[#c8963e]/10">
                    <div>
                      <p className="text-sm text-[#d4b8a0]">Invoice ID</p>
                      <p className="font-semibold text-[#f5e6d3]">{invoiceData.invoiceId || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#d4b8a0]">Date</p>
                      <p className="font-semibold text-[#f5e6d3]">
                        {invoiceData.generatedDate ? formatDate(invoiceData.generatedDate) : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[#d4b8a0]">Billing Information</p>
                      <div className="mt-2 space-y-1 text-sm text-[#d4b8a0]">
                        <p><span className="font-medium">Name:</span> {invoiceData.user?.name || 'N/A'}</p>
                        <p><span className="font-medium">Email:</span> {invoiceData.user?.email || 'N/A'}</p>
                        <p><span className="font-medium">Phone:</span> {invoiceData.user?.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#d4b8a0]">Plan Details</p>
                      <div className="mt-2 space-y-1 text-sm text-[#d4b8a0]">
                        <p><span className="font-medium">Plan:</span> {invoiceData.subscription?.title || invoiceData.payment?.planName || 'N/A'}</p>
                        <p><span className="font-medium">Transaction ID:</span> {invoiceData.payment?.transactionId || 'N/A'}</p>
                        <p><span className="font-medium">Payment Status:</span> 
                          <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            invoiceData.payment?.paymentStatus === 'success' 
                              ? 'bg-[#4ade80]/20 text-[#4ade80]' 
                              : invoiceData.payment?.paymentStatus === 'failed'
                              ? 'bg-red-500/20 text-red-500'
                              : 'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {invoiceData.payment?.paymentStatus || 'N/A'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Breakdown */}
                  <div>
                    <p className="text-sm font-semibold text-[#d4b8a0] mb-2">Payment Breakdown</p>
                    <div className="bg-[#0a0505] rounded-xl p-4 space-y-2 border border-[#c8963e]/10">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#d4b8a0]">Subtotal</span>
                        <span className="font-medium text-[#f5e6d3]">₹{invoiceData.financialBreakdown?.subtotal || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#d4b8a0]">Discount</span>
                        <span className="font-medium text-red-400">-₹{invoiceData.financialBreakdown?.discount || 0}</span>
                      </div>
                      <div className="flex justify-between text-base font-bold pt-2 border-t border-[#c8963e]/10">
                        <span className="text-[#f5e6d3]">Total</span>
                        <span className="text-[#d4a85a]">₹{invoiceData.financialBreakdown?.total || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Status */}
                  <div>
                    <p className="text-sm font-semibold text-[#d4b8a0] mb-2">Subscription Details</p>
                    <div className="bg-[#0a0505] rounded-xl p-4 space-y-2 border border-[#c8963e]/10">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#d4b8a0]">Status</span>
                        <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${
                          invoiceData.subscriptionDetails?.subscriptionStatus === 'active'
                            ? 'bg-[#4ade80]/20 text-[#4ade80]'
                            : invoiceData.subscriptionDetails?.subscriptionStatus === 'expired'
                            ? 'bg-red-500/20 text-red-500'
                            : 'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {invoiceData.subscriptionDetails?.subscriptionStatus?.toUpperCase() || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#d4b8a0]">Start Date</span>
                        <span className="font-medium text-[#f5e6d3]">
                          {invoiceData.subscriptionDetails?.startDate ? formatDate(invoiceData.subscriptionDetails.startDate) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#d4b8a0]">End Date</span>
                        <span className="font-medium text-[#f5e6d3]">
                          {invoiceData.subscriptionDetails?.endDate ? formatDate(invoiceData.subscriptionDetails.endDate) : 'N/A'}
                        </span>
                      </div>
                      {invoiceData.additionalInfo?.remainingDays !== null && invoiceData.additionalInfo?.remainingDays !== undefined && (
                        <div className="flex justify-between text-sm pt-2 border-t border-[#c8963e]/10">
                          <span className="text-[#d4b8a0]">Remaining Days</span>
                          <span className={`font-medium ${
                            invoiceData.additionalInfo.remainingDays > 7 
                              ? 'text-[#4ade80]' 
                              : 'text-red-400'
                          }`}>
                            {invoiceData.additionalInfo.remainingDays} days
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Invoice Note */}
                  {invoiceData.invoiceNote && (
                    <div className="bg-[#c8963e]/10 rounded-xl p-4 border border-[#c8963e]/20">
                      <p className="text-sm text-[#d4b8a0] italic">
                        {invoiceData.invoiceNote}
                      </p>
                    </div>
                  )}

                  {/* Download Button */}
                  <div className="flex justify-end pt-4 border-t border-[#c8963e]/10">
                    <button
                      onClick={handleDownloadFromModal}
                      disabled={downloadingInvoice === 'modal'}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#c8963e] to-[#d4a85a] hover:from-[#b8860b] hover:to-[#c8963e] text-[#0a0505] font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#c8963e]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloadingInvoice === 'modal' ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
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
                  <p className="text-[#d4b8a0]">No invoice data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBill;