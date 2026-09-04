// frontend/src/components/admin/UpdateUser.jsx
import React, { useState } from 'react';
import { X, User, Shield, CheckCircle, AlertCircle, Crown, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '../../services/auth.service';

const UpdateUser = ({ user, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    role: user?.role || 'user',
    isActive: user?.isActive ?? true,
    isVerified: user?.isVerified ?? false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('User data is missing');
      return;
    }

    try {
      setLoading(true);
      
      const updateData = {
        role: formData.role,
        isActive: formData.isActive,
        isVerified: formData.isVerified,
      };

      const response = await authService.updateUsers(user.id, updateData);
      
      if (response?.success) {
        toast.success('User updated successfully');
        onUpdate?.();
        onClose();
      } else {
        toast.error(response?.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'admin': return 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400';
      case 'user': return 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400';
      default: return 'bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400';
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin': return <Crown className="w-4 h-4" />;
      case 'user': return <Users className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white dark:bg-black rounded-2xl w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-emerald-200/30 dark:border-emerald-800/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10">
            <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Update User</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Update user role and status</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="p-6">
        {/* User Info */}
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl p-4 mb-6 border border-emerald-200/30 dark:border-emerald-800/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500 flex items-center justify-center text-white dark:text-black font-bold text-lg flex-shrink-0">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full capitalize ${getRoleBadgeColor(user.role)}`}>
              {user.role}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Shield className="w-4 h-4 inline mr-2 text-emerald-500" />
              Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['user', 'admin'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role }))}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                    formData.role === role
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-emerald-300 dark:hover:border-emerald-700'
                  }`}
                >
                  {getRoleIcon(role)}
                  <span className="capitalize">{role}</span>
                </button>
              ))}
            </div>
            <div className="mt-2">
              <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(formData.role)}`}>
                {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
              </span>
            </div>
          </div>

          {/* Status Toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/30 dark:border-emerald-800/30">
              <div className="flex items-center gap-3">
                <CheckCircle className={`w-5 h-5 ${formData.isActive ? 'text-emerald-500' : 'text-gray-400'}`} />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Active Status</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formData.isActive ? 'User can access the platform' : 'User is blocked from accessing'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${
                  formData.isActive ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${
                  formData.isActive ? 'right-0.5' : 'left-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/30 dark:border-emerald-800/30">
              <div className="flex items-center gap-3">
                <AlertCircle className={`w-5 h-5 ${formData.isVerified ? 'text-emerald-500' : 'text-yellow-500'}`} />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Verification Status</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formData.isVerified ? 'User is verified' : 'User is not verified'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isVerified: !prev.isVerified }))}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${
                  formData.isVerified ? 'bg-emerald-500' : 'bg-yellow-400'
                }`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${
                  formData.isVerified ? 'right-0.5' : 'left-0.5'
                }`} />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </div>
              ) : (
                'Update User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateUser;