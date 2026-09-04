import React, { useState, useEffect } from 'react';
import { 
  Sparkles, BookMarked, Heart, Users, BookOpen, 
  GraduationCap, Crown, TrendingUp, Eye, Star,
  Calendar, ArrowUp, ArrowDown, Clock, Award,
  Library, UserPlus, Activity, BarChart3,
  ChevronDown, ChevronUp, Filter
} from 'lucide-react';
import analyticsService from '../../services/analytics.service';
import { useAuth } from '../../context/authContext';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.png'

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

const StatsCard = ({ icon: Icon, label, value, subtext, color, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`bg-emerald-50/80 dark:bg-emerald-950/20 backdrop-blur-sm rounded-2xl p-5 
                    border border-emerald-200/30 dark:border-emerald-800/30
                    transition-all duration-500 transform hover:scale-[1.02] 
                    hover:border-emerald-300/50 dark:hover:border-emerald-700/50
                    hover:shadow-[0_0_40px_rgba(16,185,129,0.05)]
                    ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-emerald-700/60 dark:text-emerald-400/60 text-sm font-medium">{label}</p>
          <h3 className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
            {typeof value === 'number' ? <AnimatedCounter target={value} /> : value}
          </h3>
          {subtext && (
            <p className="text-emerald-600/40 dark:text-emerald-400/40 text-xs mt-1 flex items-center gap-1">
              {subtext}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>
    </div>
  );
};

const SimplePieChart = ({ data, colors, title }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 text-emerald-500">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2v10l-6 6" />
            <path d="M12 12l6 6" />
          </svg>
        </div>
        <h4 className="text-emerald-900 dark:text-emerald-100 font-medium">{title}</h4>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const angle = (percentage / 100) * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              currentAngle = endAngle;
              
              const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
              const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
              const largeArc = angle > 180 ? 1 : 0;
              
              return (
                <path
                  key={index}
                  d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={colors[index % colors.length]}
                  className="transition-all duration-300 hover:opacity-80"
                />
              );
            })}
            <circle cx="50" cy="50" r="20" fill="white" className="dark:fill-emerald-950" />
          </svg>
        </div>
        <div className="space-y-1.5 flex-1">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                <span className="text-xs text-emerald-700 dark:text-emerald-300">{item.label}</span>
              </div>
              <span className="text-xs font-medium text-emerald-900 dark:text-emerald-100">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ChartCard = ({ title, icon: Icon, children, className = '' }) => (
  <div className={`bg-emerald-50/80 dark:bg-emerald-950/20 backdrop-blur-sm rounded-2xl p-6 
                  border border-emerald-200/30 dark:border-emerald-800/30
                  hover:border-emerald-300/50 dark:hover:border-emerald-700/50
                  transition-all duration-300 ${className}`}>
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
      <h3 className="text-emerald-900 dark:text-emerald-100 font-semibold">{title}</h3>
    </div>
    {children}
  </div>
);

const ProgressBar = ({ label, value, max, color = 'emerald' }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-emerald-700 dark:text-emerald-300">{label}</span>
        <span className="text-emerald-900 dark:text-emerald-100 font-medium">{value}</span>
      </div>
      <div className="w-full h-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-1000"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};

const AdminDashbord = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    user: null,
    subscription: null,
    subscriber: null,
    books: null,
    courses: null
  });
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    users: true,
    books: true,
    courses: true,
    subscribers: true
  });

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      const [userData, subscriptionData, subscriberData, booksData, coursesData] = await Promise.all([
        analyticsService.getUserAnalytics(),
        analyticsService.getSubscriptionAnalytics(),
        analyticsService.getSubscriberAnalytics(),
        analyticsService.getBooksAnalytics(),
        analyticsService.getCoursesAnalytics()
      ]);

      setAnalytics({
        user: userData?.data || null,
        subscription: subscriptionData?.data || null,
        subscriber: subscriberData?.data || null,
        books: booksData?.data || null,
        courses: coursesData?.data || null
      });
    } catch (error) {
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-50/50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent dark:border-emerald-400 mx-auto"></div>
          <p className="mt-6 text-emerald-700 dark:text-emerald-400/70">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const userData = analytics.user || {};
  const bookData = analytics.books || {};
  const courseData = analytics.courses || {};
  const subscriberData = analytics.subscriber || {};
  const subscriptionData = analytics.subscription || {};

  const userRoleData = userData.roleDistribution?.breakdown?.map(item => ({
    label: item._id || 'unknown',
    value: item.count || 0
  })) || [];

  const bookStatusData = [
    { label: 'Active', value: bookData.activeBooks || 0 },
    { label: 'Pending', value: bookData.pendingBooks || 0 },
    { label: 'Draft', value: bookData.draftBooks || 0 },
    { label: 'Archived', value: bookData.archivedBooks || 0 }
  ];

  const courseStatusData = [
    { label: 'Active', value: courseData.activeCourses || 0 },
    { label: 'Pending', value: courseData.pendingCourses || 0 },
    { label: 'Draft', value: courseData.draftCourses || 0 },
    { label: 'Archived', value: courseData.archivedCourses || 0 }
  ];

  const subscriberStatusData = [
    { label: 'Active', value: subscriberData.activeSubscribers || 0 },
    { label: 'Expired', value: subscriberData.expiredSubscribers || 0 },
    { label: 'Pending', value: subscriberData.pendingSubscribers || 0 },
    { label: 'Cancelled', value: subscriberData.cancelledSubscribers || 0 }
  ];

  const colors = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];

  return (
    <div className="min-h-screen bg-emerald-50/50 dark:bg-black relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                      w-[800px] h-[800px] rounded-full 
                      bg-gradient-to-r from-emerald-500/20 via-emerald-400/10 to-transparent
                      blur-3xl animate-pulse" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] 
                      bg-gradient-to-bl from-emerald-500/30 to-transparent 
                      rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] 
                      bg-gradient-to-tr from-emerald-600/20 to-transparent 
                      rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 
                      bg-emerald-400/5 rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 
                      bg-emerald-500/5 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10">
        <div className="bg-gradient-to-br from-emerald-100/80 to-emerald-200/80 
                      dark:from-emerald-950/40 dark:to-emerald-900/40
                      backdrop-blur-sm rounded-2xl p-8 lg:p-12 
                      border border-emerald-200/50 dark:border-emerald-800/30 
                      shadow-[0_0_60px_rgba(16,185,129,0.05)]
                      mb-6 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-block mb-3">
                <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 dark:bg-emerald-500/20 
                               border border-emerald-500/30 dark:border-emerald-400/30 
                               text-emerald-700 dark:text-emerald-300 
                               text-xs font-semibold uppercase tracking-wider
                               flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  Welcome Admin
                </span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-emerald-900 dark:text-emerald-50 mb-2">
                Welcome to Edurary
              </h2>
              <p className="text-emerald-700/70 dark:text-emerald-400/60 text-base lg:text-lg max-w-2xl">
                Manage your educational platform with ease. Empower learning through knowledge, 
                books, and technology. Track your platform's growth and performance.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 dark:bg-emerald-500/20 
                               text-emerald-700 dark:text-emerald-300 text-xs border border-emerald-500/30">
                  📚 {bookData.totalBooks || 0} Books
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 dark:bg-emerald-500/20 
                               text-emerald-700 dark:text-emerald-300 text-xs border border-emerald-500/30">
                  🎓 {courseData.totalCourses || 0} Courses
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 dark:bg-emerald-500/20 
                               text-emerald-700 dark:text-emerald-300 text-xs border border-emerald-500/30">
                  👨‍🎓 {userData.totalUsers || 0} Users
                </span>
              </div>
            </div>

            <div className="flex-shrink-0">
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-2xl 
                            bg-gradient-to-br from-emerald-500 to-emerald-600
                            flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                <img src={logo} className='w-full h-full object-cover'/>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-6 pt-6 border-t border-emerald-300/30 dark:border-emerald-700/30">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Heart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <p className="text-emerald-700/70 dark:text-emerald-400/60 text-sm italic text-center">
                "Education is the most powerful weapon which you can use to change the world."
              </p>
              <Heart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard 
            icon={Users}
            label="Total Users"
            value={userData.totalUsers || 0}
            subtext={`${userData.activeUsers || 0} active`}
            color="bg-emerald-500/10"
            delay={100}
          />
          <StatsCard 
            icon={BookOpen}
            label="Total Books"
            value={bookData.totalBooks || 0}
            subtext={`${bookData.activeBooks || 0} active`}
            color="bg-emerald-500/10"
            delay={200}
          />
          <StatsCard 
            icon={GraduationCap}
            label="Total Courses"
            value={courseData.totalCourses || 0}
            subtext={`${courseData.activeCourses || 0} active`}
            color="bg-emerald-500/10"
            delay={300}
          />
          <StatsCard 
            icon={Crown}
            label="Subscribers"
            value={subscriberData.totalSubscribers || 0}
            subtext={`${subscriberData.activeSubscribers || 0} active`}
            color="bg-emerald-500/10"
            delay={400}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <ChartCard title="User Roles" icon={Users}>
            <SimplePieChart 
              data={userRoleData.length > 0 ? userRoleData : [{ label: 'No Data', value: 1 }]}
              colors={colors}
              title="Role Distribution"
            />
          </ChartCard>
          
          <ChartCard title="Book Status" icon={BookOpen}>
            <SimplePieChart 
              data={bookStatusData.filter(d => d.value > 0)}
              colors={colors}
              title="Book Distribution"
            />
          </ChartCard>
          
          <ChartCard title="Course Status" icon={GraduationCap}>
            <SimplePieChart 
              data={courseStatusData.filter(d => d.value > 0)}
              colors={colors}
              title="Course Distribution"
            />
          </ChartCard>
          
          <ChartCard title="Subscriber Status" icon={Crown}>
            <SimplePieChart 
              data={subscriberStatusData.filter(d => d.value > 0)}
              colors={colors}
              title="Subscriber Distribution"
            />
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ChartCard title="User Engagement" icon={Activity}>
            <div className="space-y-3">
              <ProgressBar label="Total Users" value={userData.totalUsers || 0} max={userData.totalUsers || 1} />
              <ProgressBar label="Active Users" value={userData.activeUsers || 0} max={userData.totalUsers || 1} />
              <ProgressBar label="Verified Users" value={userData.verifiedUsers || 0} max={userData.totalUsers || 1} />
              <div className="flex items-center justify-between p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-xl">
                <span className="text-emerald-700 dark:text-emerald-300 text-sm">Engagement Rate</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{userData.engagement?.engagementRate || 0}%</span>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Subscription Overview" icon={Crown}>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-xl">
                <span className="text-emerald-700 dark:text-emerald-300 text-sm">Total Subscribers</span>
                <span className="text-emerald-900 dark:text-emerald-100 font-bold">{subscriberData.totalSubscribers || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-xl">
                <span className="text-emerald-700 dark:text-emerald-300 text-sm">Active Subscribers</span>
                <span className="text-emerald-500 dark:text-emerald-400 font-bold">{subscriberData.activeSubscribers || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-xl">
                <span className="text-emerald-700 dark:text-emerald-300 text-sm">Conversion Rate</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{subscriberData.conversionRate || 0}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-xl">
                <span className="text-emerald-700 dark:text-emerald-300 text-sm">Expiring Soon</span>
                <span className="text-amber-500 font-bold">{subscriberData.expiringSoon || 0}</span>
              </div>
            </div>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Books Analytics" icon={BookOpen}>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-xl">
                <span className="text-emerald-700 dark:text-emerald-300 text-sm">Total Books</span>
                <span className="text-emerald-900 dark:text-emerald-100 font-bold">{bookData.totalBooks || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-xl">
                <span className="text-emerald-700 dark:text-emerald-300 text-sm">Free / Premium</span>
                <span className="text-emerald-900 dark:text-emerald-100 font-bold">
                  {bookData.freeBooks || 0} / {bookData.premiumBooks || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-xl">
                <span className="text-emerald-700 dark:text-emerald-300 text-sm">Total Views</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  <AnimatedCounter target={bookData.engagement?.totalViews || 0} />
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-xl">
                <span className="text-emerald-700 dark:text-emerald-300 text-sm">Total Reads</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  <AnimatedCounter target={bookData.engagement?.totalReads || 0} />
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-xl">
                <span className="text-emerald-700 dark:text-emerald-300 text-sm">Average Rating</span>
                <span className="text-amber-500 font-bold">{bookData.averageRating?.toFixed(1) || 0} ⭐</span>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Courses Analytics" icon={GraduationCap}>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-xl">
                <span className="text-emerald-700 dark:text-emerald-300 text-sm">Total Courses</span>
                <span className="text-emerald-900 dark:text-emerald-100 font-bold">{courseData.totalCourses || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-xl">
                <span className="text-emerald-700 dark:text-emerald-300 text-sm">Free / Premium</span>
                <span className="text-emerald-900 dark:text-emerald-100 font-bold">
                  {courseData.freeCourses || 0} / {courseData.premiumCourses || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-xl">
                <span className="text-emerald-700 dark:text-emerald-300 text-sm">Total Lessons</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{courseData.lessonStats?.totalLessons || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-xl">
                <span className="text-emerald-700 dark:text-emerald-300 text-sm">Watch Hours</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  <AnimatedCounter target={courseData.engagement?.totalWatchTimeHours || 0} />
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-xl">
                <span className="text-emerald-700 dark:text-emerald-300 text-sm">Average Rating</span>
                <span className="text-amber-500 font-bold">{courseData.averageRating?.toFixed(1) || 0} ⭐</span>
              </div>
            </div>
          </ChartCard>
        </div>

        <div className="mt-6 bg-emerald-50/80 dark:bg-emerald-950/20 backdrop-blur-sm rounded-2xl p-6 
                      border border-emerald-200/30 dark:border-emerald-800/30">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-emerald-900 dark:text-emerald-100 font-semibold">Recent Activity (Last 30 Days)</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-emerald-100/50 dark:bg-emerald-900/30 rounded-xl p-4 text-center border border-emerald-200/30 dark:border-emerald-800/30">
              <p className="text-emerald-700/60 dark:text-emerald-400/50 text-xs">New Users</p>
              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                <AnimatedCounter target={userData.recentSignups || 0} />
              </p>
            </div>
            <div className="bg-emerald-100/50 dark:bg-emerald-900/30 rounded-xl p-4 text-center border border-emerald-200/30 dark:border-emerald-800/30">
              <p className="text-emerald-700/60 dark:text-emerald-400/50 text-xs">New Books</p>
              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                <AnimatedCounter target={bookData.recentBooks || 0} />
              </p>
            </div>
            <div className="bg-emerald-100/50 dark:bg-emerald-900/30 rounded-xl p-4 text-center border border-emerald-200/30 dark:border-emerald-800/30">
              <p className="text-emerald-700/60 dark:text-emerald-400/50 text-xs">New Courses</p>
              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                <AnimatedCounter target={courseData.recentCourses || 0} />
              </p>
            </div>
            <div className="bg-emerald-100/50 dark:bg-emerald-900/30 rounded-xl p-4 text-center border border-emerald-200/30 dark:border-emerald-800/30">
              <p className="text-emerald-700/60 dark:text-emerald-400/50 text-xs">New Subscribers</p>
              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                <AnimatedCounter target={subscriberData.recentSubscribers || 0} />
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashbord;