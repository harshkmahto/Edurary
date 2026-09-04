// frontend/src/pages/admin/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  Crown,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Clock,
  Award,
  Shield,
  Edit2,
  Trash2,
  ExternalLink,
  AtSign,
  CalendarDays,
  Activity,
  BookMarked,
  Eye,
  Star,
  User as UserIcon
} from 'lucide-react';
import authService from '../../services/auth.service';
import UpdateUser from '../../components/admin/UpdateUser';
import DeleteUser from '../../components/admin/DeleteUser';
import toast from 'react-hot-toast';

// Animated Counter Component
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

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, subtext, color = 'emerald' }) => {
  return (
    <div className="bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-xl p-4 border border-emerald-200/30 dark:border-emerald-800/30 hover:border-emerald-300/50 dark:hover:border-emerald-700/50 transition-all hover:shadow-lg">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl bg-${color}-500/10`}>
          <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {typeof value === 'number' ? <AnimatedCounter target={value} /> : value}
          </p>
          {subtext && <p className="text-xs text-gray-400 dark:text-gray-500">{subtext}</p>}
        </div>
      </div>
    </div>
  );
};

// Book Card Component
const BookCard = ({ book }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-4 border border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
      <div className="flex items-start gap-4">
        <div className="w-16 h-20 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-white truncate">{book.title}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">by {book.authorName || 'Unknown'}</p>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <BookMarked className="w-3 h-3" />
              {book.category}
            </span>
            <span className="flex items-center gap-1">
              <UserIcon className="w-3 h-3" />
              {book.subject}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {book.views || 0} views
            </span>
            {book.ratings?.average > 0 && (
              <span className="flex items-center gap-1 text-yellow-500">
                <Star className="w-3 h-3 fill-yellow-500" />
                {book.ratings.average.toFixed(1)}
              </span>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            book.type === 'premium' 
              ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
              : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
          }`}>
            {book.type || 'free'}
          </span>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {book.pages || 0} pages
          </p>
        </div>
      </div>
    </div>
  );
};

const UserProfile = () => {
  const { userName, id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUserDetails();
    }
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await authService.getUserById(id);
      if (response?.success) {
        setUserData(response.data);
      } else {
        toast.error(response?.message || 'Failed to fetch user details');
        navigate('/admin/users');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error(error.message || 'Failed to fetch user details');
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status) {
      return <span className="px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Active</span>;
    }
    return <span className="px-2 py-1 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Inactive</span>;
  };

  const getVerificationBadge = (verified) => {
    if (verified) {
      return <span className="px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Verified</span>;
    }
    return <span className="px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-xs font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Unverified</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-50/50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent dark:border-emerald-400 mx-auto"></div>
          <p className="mt-6 text-emerald-700 dark:text-emerald-400/70">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-emerald-50/50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <User className="w-20 h-20 text-emerald-400 dark:text-emerald-600 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">User not found</h3>
          <p className="text-emerald-600 dark:text-emerald-400/60 mt-2">The user you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/admin/users')}
            className="mt-6 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  const { user, activeSubscription, subscriptionHistory, stats, engagementScore, bookReadingActivity } = userData;

  return (
    <div className="min-h-screen bg-emerald-50/50 dark:bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                      w-[800px] h-[800px] rounded-full 
                      bg-gradient-to-r from-emerald-500/20 via-emerald-400/10 to-transparent
                      blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/users')}
              className="p-2.5 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-all group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Profile</h1>
              <p className="text-sm text-emerald-600/60 dark:text-emerald-400/50">Complete user information and activity</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowEditPopup(true)}
              className="p-2.5 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-all"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowDeletePopup(true)}
              className="p-2.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Header Card */}
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/30 dark:border-emerald-800/30 mb-6">
          <div className="flex flex-col items-center">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500 flex items-center justify-center text-white dark:text-black text-3xl font-bold mb-3">
              {user.profilePicture ? 
              (<img src={user.profilePicture}
                 className='w-full h-full object-cover'/>
                ):(
                <span> {user.name?.charAt(0)?.toUpperCase() || 'U'} </span>
                )}  
            </div>

            {/* User Info */}
            <div className="text-center">
              <div className="flex flex-wrap items-center justify-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
              </div>
              <div className="flex items-center justify-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-3">
                <AtSign className="w-4 h-4" />
                <span>{user.username}</span>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
                <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </span>
                {user.phone && (
                  <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4" />
                    {user.phone}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
                {getStatusBadge(user.isActive)}
                {getVerificationBadge(user.isVerified)}
                {user.hasActiveSubscription && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium">
                    <Crown className="w-3 h-3" />
                    Premium
                  </span>
                )}
                <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium capitalize">
                  {user.role}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                {user.age && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {user.age} years
                  </span>
                )}
                {user.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {user.city}
                  </span>
                )}
                {user.profession && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {user.profession}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-4 h-4" />
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>

              {user.bio && (
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{user.bio}</p>
              )}
            </div>

            {/* Engagement Score */}
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Engagement Score</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center">
                <span className="text-lg font-bold text-white">{engagementScore || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Clock}
            label="Watch Time"
            value={stats.totalWatchTimeHours || 0}
            subtext={`${stats.totalWatchTimeMinutes || 0} minutes`}
            color="blue"
          />
          <StatCard
            icon={Award}
            label="Courses Completed"
            value={stats.totalCoursesCompleted || 0}
            color="purple"
          />
          <StatCard
            icon={BookOpen}
            label="Books Read"
            value={stats.totalBooksRead || 0}
            color="emerald"
          />
          <StatCard
            icon={Crown}
            label="Subscriptions"
            value={stats.totalSubscriptions || 0}
            subtext={`${stats.activeSubscriptions || 0} active`}
            color="amber"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-2xl border border-emerald-200/30 dark:border-emerald-800/30 overflow-hidden">
          <div className="border-b border-emerald-200/30 dark:border-emerald-800/30">
            <div className="flex overflow-x-auto hide-scrollbar">
              {['overview', 'subscriptions', 'books'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium capitalize transition-all whitespace-nowrap border-b-2 ${
                    activeTab === tab
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab === 'books' ? `Books (${stats.totalBooksRead || 0})` : tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Personal Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-500" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-xl">
                      <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Full Name</p>
                        <p className="text-sm text-gray-900 dark:text-white">{user.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-xl">
                      <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Email</p>
                        <p className="text-sm text-gray-900 dark:text-white">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-xl">
                      <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Phone</p>
                        <p className="text-sm text-gray-900 dark:text-white">{user.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-xl">
                      <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Age</p>
                        <p className="text-sm text-gray-900 dark:text-white">{user.age || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-xl">
                      <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">City</p>
                        <p className="text-sm text-gray-900 dark:text-white">{user.city || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-xl">
                      <Briefcase className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Profession</p>
                        <p className="text-sm text-gray-900 dark:text-white">{user.profession || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-xl">
                      <Shield className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Role</p>
                        <p className="text-sm text-gray-900 dark:text-white capitalize">{user.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-xl">
                      <CalendarDays className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Member Since</p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                {user.socialLinks && Object.values(user.socialLinks).some(v => v) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Social Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {user.socialLinks.website && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-xl">
                          <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Website</p>
                            <a href={user.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                              {user.socialLinks.website}
                            </a>
                          </div>
                        </div>
                      )}
                      {user.socialLinks.github && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-xl">
                          <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">GitHub</p>
                            <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                              {user.socialLinks.github}
                            </a>
                          </div>
                        </div>
                      )}
                      {user.socialLinks.linkedin && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-xl">
                          <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">LinkedIn</p>
                            <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                              {user.socialLinks.linkedin}
                            </a>
                          </div>
                        </div>
                      )}
                      {user.socialLinks.twitter && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-xl">
                          <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Twitter</p>
                            <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                              {user.socialLinks.twitter}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Active Subscription */}
                {activeSubscription && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Crown className="w-5 h-5 text-amber-500" />
                      Active Subscription
                    </h3>
                    <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-200/30 dark:border-amber-800/30">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Plan</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{activeSubscription.planName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">₹{activeSubscription.sellingPrice}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            activeSubscription.subscriptionStatus === 'active' 
                              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                              : 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                          }`}>
                            {activeSubscription.subscriptionStatus}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Expires</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {activeSubscription.endDate ? new Date(activeSubscription.endDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Subscriptions Tab */}
            {activeTab === 'subscriptions' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" />
                  Subscription History ({subscriptionHistory?.length || 0})
                </h3>
                {subscriptionHistory && subscriptionHistory.length > 0 ? (
                  <div className="space-y-3">
                    {subscriptionHistory.map((sub, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white capitalize">{sub.planName}</p>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                              <span>₹{sub.sellingPrice}</span>
                              <span>•</span>
                              <span>{sub.validity?.value} {sub.validity?.unit}</span>
                              <span>•</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                sub.subscriptionStatus === 'active' 
                                  ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                  : sub.subscriptionStatus === 'expired'
                                  ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                              }`}>
                                {sub.subscriptionStatus}
                              </span>
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                            <p>Started: {new Date(sub.startDate).toLocaleDateString()}</p>
                            {sub.endDate && <p>Ended: {new Date(sub.endDate).toLocaleDateString()}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">No subscription history</p>
                )}
              </div>
            )}

            {/* Books Tab */}
            {activeTab === 'books' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-500" />
                  Books Read ({stats.totalBooksRead || 0})
                </h3>
                {bookReadingActivity?.books && bookReadingActivity.books.length > 0 ? (
                  <div className="space-y-3">
                    {bookReadingActivity.books.map((book, index) => (
                      <BookCard key={index} book={book} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No books read yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">This user hasn't read any books</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit User Popup */}
      {showEditPopup && userData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-black rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-emerald-200/30 dark:border-emerald-800/30 shadow-2xl">
            <UpdateUser 
              user={userData.user} 
              onClose={() => setShowEditPopup(false)} 
              onUpdate={fetchUserDetails}
            />
          </div>
        </div>
      )}

      {/* Delete User Popup */}
      {showDeletePopup && userData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-black rounded-2xl max-w-md w-full border border-red-200/30 dark:border-red-800/30 shadow-2xl">
            <DeleteUser 
              user={userData.user} 
              onClose={() => setShowDeletePopup(false)} 
              onDelete={fetchUserDetails}
            />
          </div>
        </div>
      )}

      {/* CSS */}
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

export default UserProfile;