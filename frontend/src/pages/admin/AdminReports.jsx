// frontend/src/pages/admin/AdminReports.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import supportService from '../../services/support.service';
import ReportsUpdate from '../../components/admin/ReportsUpdate';
import { 
  FileText, Search, Filter, User, Mail, Calendar, 
  Tag, Copy, Check, Eye, ChevronDown, ChevronUp,
  RefreshCw, AlertCircle, BookOpen, Book, Server, HelpCircle,
  Users, Clock, CheckCircle, XCircle, AlertTriangle,
  ExternalLink, Copy as CopyIcon, TrendingUp, TrendingDown,
  Activity, BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminReports = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [stats, setStats] = useState({});
  const [allStats, setAllStats] = useState({});
  const [pagination, setPagination] = useState({});
  const [selectedStatus, setSelectedStatus] = useState('review');
  const [selectedType, setSelectedType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedReport, setExpandedReport] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [animatedStats, setAnimatedStats] = useState({});
  const [allAnimatedStats, setAllAnimatedStats] = useState({});

  const statusOptions = [
    { value: 'review', label: 'Under Review', icon: Clock, color: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30', bg: 'bg-yellow-500' },
    { value: 'serious', label: 'High Priority', icon: AlertTriangle, color: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30', bg: 'bg-red-500' },
    { value: 'mediate', label: 'Medium Priority', icon: AlertTriangle, color: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30', bg: 'bg-purple-500' },
    { value: 'basic', label: 'Basic Priority', icon: AlertCircle, color: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30', bg: 'bg-blue-500' },
    { value: 'resolved', label: 'Resolved', icon: CheckCircle, color: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30', bg: 'bg-green-500' }
  ];

  const reportTypes = [
    { value: 'book', label: 'Book', icon: Book, color: 'from-blue-500 to-blue-600' },
    { value: 'course', label: 'Course', icon: BookOpen, color: 'from-purple-500 to-purple-600' },
    { value: 'system', label: 'System', icon: Server, color: 'from-orange-500 to-orange-600' },
    { value: 'other', label: 'Other', icon: HelpCircle, color: 'from-gray-500 to-gray-600' }
  ];

  useEffect(() => {
    fetchAllReports();
    fetchFilteredReports();
  }, [selectedStatus, selectedType, searchTerm]);

  useEffect(() => {
    if (allStats.byStatus) {
      animateAllStats();
    }
    if (stats.byStatus) {
      animateStats();
    }
  }, [allStats, stats]);

  const fetchAllReports = async () => {
    try {
      const response = await supportService.getAllReports({ limit: 1000 });
      if (response.success) {
        setAllReports(response.data.reports);
        setAllStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching all reports:', error);
    }
  };

  const fetchFilteredReports = async () => {
    try {
      setLoading(true);
      const params = {
        status: selectedStatus,
        reportType: selectedType || undefined,
        search: searchTerm || undefined,
        page: 1,
        limit: 20
      };
      const response = await supportService.getAllReports(params);
      if (response.success) {
        setReports(response.data.reports);
        setStats(response.data.stats);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const animateAllStats = () => {
    const totals = {
      total: allReports.length || 0,
      ...allStats.byStatus
    };
    
    Object.keys(totals).forEach(key => {
      const target = totals[key] || 0;
      let current = 0;
      const increment = Math.ceil(target / 30);
      const interval = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        setAllAnimatedStats(prev => ({ ...prev, [key]: current }));
      }, 30);
    });
  };

  const animateStats = () => {
    const totals = {
      total: reports.length || 0,
      ...stats.byStatus
    };
    
    Object.keys(totals).forEach(key => {
      const target = totals[key] || 0;
      let current = 0;
      const increment = Math.ceil(target / 30);
      const interval = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        setAnimatedStats(prev => ({ ...prev, [key]: current }));
      }, 30);
    });
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTypeFilter = (type) => {
    setSelectedType(type === selectedType ? '' : type);
  };

  const handleUpdateStatus = (report) => {
    setSelectedReport(report);
    setShowUpdateModal(true);
  };

  const handleStatusUpdated = () => {
    setShowUpdateModal(false);
    fetchAllReports();
    fetchFilteredReports();
    toast.success('Report status updated successfully');
  };

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success(`${label} copied`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const navigateToUserProfile = (username, userId) => {
    if (username && userId) {
      navigate(`/admin/user-profile/${username}/${userId}`);
    }
  };

  const getStatusBadge = (status) => {
    const option = statusOptions.find(s => s.value === status);
    return option || statusOptions[0];
  };

  const getReportTypeIcon = (type) => {
    const found = reportTypes.find(t => t.value === type);
    return found ? found.icon : HelpCircle;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalReports = allReports.length || 0;
  const filteredTotal = reports.length || 0;

  return (
    <div className="min-h-screen bg-[#f0f7f0] dark:bg-[#0a0a0a] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1a3a1a] dark:text-white flex items-center gap-3">
              <div className="p-2.5 bg-[#22c55e]/10 rounded-xl">
                <FileText className="w-7 h-7 text-[#22c55e]" />
              </div>
              Reports Management
            </h1>
            <p className="text-[#2a5a2a] dark:text-gray-400 mt-1">
              Manage and track all user reports
            </p>
          </div>
          <button
            onClick={() => {
              fetchAllReports();
              fetchFilteredReports();
            }}
            className="px-5 py-2.5 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-[#22c55e]/25"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats Cards - Total Reports */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-6">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 border-2 border-[#22c55e] shadow-lg shadow-[#22c55e]/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[#22c55e] uppercase tracking-wider">Total Reports</p>
                <p className="text-3xl font-bold text-[#1a3a1a] dark:text-white mt-1">
                  {allAnimatedStats.total || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#22c55e] flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-2 w-full h-1.5 bg-[#22c55e]/20 rounded-full overflow-hidden">
              <div className="h-full bg-[#22c55e] rounded-full transition-all duration-1000" style={{ width: '100%' }} />
            </div>
            <p className="text-xs text-[#2a5a2a] dark:text-gray-400 mt-1">
              Showing {filteredTotal} filtered reports
            </p>
          </div>

          {statusOptions.map(status => {
            const count = allStats.byStatus?.[status.value] || 0;
            return (
              <div key={status.value} className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 border border-[#22c55e]/20 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-[#2a5a2a] dark:text-gray-400 uppercase tracking-wider">
                      {status.label.split(' ')[0]}
                    </p>
                    <p className="text-2xl font-bold text-[#1a3a1a] dark:text-white mt-1">
                      {allAnimatedStats[status.value] || 0}
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl ${status.color.split(' ')[0]} flex items-center justify-center`}>
                    <status.icon className={`w-5 h-5 ${status.color.split(' ')[1]}`} />
                  </div>
                </div>
                <div className="mt-2 w-full h-1 bg-[#22c55e]/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${status.bg} rounded-full transition-all duration-1000`} 
                    style={{ width: `${totalReports > 0 ? (count / totalReports) * 100 : 0}%` }} 
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-[#22c55e]/20 p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#22c55e]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search reports..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#f0f7f0] dark:bg-[#0a0a0a] border border-[#22c55e]/30 rounded-xl text-[#1a3a1a] dark:text-white placeholder-[#2a5a2a]/50 dark:placeholder-gray-500 focus:outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/20"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {reportTypes.map(type => {
                const Icon = type.icon;
                const isActive = selectedType === type.value;
                return (
                  <button
                    key={type.value}
                    onClick={() => handleTypeFilter(type.value)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border
                      ${isActive 
                        ? 'bg-[#22c55e] text-white border-[#22c55e] shadow-lg shadow-[#22c55e]/25' 
                        : 'bg-[#f0f7f0] dark:bg-[#0a0a0a] text-[#2a5a2a] dark:text-gray-400 border-[#22c55e]/20 hover:border-[#22c55e]/50 hover:bg-[#22c55e]/5'
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {type.label}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('');
                setSelectedStatus('review');
              }}
              className="px-4 py-2 bg-[#22c55e]/10 hover:bg-[#22c55e]/20 text-[#22c55e] rounded-xl font-medium transition-colors text-sm"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {statusOptions.map(status => {
            const count = allStats.byStatus?.[status.value] || 0;
            const isActive = selectedStatus === status.value;
            return (
              <button
                key={status.value}
                onClick={() => handleStatusFilter(status.value)}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 border
                  ${isActive 
                    ? 'bg-[#22c55e] text-white border-[#22c55e] shadow-lg shadow-[#22c55e]/25' 
                    : 'bg-white dark:bg-[#1a1a1a] text-[#1a3a1a] dark:text-gray-300 border-[#22c55e]/20 hover:border-[#22c55e]/50 hover:bg-[#22c55e]/5'
                  }`}
              >
                <status.icon className="w-4 h-4" />
                {status.label}
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold
                  ${isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-[#22c55e]/10 text-[#22c55e] dark:bg-[#22c55e]/20'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-[#22c55e]/20 border-t-[#22c55e] rounded-full animate-spin" />
            </div>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-[#22c55e]/20 p-12 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#22c55e]/10 flex items-center justify-center mb-4">
              <FileText className="w-10 h-10 text-[#22c55e]/40" />
            </div>
            <h3 className="text-xl font-semibold text-[#1a3a1a] dark:text-white mb-2">No Reports Found</h3>
            <p className="text-[#2a5a2a] dark:text-gray-400">No reports in this category</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              const status = getStatusBadge(report.status);
              const Icon = getReportTypeIcon(report.reportType);
              const isExpanded = expandedReport === report._id;

              return (
                <div
                  key={report._id}
                  className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-[#22c55e]/20 overflow-hidden transition-all hover:shadow-lg hover:border-[#22c55e]/40"
                >
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          <div className="px-2.5 py-1 rounded-lg bg-[#22c55e]/10 flex items-center gap-1.5">
                            <Icon className="w-4 h-4 text-[#22c55e]" />
                            <span className="text-xs font-medium text-[#22c55e] capitalize">
                              {report.reportType}
                            </span>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                            {status.label}
                          </span>
                          {report.relatedItem?.id && (
                            <span className="px-2.5 py-1 bg-[#22c55e]/5 border border-[#22c55e]/20 rounded-lg text-xs text-[#22c55e] font-mono flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {report.relatedItem.id}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-[#1a3a1a] dark:text-white">
                          {report.subject}
                        </h3>
                        <p className="text-[#2a5a2a] dark:text-gray-400 mt-1 line-clamp-2">
                          {report.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div 
                          className="flex items-center gap-2 text-sm text-[#2a5a2a] dark:text-gray-400 cursor-pointer hover:text-[#22c55e] transition-colors group"
                          onClick={() => navigateToUserProfile(
                            report.userId?.username,
                            report.userId?._id
                          )}
                        >
                          {report.userId?.profilePicture ? (
                            <img 
                              src={report.userId.profilePicture} 
                              alt={report.userId.name}
                              className="w-7 h-7 rounded-full object-cover border-2 border-[#22c55e]/30"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-[#22c55e]/10 flex items-center justify-center border-2 border-[#22c55e]/30">
                              <User className="w-3.5 h-3.5 text-[#22c55e]" />
                            </div>
                          )}
                          <span className="group-hover:text-[#22c55e]">{report.userId?.name || 'Unknown'}</span>
                          <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#2a5a2a] dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(report.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-[#22c55e]/10 space-y-3">
                        {/* Description Box */}
                        <div className="p-3 bg-[#f0f7f0] dark:bg-[#0a0a0a] rounded-xl border border-[#22c55e]/10">
                          <h4 className="text-xs font-semibold text-[#22c55e] uppercase tracking-wider mb-1.5 flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5" />
                            Description
                          </h4>
                          <p className="text-[#1a3a1a] dark:text-gray-300 text-sm">{report.description}</p>
                        </div>
                        
                        {/* Related Item */}
                        {report.relatedItem?.name && (
                          <div className="p-3 bg-[#f0f7f0] dark:bg-[#0a0a0a] rounded-xl border border-[#22c55e]/10">
                            <h4 className="text-xs font-semibold text-[#22c55e] uppercase tracking-wider mb-1.5 flex items-center gap-2">
                              <Tag className="w-3.5 h-3.5" />
                              Related Item
                            </h4>
                            <div className="flex items-center gap-3">
                              <span className="text-[#1a3a1a] dark:text-gray-300 text-sm font-medium">{report.relatedItem.name}</span>
                              {report.relatedItem.id && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs text-[#2a5a2a] dark:text-gray-500 font-mono bg-white dark:bg-[#1a1a1a] px-2 py-0.5 rounded border border-[#22c55e]/20">
                                    {report.relatedItem.id}
                                  </span>
                                  <button
                                    onClick={() => copyToClipboard(report.relatedItem.id, 'Item ID')}
                                    className="p-1 hover:bg-[#22c55e]/10 rounded transition-colors"
                                  >
                                    {copiedId === report.relatedItem.id ? (
                                      <Check className="w-3.5 h-3.5 text-[#22c55e]" />
                                    ) : (
                                      <CopyIcon className="w-3.5 h-3.5 text-[#22c55e]" />
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* User Details */}
                        <div className="p-3 bg-[#f0f7f0] dark:bg-[#0a0a0a] rounded-xl border border-[#22c55e]/10">
                          <h4 className="text-xs font-semibold text-[#22c55e] uppercase tracking-wider mb-1.5 flex items-center gap-2">
                            <User className="w-3.5 h-3.5" />
                            Reported By
                          </h4>
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <div 
                              className="flex items-center gap-2 text-[#1a3a1a] dark:text-gray-300 cursor-pointer hover:text-[#22c55e] transition-colors group"
                              onClick={() => navigateToUserProfile(
                                report.userId?.username,
                                report.userId?._id
                              )}
                            >
                              {report.userId?.profilePicture ? (
                                <img 
                                  src={report.userId.profilePicture} 
                                  alt={report.userId.name}
                                  className="w-6 h-6 rounded-full object-cover border border-[#22c55e]/30"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-[#22c55e]/10 flex items-center justify-center border border-[#22c55e]/30">
                                  <User className="w-3 h-3 text-[#22c55e]" />
                                </div>
                              )}
                              <span className="font-medium group-hover:text-[#22c55e]">{report.userId?.name}</span>
                              <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                            </div>
                            <span className="text-[#22c55e]/30">|</span>
                            <div className="flex items-center gap-1.5 text-[#2a5a2a] dark:text-gray-400">
                              <Mail className="w-3.5 h-3.5 text-[#22c55e]/60" />
                              <span>{report.userId?.email}</span>
                            </div>
                            {report.userId?._id && (
                              <>
                                <span className="text-[#22c55e]/30">|</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs text-[#2a5a2a] dark:text-gray-500 font-mono bg-white dark:bg-[#1a1a1a] px-2 py-0.5 rounded border border-[#22c55e]/20">
                                    ID: {report.userId._id.slice(0, 8)}...
                                  </span>
                                  <button
                                    onClick={() => copyToClipboard(report.userId._id, 'User ID')}
                                    className="p-1 hover:bg-[#22c55e]/10 rounded transition-colors"
                                  >
                                    {copiedId === report.userId._id ? (
                                      <Check className="w-3.5 h-3.5 text-[#22c55e]" />
                                    ) : (
                                      <CopyIcon className="w-3.5 h-3.5 text-[#22c55e]" />
                                    )}
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Timeline */}
                        <div className="p-3 bg-[#f0f7f0] dark:bg-[#0a0a0a] rounded-xl border border-[#22c55e]/10">
                          <h4 className="text-xs font-semibold text-[#22c55e] uppercase tracking-wider mb-1.5 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            Timeline
                          </h4>
                          <div className="flex flex-wrap gap-4 text-sm text-[#2a5a2a] dark:text-gray-400">
                            <span>Created: {formatDate(report.createdAt)}</span>
                            <span className="text-[#22c55e]/30">|</span>
                            <span>Updated: {formatDate(report.updatedAt)}</span>
                          </div>
                        </div>

                        {/* Update Status Button */}
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleUpdateStatus(report)}
                            className="px-5 py-2.5 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-[#22c55e]/25"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Update Status
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#22c55e]/10">
                      <button
                        onClick={() => setExpandedReport(isExpanded ? null : report._id)}
                        className="text-sm text-[#22c55e] hover:text-[#16a34a] font-medium flex items-center gap-1 transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            View Details
                          </>
                        )}
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#2a5a2a]/50 dark:text-gray-500 font-mono">
                          #{report._id.slice(0, 8)}
                        </span>
                        <button
                          onClick={() => copyToClipboard(report._id, 'Report ID')}
                          className="p-1 hover:bg-[#22c55e]/10 rounded transition-colors"
                        >
                          {copiedId === report._id ? (
                            <Check className="w-3.5 h-3.5 text-[#22c55e]" />
                          ) : (
                            <CopyIcon className="w-3.5 h-3.5 text-[#22c55e]" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={!pagination.hasPrev}
              className="px-5 py-2.5 bg-white dark:bg-[#1a1a1a] border border-[#22c55e]/20 rounded-xl text-[#1a3a1a] dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#22c55e] hover:bg-[#22c55e]/5 transition-all"
            >
              Previous
            </button>
            <span className="px-5 py-2.5 bg-[#22c55e] text-white rounded-xl font-medium">
              {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={!pagination.hasNext}
              className="px-5 py-2.5 bg-white dark:bg-[#1a1a1a] border border-[#22c55e]/20 rounded-xl text-[#1a3a1a] dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#22c55e] hover:bg-[#22c55e]/5 transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Update Modal */}
      {showUpdateModal && selectedReport && (
        <ReportsUpdate
          report={selectedReport}
          onClose={() => setShowUpdateModal(false)}
          onUpdate={handleStatusUpdated}
        />
      )}
    </div>
  );
};

export default AdminReports;