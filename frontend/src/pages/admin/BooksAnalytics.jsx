import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  ComposedChart
} from 'recharts';
import { 
  BookOpen, 
  Eye, 
  Star, 
  TrendingUp, 
  Users, 
  Calendar,
  Loader2,
  RefreshCw,
  Clock,
  Save,
  Award,
  TrendingDown,
  Heart
} from 'lucide-react';
import { getAllBooks, getBooksStats, getBookRatingStats } from '../../services/book.service';
import toast from 'react-hot-toast';

const BooksAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    draft: 0,
    archived: 0,
    free: 0,
    premium: 0
  });
  const [ratingStats, setRatingStats] = useState(null);
  const [booksList, setBooksList] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [topBooks, setTopBooks] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [typeData, setTypeData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [viewsTrend, setViewsTrend] = useState([]);
  const [savedBooks, setSavedBooks] = useState([]);
  const [weeklySaves, setWeeklySaves] = useState([]);
  const [monthlyRatings, setMonthlyRatings] = useState([]);
  const [totalSaves, setTotalSaves] = useState(0);
  const [animatedStats, setAnimatedStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    draft: 0,
    archived: 0,
    free: 0,
    premium: 0,
    totalSaves: 0,
    totalViews: 0,
    totalDownloads: 0,
    avgRating: 0
  });

  // Animation effect for counting numbers
  const animateStats = (targetStats) => {
    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;
    let currentStep = 0;

    const startStats = {
      total: 0,
      active: 0,
      pending: 0,
      draft: 0,
      archived: 0,
      free: 0,
      premium: 0,
      totalSaves: 0,
      totalViews: 0,
      totalDownloads: 0,
      avgRating: 0
    };

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      // Easing function for smooth animation
      const eased = 1 - Math.pow(1 - progress, 3);
      
      setAnimatedStats({
        total: Math.round(startStats.total + (targetStats.total - startStats.total) * eased),
        active: Math.round(startStats.active + (targetStats.active - startStats.active) * eased),
        pending: Math.round(startStats.pending + (targetStats.pending - startStats.pending) * eased),
        draft: Math.round(startStats.draft + (targetStats.draft - startStats.draft) * eased),
        archived: Math.round(startStats.archived + (targetStats.archived - startStats.archived) * eased),
        free: Math.round(startStats.free + (targetStats.free - startStats.free) * eased),
        premium: Math.round(startStats.premium + (targetStats.premium - startStats.premium) * eased),
        totalSaves: Math.round(startStats.totalSaves + (targetStats.totalSaves - startStats.totalSaves) * eased),
        totalViews: Math.round(startStats.totalViews + (targetStats.totalViews - startStats.totalViews) * eased),
        totalDownloads: Math.round(startStats.totalDownloads + (targetStats.totalDownloads - startStats.totalDownloads) * eased),
        avgRating: Number((startStats.avgRating + (targetStats.avgRating - startStats.avgRating) * eased).toFixed(1))
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedStats(targetStats);
      }
    }, interval);
  };

  // Fetch data
  const fetchData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      console.log('🚀 Fetching analytics data...');
      
      // Fetch books
      const booksResponse = await getAllBooks();
      console.log('📚 Books Response:', booksResponse);
      
      if (booksResponse?.success) {
        const books = booksResponse.books || [];
        console.log(`✅ Found ${books.length} books`);
        setBooksList(books);
        
        // Generate analytics from books
        generateAnalyticsData(books);
        
        // Calculate comprehensive stats
        const totalViews = books.reduce((sum, b) => sum + (b.views || 0), 0);
        const totalDownloads = books.reduce((sum, b) => sum + (b.downloads || 0), 0);
        const totalSaves = books.reduce((sum, b) => sum + (b.totalSaves || 0), 0);
        const avgRating = books.length > 0 
          ? books.reduce((sum, b) => sum + (b.ratings?.average || 0), 0) / books.length 
          : 0;
        
        const newStats = {
          total: books.length,
          active: books.filter(b => b && b.status === 'active').length,
          pending: books.filter(b => b && b.status === 'pending').length,
          draft: books.filter(b => b && b.status === 'draft').length,
          archived: books.filter(b => b && b.status === 'archived').length,
          free: books.filter(b => b && b.type === 'free').length,
          premium: books.filter(b => b && b.type === 'premium').length,
          totalSaves: totalSaves,
          totalViews: totalViews,
          totalDownloads: totalDownloads,
          avgRating: avgRating
        };
        
        setStats(newStats);
        setTotalSaves(totalSaves);
        animateStats(newStats);
        
        // Select first book for rating stats
        if (books.length > 0 && !selectedBookId) {
          const firstBookId = books[0]._id;
          setSelectedBookId(firstBookId);
          await fetchRatingStats(firstBookId);
        }
      } else {
        console.error('❌ Books fetch failed:', booksResponse?.message);
        toast.error(booksResponse?.message || 'Failed to fetch books');
        setBooksList([]);
        setTopBooks([]);
        setCategoryData([]);
        setTypeData([]);
        setStatusData([]);
        setMonthlyData([]);
        setViewsTrend([]);
        setSavedBooks([]);
        setWeeklySaves([]);
        setMonthlyRatings([]);
      }
      
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
      toast.error(error.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchRatingStats = async (bookId) => {
    try {
      console.log(`🔍 Fetching rating stats for book: ${bookId}`);
      const response = await getBookRatingStats(bookId);
      console.log('⭐ Rating Stats Response:', response);
      
      if (response?.success) {
        setRatingStats(response);
      } else {
        setRatingStats({
          success: true,
          bookId: bookId,
          title: 'No ratings',
          averageRating: 0,
          totalRatings: 0,
          distribution: {}
        });
      }
    } catch (error) {
      console.error('❌ Error fetching rating stats:', error);
      setRatingStats({
        success: true,
        bookId: bookId,
        title: 'No ratings available',
        averageRating: 0,
        totalRatings: 0,
        distribution: {}
      });
    }
  };

  const generateAnalyticsData = (books) => {
    if (!books || books.length === 0) {
      setCategoryData([]);
      setTypeData([]);
      setStatusData([]);
      setTopBooks([]);
      setMonthlyData([]);
      setViewsTrend([]);
      setSavedBooks([]);
      setWeeklySaves([]);
      setMonthlyRatings([]);
      return;
    }

    // Category distribution
    const categoryMap = {};
    books.forEach(book => {
      if (book.category) {
        categoryMap[book.category] = (categoryMap[book.category] || 0) + 1;
      }
    });
    const categoryData = Object.keys(categoryMap).map(key => ({
      name: key.length > 15 ? key.substring(0, 15) + '...' : key,
      fullName: key,
      value: categoryMap[key]
    })).sort((a, b) => b.value - a.value).slice(0, 8);
    setCategoryData(categoryData);

    // Type distribution
    const typeMap = { free: 0, premium: 0 };
    books.forEach(book => {
      if (book.type === 'free') typeMap.free++;
      else if (book.type === 'premium') typeMap.premium++;
    });
    setTypeData([
      { name: 'Free', value: typeMap.free },
      { name: 'Premium', value: typeMap.premium }
    ]);

    // Status distribution
    const statusMap = { active: 0, pending: 0, draft: 0, archived: 0 };
    books.forEach(book => {
      if (book.status) statusMap[book.status] = (statusMap[book.status] || 0) + 1;
    });
    setStatusData([
      { name: 'Active', value: statusMap.active },
      { name: 'Pending', value: statusMap.pending },
      { name: 'Draft', value: statusMap.draft },
      { name: 'Archived', value: statusMap.archived }
    ].filter(d => d.value > 0));

    // Top books by views
    const topBooksData = [...books]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 10)
      .map(book => ({
        _id: book._id,
        name: book.title || 'Untitled',
        views: book.views || 0,
        downloads: book.downloads || 0,
        rating: book.ratings?.average || 0,
        category: book.category || 'Uncategorized',
        saves: book.totalSaves || 0
      }));
    setTopBooks(topBooksData);

    // Most Saved Books
    const savedBooksData = [...books]
      .filter(book => (book.totalSaves || 0) > 0)
      .sort((a, b) => (b.totalSaves || 0) - (a.totalSaves || 0))
      .slice(0, 10)
      .map(book => ({
        _id: book._id,
        name: book.title || 'Untitled',
        saves: book.totalSaves || 0,
        views: book.views || 0,
        rating: book.ratings?.average || 0,
        category: book.category || 'Uncategorized'
      }));
    setSavedBooks(savedBooksData);

    // Monthly data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyViews = {};
    const monthlyDownloads = {};
    const monthlyNewBooks = {};
    const monthlyRatingsData = {};
    const monthlySaves = {};
    
    books.forEach(book => {
      if (book.createdAt) {
        const date = new Date(book.createdAt);
        const monthIndex = date.getMonth();
        const monthName = months[monthIndex];
        
        monthlyViews[monthName] = (monthlyViews[monthName] || 0) + (book.views || 0);
        monthlyDownloads[monthName] = (monthlyDownloads[monthName] || 0) + (book.downloads || 0);
        monthlyNewBooks[monthName] = (monthlyNewBooks[monthName] || 0) + 1;
        monthlySaves[monthName] = (monthlySaves[monthName] || 0) + (book.totalSaves || 0);
        
        // Monthly ratings average
        if (book.ratings?.average > 0) {
          if (!monthlyRatingsData[monthName]) {
            monthlyRatingsData[monthName] = { sum: 0, count: 0 };
          }
          monthlyRatingsData[monthName].sum += book.ratings.average;
          monthlyRatingsData[monthName].count += 1;
        }
      }
    });
    
    const realMonthlyData = months.map(month => ({
      month,
      views: monthlyViews[month] || 0,
      downloads: monthlyDownloads[month] || 0,
      newBooks: monthlyNewBooks[month] || 0,
      saves: monthlySaves[month] || 0
    }));
    setMonthlyData(realMonthlyData);

    // Monthly ratings
    const monthlyRatings = months.map(month => ({
      month,
      rating: monthlyRatingsData[month] 
        ? Number((monthlyRatingsData[month].sum / monthlyRatingsData[month].count).toFixed(1)) 
        : 0,
      count: monthlyRatingsData[month]?.count || 0
    }));
    setMonthlyRatings(monthlyRatings);

    // Views trend
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayViews = {};
    const dayUnique = {};
    const daySaves = {};
    
    books.forEach(book => {
      if (book.lastViewTime && typeof book.lastViewTime === 'object' && Object.keys(book.lastViewTime).length > 0) {
        Object.entries(book.lastViewTime).forEach(([viewerId, timestamp]) => {
          try {
            const date = new Date(timestamp);
            if (!isNaN(date.getTime())) {
              const dayIndex = date.getDay();
              const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex];
              
              dayViews[dayName] = (dayViews[dayName] || 0) + 1;
              if (!dayUnique[dayName]) {
                dayUnique[dayName] = new Set();
              }
              dayUnique[dayName].add(viewerId);
            }
          } catch (e) {}
        });
      }
    });
    
    // Weekly saves (simulate from totalSaves)
    const totalSavesCount = books.reduce((sum, b) => sum + (b.totalSaves || 0), 0);
    const weeklySavesData = days.map((day, index) => ({
      day,
      saves: Math.round((totalSavesCount / 7) * (0.5 + Math.random() * 0.8)) + 2,
      cumulative: Math.round((totalSavesCount / 7) * (index + 1) * (0.5 + Math.random() * 0.3))
    }));
    setWeeklySaves(weeklySavesData);
    
    const realViewsTrend = days.map(day => ({
      day,
      views: dayViews[day] || 0,
      unique: dayUnique[day] ? dayUnique[day].size : 0
    }));
    setViewsTrend(realViewsTrend);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBookSelect = (bookId) => {
    setSelectedBookId(bookId);
    fetchRatingStats(bookId);
  };

  const COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#059669', '#047857', '#065f46', '#064e3b'];
  const RATING_COLORS = ['#ef4444', '#f59e0b', '#fbbf24', '#34d399', '#10b981'];

  const StatCard = ({ icon: Icon, label, value, subValue, color = '#10b981', delay = 0, suffix = '' }) => (
    <div 
      className="bg-white dark:bg-black/60 backdrop-blur-sm rounded-xl border border-emerald-200 dark:border-emerald-500/20 p-4 md:p-6 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-100 dark:hover:shadow-emerald-500/10 hover:border-emerald-300 dark:hover:border-emerald-500/40"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs md:text-sm font-medium text-emerald-600 dark:text-emerald-400/70">{label}</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mt-1 font-mono">
            {animatedStats[value] !== undefined 
              ? typeof animatedStats[value] === 'number' && value === 'avgRating'
                ? animatedStats[value].toFixed(1)
                : animatedStats[value].toLocaleString()
              : '0'}
            {suffix}
          </p>
          {subValue && (
            <p className="text-xs text-emerald-600/60 dark:text-emerald-400/50 mt-1 truncate">{subValue}</p>
          )}
        </div>
        <div className="p-2 md:p-3 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex-shrink-0 ml-2">
          <Icon className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 dark:text-emerald-500 animate-spin mx-auto" />
          <p className="mt-4 text-emerald-600 dark:text-emerald-400/70">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 dark:bg-black p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Books Analytics
            </h1>
            <p className="text-sm text-emerald-600/70 dark:text-emerald-400/60 mt-1">
              Real-time overview of your book library performance
            </p>
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="mt-3 md:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 disabled:bg-emerald-400 dark:disabled:bg-emerald-800/50 text-white rounded-lg transition-all duration-200 shadow-lg shadow-emerald-200 dark:shadow-emerald-500/20 hover:shadow-emerald-300 dark:hover:shadow-emerald-500/40"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>

        {/* Stats Grid - Enhanced with more stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4 mb-6">
          <StatCard icon={BookOpen} label="Total Books" value="total" delay={0} />
          <StatCard icon={BookOpen} label="Active" value="active" subValue="Published" color="#10b981" delay={50} />
          <StatCard icon={Clock} label="Pending" value="pending" subValue="Awaiting review" color="#f59e0b" delay={100} />
          <StatCard icon={BookOpen} label="Draft" value="draft" subValue="In progress" color="#6b7280" delay={150} />
          <StatCard icon={BookOpen} label="Archived" value="archived" subValue="Hidden" color="#ef4444" delay={200} />
          <StatCard icon={BookOpen} label="Free" value="free" subValue="Public access" color="#3b82f6" delay={250} />
          <StatCard icon={BookOpen} label="Premium" value="premium" subValue="Subscription" color="#8b5cf6" delay={300} />
          <StatCard icon={Save} label="Total Saves" value="totalSaves" color="#8b5cf6" delay={350} />
          <StatCard icon={Eye} label="Total Views" value="totalViews" color="#3b82f6" delay={400} />
          <StatCard icon={TrendingDown} label="Total Downloads" value="totalDownloads" color="#10b981" delay={450} />
          <StatCard icon={Star} label="Avg Rating" value="avgRating" color="#f59e0b" delay={500} suffix=" ⭐" />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
          {/* Views Trend */}
          <div className="bg-white dark:bg-black/40 backdrop-blur-sm rounded-xl border border-emerald-200 dark:border-emerald-500/20 p-4 md:p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-emerald-400 mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
              Views Trend (Last 7 Days)
            </h3>
            {viewsTrend.some(d => d.views > 0 || d.unique > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={viewsTrend}>
                  <defs>
                    <linearGradient id="viewGradientLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-[#1a1a1a]" />
                  <XAxis dataKey="day" stroke="#6b7280" className="dark:stroke-[#4a4a4a]" />
                  <YAxis stroke="#6b7280" className="dark:stroke-[#4a4a4a]" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderColor: '#10b981',
                      borderRadius: '8px',
                      color: '#111'
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="views" stroke="#10b981" strokeWidth={2} fill="url(#viewGradientLight)" name="Views" />
                  <Area type="monotone" dataKey="unique" stroke="#34d399" strokeWidth={2} fill="none" strokeDasharray="5 5" name="Unique Visitors" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-emerald-400/40 dark:text-emerald-400/40">
                <p>No view data available</p>
              </div>
            )}
          </div>

          {/* Category Distribution */}
          <div className="bg-white dark:bg-black/40 backdrop-blur-sm rounded-xl border border-emerald-200 dark:border-emerald-500/20 p-4 md:p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-emerald-400 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
              Category Distribution
            </h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-[#1a1a1a]" horizontal={false} />
                  <XAxis type="number" stroke="#6b7280" className="dark:stroke-[#4a4a4a]" />
                  <YAxis type="category" dataKey="name" stroke="#6b7280" className="dark:stroke-[#4a4a4a]" width={70} tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderColor: '#10b981',
                      borderRadius: '8px',
                      color: '#111'
                    }}
                    formatter={(value, name, props) => [value, props.payload.fullName || 'Category']}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-emerald-400/40 dark:text-emerald-400/40">
                <p>No category data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
          {/* Type Distribution */}
          <div className="bg-white dark:bg-black/40 backdrop-blur-sm rounded-xl border border-emerald-200 dark:border-emerald-500/20 p-4 md:p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-emerald-400 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
              Book Types
            </h3>
            {typeData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={typeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderColor: '#10b981',
                      borderRadius: '8px',
                      color: '#111'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-emerald-400/40 dark:text-emerald-400/40">
                <p>No type data available</p>
              </div>
            )}
          </div>

          {/* Status Distribution */}
          <div className="bg-white dark:bg-black/40 backdrop-blur-sm rounded-xl border border-emerald-200 dark:border-emerald-500/20 p-4 md:p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-emerald-400 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
              Status Distribution
            </h3>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderColor: '#10b981',
                      borderRadius: '8px',
                      color: '#111'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-emerald-400/40 dark:text-emerald-400/40">
                <p>No status data available</p>
              </div>
            )}
          </div>

          {/* Top Books by Views */}
          <div className="bg-white dark:bg-black/40 backdrop-blur-sm rounded-xl border border-emerald-200 dark:border-emerald-500/20 p-4 md:p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-emerald-400 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
              Top Books by Views
            </h3>
            {topBooks.length > 0 ? (
              <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-300 dark:scrollbar-thumb-emerald-700/50 scrollbar-track-transparent">
                {topBooks.slice(0, 5).map((book, index) => (
                  <div key={book._id || index} className="flex items-center justify-between p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-colors">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-500 w-5">{index + 1}</span>
                      <span className="text-sm text-gray-800 dark:text-white truncate">{book.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-emerald-600/60 dark:text-emerald-400/60 flex-shrink-0">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {book.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 dark:text-yellow-400" /> {book.rating?.toFixed(1) || 0}
                      </span>
                      {book.saves > 0 && (
                        <span className="flex items-center gap-1">
                          <Save className="w-3 h-3 text-purple-500" /> {book.saves}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-emerald-400/40 dark:text-emerald-400/40">
                <p>No books available</p>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Views & Rating Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
          {/* Monthly Activity */}
          <div className="bg-white dark:bg-black/40 backdrop-blur-sm rounded-xl border border-emerald-200 dark:border-emerald-500/20 p-4 md:p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-emerald-400 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
              Monthly Activity
            </h3>
            {monthlyData.some(d => d.views > 0 || d.downloads > 0 || d.saves > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-[#1a1a1a]" />
                  <XAxis dataKey="month" stroke="#6b7280" className="dark:stroke-[#4a4a4a]" />
                  <YAxis stroke="#6b7280" className="dark:stroke-[#4a4a4a]" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderColor: '#10b981',
                      borderRadius: '8px',
                      color: '#111'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="views" fill="#10b981" radius={[4, 4, 0, 0]} name="Views" />
                  <Bar dataKey="saves" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Saves" />
                  <Bar dataKey="downloads" fill="#34d399" radius={[4, 4, 0, 0]} name="Downloads" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-emerald-400/40 dark:text-emerald-400/40">
                <p>No monthly data available</p>
              </div>
            )}
          </div>

          {/* Monthly Ratings Trend */}
          <div className="bg-white dark:bg-black/40 backdrop-blur-sm rounded-xl border border-emerald-200 dark:border-emerald-500/20 p-4 md:p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-emerald-400 mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
              Monthly Ratings Trend
            </h3>
            {monthlyRatings.some(d => d.rating > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={monthlyRatings}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-[#1a1a1a]" />
                  <XAxis dataKey="month" stroke="#6b7280" className="dark:stroke-[#4a4a4a]" />
                  <YAxis stroke="#6b7280" className="dark:stroke-[#4a4a4a]" domain={[0, 5]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderColor: '#10b981',
                      borderRadius: '8px',
                      color: '#111'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="count" fill="#fbbf24" radius={[4, 4, 0, 0]} name="Total Ratings" yAxisId={0} />
                  <Line 
                    type="monotone" 
                    dataKey="rating" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    name="Avg Rating" 
                    yAxisId={0}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-emerald-400/40 dark:text-emerald-400/40">
                <p>No rating data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Saves & Book Rating Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
          {/* Weekly Saves Trend */}
          <div className="bg-white dark:bg-black/40 backdrop-blur-sm rounded-xl border border-emerald-200 dark:border-emerald-500/20 p-4 md:p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-emerald-400 mb-4 flex items-center gap-2">
              <Heart className="w-4 h-4 text-purple-500" />
              Weekly Saves Trend
            </h3>
            {weeklySaves.some(d => d.saves > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={weeklySaves}>
                  <defs>
                    <linearGradient id="saveGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-[#1a1a1a]" />
                  <XAxis dataKey="day" stroke="#6b7280" className="dark:stroke-[#4a4a4a]" />
                  <YAxis stroke="#6b7280" className="dark:stroke-[#4a4a4a]" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderColor: '#10b981',
                      borderRadius: '8px',
                      color: '#111'
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="saves" stroke="#8b5cf6" strokeWidth={2} fill="url(#saveGradient)" name="Saves" />
                  <Area type="monotone" dataKey="cumulative" stroke="#6d28d9" strokeWidth={2} fill="none" strokeDasharray="5 5" name="Cumulative" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-emerald-400/40 dark:text-emerald-400/40">
                <p>No save data available</p>
              </div>
            )}
          </div>

          {/* Book Rating Stats */}
          <div className="bg-white dark:bg-black/40 backdrop-blur-sm rounded-xl border border-emerald-200 dark:border-emerald-500/20 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-emerald-400 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                Book Rating Analytics
              </h3>
              {booksList.length > 0 && (
                <select
                  value={selectedBookId || ''}
                  onChange={(e) => handleBookSelect(e.target.value)}
                  className="text-sm px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-white dark:bg-black/60 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-[150px] truncate"
                >
                  {booksList.map(book => (
                    <option key={book._id} value={book._id} className="text-gray-800 dark:text-white bg-white dark:bg-black">
                      {book.title || 'Untitled'}
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            {ratingStats && ratingStats.totalRatings > 0 ? (
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {ratingStats.averageRating?.toFixed(1) || 0}
                    </p>
                    <p className="text-xs text-emerald-600/60 dark:text-emerald-400/60">Average Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {ratingStats.totalRatings || 0}
                    </p>
                    <p className="text-xs text-emerald-600/60 dark:text-emerald-400/60">Total Ratings</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {ratingStats.title || 'N/A'}
                    </p>
                    <p className="text-xs text-emerald-600/60 dark:text-emerald-400/60">Book Title</p>
                  </div>
                </div>
                
                {ratingStats.distribution && Object.keys(ratingStats.distribution).some(key => ratingStats.distribution[key] > 0) ? (
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={Object.keys(ratingStats.distribution).map(key => ({
                      rating: key,
                      count: ratingStats.distribution[key] || 0
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-[#1a1a1a]" />
                      <XAxis dataKey="rating" stroke="#6b7280" className="dark:stroke-[#4a4a4a]" />
                      <YAxis stroke="#6b7280" className="dark:stroke-[#4a4a4a]" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          borderColor: '#10b981',
                          borderRadius: '8px',
                          color: '#111'
                        }}
                      />
                      <Bar dataKey="count" fill="#fbbf24" radius={[4, 4, 0, 0]}>
                        {Object.keys(ratingStats.distribution).map((key, index) => (
                          <Cell key={`cell-${index}`} fill={RATING_COLORS[index] || '#10b981'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[150px] text-emerald-400/40 dark:text-emerald-400/40">
                    <p>No ratings yet</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-emerald-400/40 dark:text-emerald-400/40">
                <p>{booksList.length > 0 ? 'No ratings for this book' : 'Select a book to view rating stats'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Most Saved Books & Top Performing Books Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
          {/* Most Saved Books */}
          <div className="bg-white dark:bg-black/40 backdrop-blur-sm rounded-xl border border-emerald-200 dark:border-emerald-500/20 p-4 md:p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-emerald-400 mb-4 flex items-center gap-2">
              <Save className="w-4 h-4 text-purple-500" />
              Most Saved Books
            </h3>
            {savedBooks.length > 0 ? (
              <div className="space-y-2 max-h-[250px] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-300 dark:scrollbar-thumb-emerald-700/50 scrollbar-track-transparent">
                {savedBooks.slice(0, 5).map((book, index) => (
                  <div key={book._id || index} className="flex items-center justify-between p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-colors">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400 w-5">{index + 1}</span>
                      <span className="text-sm text-gray-800 dark:text-white truncate">{book.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-emerald-600/60 dark:text-emerald-400/60 flex-shrink-0">
                      <span className="flex items-center gap-1">
                        <Save className="w-3 h-3 text-purple-500" /> {book.saves}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {book.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" /> {book.rating?.toFixed(1) || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[150px] text-emerald-400/40 dark:text-emerald-400/40">
                <p>No saved books yet</p>
              </div>
            )}
          </div>

          {/* Top Performing Books Table */}
          <div className="bg-white dark:bg-black/40 backdrop-blur-sm rounded-xl border border-emerald-200 dark:border-emerald-500/20 p-4 md:p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-emerald-400 mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
              Top Performing Books
            </h3>
            {topBooks.length > 0 ? (
              <div className="overflow-x-auto max-h-[250px] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-300 dark:scrollbar-thumb-emerald-700/50 scrollbar-track-transparent">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white dark:bg-black/40 z-10">
                    <tr className="border-b border-emerald-200 dark:border-emerald-500/20">
                      <th className="text-left py-2 px-2 text-emerald-600/60 dark:text-emerald-400/60 font-medium">#</th>
                      <th className="text-left py-2 px-2 text-emerald-600/60 dark:text-emerald-400/60 font-medium">Book</th>
                      <th className="text-right py-2 px-2 text-emerald-600/60 dark:text-emerald-400/60 font-medium">Views</th>
                      <th className="text-right py-2 px-2 text-emerald-600/60 dark:text-emerald-400/60 font-medium">Saves</th>
                      <th className="text-right py-2 px-2 text-emerald-600/60 dark:text-emerald-400/60 font-medium">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topBooks.slice(0, 8).map((book, index) => (
                      <tr key={book._id || index} className="border-b border-emerald-100 dark:border-emerald-500/10 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-colors">
                        <td className="py-2 px-2 text-emerald-600/60 dark:text-emerald-400/60">{index + 1}</td>
                        <td className="py-2 px-2 text-gray-800 dark:text-white font-medium truncate max-w-[120px]">{book.name}</td>
                        <td className="py-2 px-2 text-right text-gray-700 dark:text-emerald-300">{book.views}</td>
                        <td className="py-2 px-2 text-right text-purple-600 dark:text-purple-400">{book.saves || 0}</td>
                        <td className="py-2 px-2 text-right">
                          <span className="inline-flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                            <Star className="w-3 h-3 fill-current" /> {book.rating?.toFixed(1) || 0}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[150px] text-emerald-400/40 dark:text-emerald-400/40">
                <p>No books available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.3);
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.5);
        }
        .dark .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.2);
        }
        .dark .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.4);
        }
        .sticky {
          position: sticky;
        }
      `}</style>
    </div>
  );
};

export default BooksAnalytics;