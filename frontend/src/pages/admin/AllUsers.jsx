import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, ChevronLeft, ChevronRight, Copy, 
  Eye, User, Mail, Phone, Briefcase, Calendar,
  X, Users, CheckCircle, AlertCircle,
  Home, Crown, Edit2, Trash2, ArrowLeft, ArrowRight
} from 'lucide-react';
import authService from '../../services/auth.service';
import analyticsService from '../../services/analytics.service';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import UpdateUser from '../../components/admin/UpdateUser';
import DeleteUser from '../../components/admin/DeleteUser';

const AnimatedCounter = ({ target, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [target, duration]);

  return <span>{count.toLocaleString()}</span>;
};

const StatsCard = ({ icon: Icon, label, value, subtext, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-2xl p-4 
                    border border-emerald-200/30 dark:border-emerald-800/30
                    transition-all duration-500 transform hover:scale-[1.02] 
                    hover:border-emerald-300/50 dark:hover:border-emerald-700/50
                    hover:shadow-[0_0_40px_rgba(16,185,129,0.05)]
                    ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-emerald-700/60 dark:text-emerald-400/60 text-xs font-medium">{label}</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            <AnimatedCounter target={value} />
          </h3>
          {subtext && (
            <p className="text-emerald-600/40 dark:text-emerald-400/40 text-xs mt-1">{subtext}</p>
          )}
        </div>
        <div className="p-2.5 rounded-xl bg-emerald-500/10">
          <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>
    </div>
  );
};

const AllUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedVerification, setSelectedVerification] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    verified: 0,
    subscribers: 0,
    admins: 0
  });
  
  const tableContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const limit = 10;

  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, [currentPage, searchTerm, selectedRole, selectedStatus, selectedVerification]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: currentPage,
        limit: limit,
      };
      
      if (searchTerm) params.search = searchTerm;
      if (selectedRole) params.role = selectedRole;
      if (selectedVerification) params.isVerified = selectedVerification;
      if (selectedStatus) params.status = selectedStatus;
      
      const response = await authService.getAllUser(params);
      
      if (response?.success) {
        let usersData = [];
        let paginationData = {};
        
        if (response.data) {
          if (Array.isArray(response.data)) {
            usersData = response.data;
          } else if (response.data.users) {
            usersData = response.data.users;
            paginationData = response.data.pagination || {};
          } else if (response.data.data && response.data.data.users) {
            usersData = response.data.data.users;
            paginationData = response.data.data.pagination || {};
          }
        }
        
        setUsers(usersData);
        setTotalUsers(paginationData.total || usersData.length || 0);
        setTotalPages(paginationData.pages || Math.ceil((paginationData.total || usersData.length || 0) / limit) || 1);
      } else {
        toast.error(response?.message || 'Failed to fetch users');
        setUsers([]);
        setTotalUsers(0);
        setTotalPages(1);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch users');
      setUsers([]);
      setTotalUsers(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await analyticsService.getUserAnalytics();
      if (response?.success && response?.data) {
        const data = response.data;
        setUserStats({
          total: data.totalUsers || 0,
          active: data.activeUsers || 0,
          verified: data.verifiedUsers || 0,
          subscribers: data.subscriptionStats?.usersWithActiveSubscription || 0,
          admins: data.roleDistribution?.admin || 0
        });
      }
    } catch (error) {
      // Silent fail for stats
    }
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedId(type);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleViewProfile = (user) => {
    const userName = user.username || user.name?.toLowerCase().replace(/\s+/g, '-') || 'user';
    navigate(`/admin/user-profile/${userName}/${user.id || user._id}`);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setShowEditPopup(true);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeletePopup(true);
  };

  const handleEditClose = () => {
    setShowEditPopup(false);
    setSelectedUser(null);
    fetchUsers();
  };

  const handleDeleteClose = () => {
    setShowDeletePopup(false);
    setSelectedUser(null);
    fetchUsers();
  };

  const handleScroll = () => {
    if (tableContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tableContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollTable = (direction) => {
    if (tableContainerRef.current) {
      const scrollAmount = 300;
      const currentScroll = tableContainerRef.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      tableContainerRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (tableContainerRef.current) {
      handleScroll();
    }
  }, [users]);

  const getStatusColor = (status) => {
    if (status === 'active') return 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/20';
    if (status === 'inactive') return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-500/20';
    return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-500/20';
  };

  const getVerificationBadge = (verified) => {
    if (verified) {
      return <span className="px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Verified</span>;
    }
    return <span className="px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-xs font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Unverified</span>;
  };

  const getRowColor = (user) => {
    if (!user.isActive) {
      return 'bg-red-50/50 dark:bg-red-950/20 border-red-200/30 dark:border-red-800/30 hover:bg-red-50 dark:hover:bg-red-950/30';
    }
    if (user.hasActiveSubscription) {
      return 'bg-amber-50/50 dark:bg-yellow-800/10 border-amber-200/30 dark:border-amber-800/30 hover:bg-amber-50 dark:hover:bg-amber-950/30';
    }
    return 'hover:bg-gray-50 dark:hover:bg-gray-900/50';
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <StatsCard 
          icon={Users}
          label="Total Users"
          value={userStats.total}
          delay={100}
        />
        <StatsCard 
          icon={User}
          label="Active Users"
          value={userStats.active}
          subtext={`${userStats.active} active`}
          delay={200}
        />
        <StatsCard 
          icon={CheckCircle}
          label="Verified"
          value={userStats.verified}
          subtext={`${Math.round((userStats.verified / userStats.total) * 100) || 0}% verified`}
          delay={300}
        />
        <StatsCard 
          icon={Crown}
          label="Subscribers"
          value={userStats.subscribers}
          subtext={`${Math.round((userStats.subscribers / userStats.total) * 100) || 0}% subscribed`}
          delay={400}
        />
        <StatsCard 
          icon={Users}
          label="Admins"
          value={userStats.admins}
          delay={500}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          All Users
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
            ({totalUsers} users)
          </span>
        </h2>
      </div>

      <div className="bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-xl p-4 border border-emerald-200/30 dark:border-emerald-800/30 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search by username, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
          
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-500 transition-all"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="author">Author</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-500 transition-all"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={selectedVerification}
            onChange={(e) => setSelectedVerification(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-500 transition-all"
          >
            <option value="">All Verification</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>

          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedRole('');
              setSelectedStatus('');
              setSelectedVerification('');
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl text-emerald-700 dark:text-emerald-300 transition-all"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-xl border border-emerald-200/30 dark:border-emerald-800/30 overflow-hidden relative">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-3 border-gray-200 dark:border-gray-700 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <Users className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-lg font-medium text-gray-900 dark:text-white">No users found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="absolute top-2 left-0 right-0 z-10 pointer-events-none px-2">
              <div className="flex justify-between">
                {showLeftArrow && (
                  <button 
                    onClick={() => scrollTable('left')}
                    className="pointer-events-auto p-1.5 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-lg"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                {showRightArrow && (
                  <button 
                    onClick={() => scrollTable('right')}
                    className="pointer-events-auto p-1.5 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-lg ml-auto"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div 
              ref={tableContainerRef}
              onScroll={handleScroll}
              className="overflow-x-auto hide-scrollbar"
            >
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50 dark:bg-black border-b border-gray-200 dark:border-green-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Subscription</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Verification</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const rowColor = getRowColor(user);
                    return (
                      <tr 
                        key={user.id || user._id} 
                        className={`border-b border-gray-100 dark:border-gray-800 transition-colors ${rowColor}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => handleViewProfile(user)}
                              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 hover:ring-2 hover:ring-emerald-400 transition-all cursor-pointer overflow-hidden"
                            >
                              {user.profilePicture ? (
                                <img 
                                  src={user.profilePicture} 
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500 flex items-center justify-center text-white dark:text-black">
                                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                              )}
                            </button>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">#{user.id?.slice(-6) || user._id?.slice(-6)}</span>
                            <button 
                              onClick={() => handleCopy(user.id || user._id, `id-${user.id || user._id}`)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                            >
                              <Copy className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium capitalize">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(user.isActive ? 'active' : 'inactive')}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {user.hasActiveSubscription ? (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium">
                              <Crown className="w-3 h-3" />
                              Subscribed
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {getVerificationBadge(user.isVerified)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => handleEditClick(user)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                              title="Edit User"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(user)}
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="absolute bottom-2 left-0 right-0 z-10 pointer-events-none px-2">
              <div className="flex justify-between">
                {showLeftArrow && (
                  <button 
                    onClick={() => scrollTable('left')}
                    className="pointer-events-auto p-1.5 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-lg"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                {showRightArrow && (
                  <button 
                    onClick={() => scrollTable('right')}
                    className="pointer-events-auto p-1.5 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-lg ml-auto"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showEditPopup && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-black rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-emerald-200/30 dark:border-emerald-800/30 shadow-2xl">
            <UpdateUser 
              user={selectedUser} 
              onClose={handleEditClose} 
              onUpdate={fetchUsers}
            />
          </div>
        </div>
      )}

      {showDeletePopup && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-black rounded-2xl max-w-md w-full border border-red-200/30 dark:border-red-800/30 shadow-2xl">
            <DeleteUser 
              user={selectedUser} 
              onClose={handleDeleteClose} 
              onDelete={fetchUsers}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
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

export default AllUsers;