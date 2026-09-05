// frontend/src/pages/Reports.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/authContext';
import supportService from '../../services/support.service';
import { 
  AlertCircle, Send, X, BookOpen, Book, Server, HelpCircle,
  RefreshCw, FileText, Shield, Users, Award, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import reportImage from '../../assets/support-png-4.png'; 

const Reports = () => {
  const { user, isAuthenticated } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    reportType: '',
    subject: '',
    description: '',
    relatedItem: {
      name: '',
      id: ''
    }
  });
  const [success, setSuccess] = useState(false);

  const reportTypes = [
    { value: 'book', label: 'Book', icon: Book, color: 'from-blue-500 to-blue-600' },
    { value: 'course', label: 'Course', icon: BookOpen, color: 'from-purple-500 to-purple-600' },
    { value: 'system', label: 'System', icon: Server, color: 'from-orange-500 to-orange-600' },
    { value: 'other', label: 'Other', icon: HelpCircle, color: 'from-gray-500 to-gray-600' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to submit a report');
      return;
    }

    if (!formData.reportType || !formData.subject || !formData.description) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const response = await supportService.createReport(formData);
      if (response.success) {
        toast.success('Report submitted successfully!');
        setSuccess(true);
        setFormData({
          reportType: '',
          subject: '',
          description: '',
          relatedItem: {
            name: '',
            id: ''
          }
        });
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-4">
            <AlertCircle className="w-10 h-10 text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Login Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please login to submit a report
          </p>
          <button
            onClick={() => window.location.href = '/auth/signin'}
            className="px-6 py-2.5 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-xl font-medium transition-colors"
          >
            Login Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-[#22c55e]/10 rounded-xl">
            <FileText className="w-6 h-6 text-[#22c55e]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Submit a Report
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Help us improve by reporting issues or suggestions
            </p>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 animate-fade-in">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h4 className="font-semibold text-green-700 dark:text-green-400">Report Submitted!</h4>
              <p className="text-sm text-green-600 dark:text-green-300">
                Thank you for your feedback. Our team will review it shortly.
              </p>
            </div>
          </div>
        )}

        {/* Main Content - Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Image/Info */}
          <div className="hidden lg:flex flex-col items-center justify-center bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-gray-800 p-8">
            <div className="w-full max-w-md">
              {/* Report Illustration */}
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-[#22c55e]/5 to-transparent rounded-2xl blur-2xl"></div>
                <div className="relative flex items-center justify-center">
                  <img 
                    src={reportImage} 
                    alt="Report"
                    className="w-64 h-64 object-contain"
                    onError={(e) => {
                      e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' rx='20' fill='%2322c55e' opacity='0.1'/%3E%3Ctext x='50' y='110' font-size='60'%3E📋%3C/text%3E%3C/svg%3E`;
                    }}
                  />
                </div>
              </div>

              {/* Info Cards */}
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-[#22c55e]/5 rounded-xl border border-[#22c55e]/10">
                  <div className="w-8 h-8 rounded-lg bg-[#22c55e]/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-[#22c55e]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">Confidential</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Your reports are kept private and secure</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">Quick Response</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">We aim to respond within 24-48 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-purple-500/5 rounded-xl border border-purple-500/10">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">Dedicated Team</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Our support team reviews every report</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-[#22c55e]">24/7</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Support Available</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#22c55e]">100%</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Confidential</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Report</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Fill in the details below</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Active</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Report Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Report Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {reportTypes.map(type => {
                    const Icon = type.icon;
                    const isSelected = formData.reportType === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, reportType: type.value }))}
                        className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2
                          ${isSelected 
                            ? 'border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e] shadow-lg shadow-[#22c55e]/10' 
                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[#22c55e]/50 hover:bg-[#22c55e]/5'
                          }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-[#22c55e]' : ''}`} />
                        <span className="text-sm font-medium">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Brief subject of the report"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/20 transition-all"
                  maxLength="200"
                />
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formData.subject.length}/200
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Detailed description of the issue..."
                  rows="5"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/20 transition-all resize-none"
                  maxLength="2000"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formData.description.length}/2000
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">Min 10 characters</span>
                </div>
              </div>

              {/* Related Item */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Related Item (Optional)
                  </label>
                  <span className="text-xs text-red-500 dark:text-red-400 font-medium">
                    ⚠️ Enter both name and ID for better tracking
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="relatedItem.name"
                    value={formData.relatedItem.name}
                    onChange={handleInputChange}
                    placeholder="Item name (e.g., JavaScript Basics)"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/20 transition-all"
                  />
                  <input
                    type="text"
                    name="relatedItem.id"
                    value={formData.relatedItem.id}
                    onChange={handleInputChange}
                    placeholder="Item ID (e.g., book_12345)"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/20 transition-all"
                  />
                </div>
                <p className="text-xs text-red-500 dark:text-red-400 mt-1.5">
                  ⚠️ Please provide both name and ID if reporting a specific item
                </p>
              </div>

              {/* User Info */}
              <div className="p-3 bg-gray-50 dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#22c55e]/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-[#22c55e]">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email || 'No email'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3.5 bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#22c55e]/25 hover:shadow-xl hover:shadow-[#22c55e]/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Report
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                By submitting, you agree to our <a href="#" className="text-[#22c55e] hover:underline">Terms of Service</a>
              </p>
            </form>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            All reports are reviewed by our team. We take every report seriously and will respond as soon as possible.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reports;