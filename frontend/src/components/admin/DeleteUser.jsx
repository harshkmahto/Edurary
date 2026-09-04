// frontend/src/components/admin/DeleteUser.jsx
import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, User, Mail, Crown, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '../../services/auth.service';

const DeleteUser = ({ user, onClose, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  if (!user) return null;

  const handleDelete = async () => {
    if (confirmText !== user.name) {
      toast.error('Please type the user name correctly to confirm');
      return;
    }

    try {
      setLoading(true);
      
      const response = await authService.deleteUsers(user.id);
      
      if (response?.success) {
        toast.success(`User "${user.name}" deleted successfully`);
        onDelete?.();
        onClose();
      } else {
        toast.error(response?.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'admin': return 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400';
      case 'author': return 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400';
      case 'user': return 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400';
      default: return 'bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-black rounded-2xl w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-red-200/30 dark:border-red-800/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/10">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delete User</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
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
        {/* Warning Message */}
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                Are you sure you want to delete this user?
              </p>
              <p className="text-sm text-red-700/70 dark:text-red-400/70 mt-1">
                This will permanently remove the user and all associated data from the system.
              </p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl p-4 mb-6 border border-emerald-200/30 dark:border-emerald-800/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-red-500 dark:from-red-500 dark:to-red-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <User className="w-3 h-3" />
                <span>@{user.username}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Mail className="w-3 h-3" />
                <span className="truncate">{user.email}</span>
              </div>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full capitalize ${getRoleBadgeColor(user.role)}`}>
              {user.role}
            </span>
          </div>
        </div>

        {/* Confirmation Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type <span className="font-bold text-red-600 dark:text-red-400">{user.name}</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={`Type "${user.name}" to confirm`}
            className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-black/50 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-red-400 dark:focus:border-red-500 transition-all placeholder-gray-400 dark:placeholder-gray-500"
          />
          {confirmText && confirmText !== user.name && (
            <p className="text-xs text-red-500 mt-1">Please type the exact user name</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || confirmText !== user.name}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </div>
            ) : (
              'Delete User'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUser;