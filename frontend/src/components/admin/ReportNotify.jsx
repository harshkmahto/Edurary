// frontend/src/pages/admin/Notifications.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import supportService from '../../services/support.service';
import { 
  X, Bell, FileText, User, Mail, Calendar, 
  Clock, CheckCircle, AlertCircle, AlertTriangle,
  ExternalLink, RefreshCw, Copy, Check,
  Tag, ChevronRight, Eye, Filter, Search,
  ArrowUpDown, CalendarDays
} from 'lucide-react';
import toast from 'react-hot-toast';

const ReportNotify = ({ onClose }) => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const modalRef = useRef(null);

  const statusOptions = [
    { value: 'review', label: 'Review', color: 'bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500 hover:text-white' },
    { value: 'basic', label: 'Basic', color: 'bg-blue-500/20 text-blue-600 hover:bg-blue-500 hover:text-white' },
    { value: 'mediate', label: 'Mediate', color: 'bg-purple-500/20 text-purple-600 hover:bg-purple-500 hover:text-white' },
    { value: 'serious', label: 'Serious', color: 'bg-red-500/20 text-red-600 hover:bg-red-500 hover:text-white' },
    { value: 'resolved', label: 'Resolved', color: 'bg-green-500/20 text-green-600 hover:bg-green-500 hover:text-white' }
  ];

  useEffect(() => {
    fetchReports();
    // Click outside to close
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await supportService.getAllReports({ limit: 50, sortBy: 'createdAt', sortOrder: 'desc' });
      if (response.success) {
        setReports(response.data.reports || []);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      setUpdating(reportId);
      const response = await supportService.updateReportStatus(reportId, { status: newStatus });
      if (response.success) {
        toast.success(`Status updated to ${newStatus}`);
        fetchReports();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status) => {
    const option = statusOptions.find(s => s.value === status);
    return option || statusOptions[0];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'review': return <Clock className="w-3.5 h-3.5" />;
      case 'basic': return <AlertCircle className="w-3.5 h-3.5" />;
      case 'mediate': return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'serious': return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'resolved': return <CheckCircle className="w-3.5 h-3.5" />;
      default: return <FileText className="w-3.5 h-3.5" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'review': return 'text-yellow-500';
      case 'basic': return 'text-blue-500';
      case 'mediate': return 'text-purple-500';
      case 'serious': return 'text-red-500';
      case 'resolved': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  // Filter and search logic
  const filteredReports = reports.filter(report => {
    const matchesFilter = filter === 'all' || report.status === filter;
    const matchesSearch = searchTerm === '' || 
      report.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Sort logic
  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else if (sortBy === 'status') {
      return a.status.localeCompare(b.status);
    }
    return 0;
  });

  // Get counts for each status
  const getStatusCount = (status) => {
    return reports.filter(r => r.status === status).length;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4  backdrop-blur-md animate-fade-in">
      {/* Glass Modal */}
      <div 
        ref={modalRef}
        className="w-full max-w-xl max-h-[95vh] bg-white/10 dark:bg-black/10 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-[#22c55e]/20 shadow-2xl shadow-black/20 overflow-hidden animate-scale-up"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-[#22c55e]/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#22c55e]/10">
              <Bell className="w-5 h-5 text-[#22c55e]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Notifications</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {reports.length} total reports
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchReports}
              className="p-2 rounded-xl hover:bg-[#22c55e]/10 text-[#22c55e] transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => navigate('/admin/reports')}
              className="p-2 rounded-xl hover:bg-[#22c55e]/10 text-[#22c55e] transition-colors"
              title="View all reports"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-200/50 dark:hover:bg-gray-700/50 text-gray-500 dark:text-gray-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="p-4 border-b border-gray-200/50 dark:border-[#22c55e]/10 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-100/50 dark:bg-[#0a0a0a]/50 border border-gray-200/50 dark:border-[#22c55e]/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#22c55e]/50 transition-colors"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap
                ${filter === 'all' 
                  ? 'bg-[#22c55e] text-white shadow-lg shadow-[#22c55e]/25' 
                  : 'bg-gray-100/50 dark:bg-[#0a0a0a]/50 text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-[#22c55e]/10'
                }`}
            >
              All ({reports.length})
            </button>
            {statusOptions.map((option) => {
              const count = getStatusCount(option.value);
              if (count === 0) return null;
              return (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5
                    ${filter === option.value 
                      ? option.color.replace('hover:bg-', 'bg-').replace('hover:text-white', 'text-white') + ' shadow-lg' 
                      : 'bg-gray-100/50 dark:bg-[#0a0a0a]/50 text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-[#22c55e]/10'
                    }`}
                >
                  {getStatusIcon(option.value)}
                  {option.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : sortBy === 'oldest' ? 'status' : 'newest')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100/50 dark:bg-[#0a0a0a]/50 text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-[#22c55e]/10 transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort: {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : 'Status'}
            </button>
            <span className="text-xs text-gray-400">
              {sortedReports.length} results
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-280px)] p-3 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="w-6 h-6 text-[#22c55e] animate-spin" />
            </div>
          ) : sortedReports.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No notifications found</p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-xs text-[#22c55e] hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            sortedReports.map((report) => {
              const status = getStatusBadge(report.status);
              const isUpdating = updating === report._id;
              
              return (
                <div
                  key={report._id}
                  className="bg-white/50 dark:bg-[#0a0a0a]/50 rounded-xl border border-gray-200/50 dark:border-[#22c55e]/10 p-4 hover:shadow-lg transition-all hover:border-[#22c55e]/30"
                >
                  {/* Report Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`${getStatusColor(report.status)}`}>
                          {getStatusIcon(report.status)}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${status.color}`}>
                          {status.label}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {formatDate(report.createdAt)}
                        </span>
                        {report.relatedItem?.type && (
                          <span className="text-[10px] px-2 py-0.5 bg-[#22c55e]/5 border border-[#22c55e]/20 rounded-full text-[#22c55e] font-mono">
                            {report.relatedItem.type}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {report.subject}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {report.description}
                      </p>
                    </div>
                    {report.relatedItem?.id && (
                      <span className="text-[10px] px-2 py-0.5 bg-[#22c55e]/5 border border-[#22c55e]/20 rounded-full text-[#22c55e] font-mono flex-shrink-0">
                        #{report.relatedItem.id.slice(0, 6)}
                      </span>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {report.userId?.profilePicture ? (
                      <img 
                        src={report.userId.profilePicture} 
                        alt={report.userId.name}
                        className="w-5 h-5 rounded-full object-cover border border-[#22c55e]/30"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-[#22c55e]/10 flex items-center justify-center border border-[#22c55e]/30">
                        <User className="w-3 h-3 text-[#22c55e]" />
                      </div>
                    )}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {report.userId?.name || 'Unknown'}
                    </span>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <span className="truncate max-w-[150px]">{report.userId?.email}</span>
                  </div>

                  {/* Status Actions */}
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-200/50 dark:border-[#22c55e]/10">
                    {statusOptions.map((option) => {
                      const isActive = report.status === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleStatusUpdate(report._id, option.value)}
                          disabled={isUpdating || isActive}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1
                            ${isActive 
                              ? 'bg-[#22c55e] text-white shadow-lg shadow-[#22c55e]/25' 
                              : option.color + ' border border-transparent hover:border-current'
                            }
                            ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                        >
                          {isUpdating && <RefreshCw className="w-3 h-3 animate-spin" />}
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {reports.length > 0 && (
          <div className="p-4 border-t border-gray-200/50 dark:border-[#22c55e]/10">
            <button
              onClick={() => {
                navigate('/admin/reports');
                onClose();
              }}
              className="w-full py-2.5 bg-[#22c55e]/10 hover:bg-[#22c55e]/20 text-[#22c55e] rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm"
            >
              View All Reports
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportNotify;