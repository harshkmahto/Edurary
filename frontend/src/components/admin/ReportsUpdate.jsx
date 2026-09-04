import React, { useState } from 'react';
import { X, RefreshCw, CheckCircle, AlertCircle, AlertTriangle, Clock } from 'lucide-react';
import supportService from '../../services/support.service';
import toast from 'react-hot-toast';

const ReportsUpdate = ({ report, onClose, onUpdate }) => {
  const [selectedStatus, setSelectedStatus] = useState(report?.status || 'review');
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    { value: 'review', label: 'Under Review', icon: Clock, color: 'bg-yellow-500 text-white' },
    { value: 'basic', label: 'Basic Priority', icon: AlertCircle, color: 'bg-blue-500 text-white' },
    { value: 'mediate', label: 'Medium Priority', icon: AlertTriangle, color: 'bg-purple-500 text-white' },
    { value: 'serious', label: 'High Priority', icon: AlertTriangle, color: 'bg-red-500 text-white' },
    { value: 'resolved', label: 'Resolved', icon: CheckCircle, color: 'bg-green-500 text-white' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!report?._id) {
      toast.error('Invalid report');
      return;
    }

    if (selectedStatus === report.status) {
      toast.error('Status is already set to this value');
      return;
    }

    try {
      setLoading(true);
      const response = await supportService.updateReportStatus(report._id, { status: selectedStatus });
      if (response.success) {
        toast.success('Report status updated successfully');
        onUpdate();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  const currentStatus = getStatusInfo(report?.status);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl max-w-md w-full border border-gray-200 dark:border-gray-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Update Report Status</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Change the status of this report</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Report Info */}
          <div className="p-3 bg-gray-50 dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Report Subject</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{report?.subject}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Current Status:</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${currentStatus.color}`}>
                {currentStatus.label}
              </span>
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select New Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((status) => {
                const Icon = status.icon;
                const isSelected = selectedStatus === status.value;
                return (
                  <button
                    key={status.value}
                    type="button"
                    onClick={() => setSelectedStatus(status.value)}
                    className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2
                      ${isSelected 
                        ? 'border-[#22c55e] bg-[#22c55e]/10 shadow-lg shadow-[#22c55e]/10' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-[#22c55e]/50 hover:bg-[#22c55e]/5'
                      }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-[#22c55e]' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${isSelected ? 'text-[#22c55e]' : 'text-gray-600 dark:text-gray-400'}`}>
                      {status.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Description */}
          <div className="p-3 bg-gray-50 dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Status Description</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {selectedStatus === 'review' && 'Report is under initial review by the team'}
              {selectedStatus === 'basic' && 'Basic priority issue that needs attention'}
              {selectedStatus === 'mediate' && 'Medium priority issue requiring prompt action'}
              {selectedStatus === 'serious' && 'High priority issue requiring immediate attention'}
              {selectedStatus === 'resolved' && 'Issue has been resolved and closed'}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || selectedStatus === report?.status}
              className="flex-1 px-4 py-2.5 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
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

export default ReportsUpdate;