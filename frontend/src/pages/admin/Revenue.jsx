import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, TrendingUp, TrendingDown, Minus, 
  Calendar, Clock, Award, Crown, Users, 
  PieChart as PieChartIcon, BarChart3, Activity,
  ArrowUp, ArrowDown, Wallet, CreditCard, 
  DollarSign, Percent, Zap
} from 'lucide-react';
import analyticsService from '../../services/analytics.service';
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

  return <span>₹{count.toLocaleString()}</span>;
};

// Revenue Card Component
const RevenueCard = ({ icon: Icon, label, value, subtext, trend, trendValue, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-yellow-500" />;
  };

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
          <h3 className="text-2xl lg:text-3xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
            {typeof value === 'number' ? <AnimatedCounter target={value} /> : value}
          </h3>
          {subtext && (
            <p className="text-emerald-600/40 dark:text-emerald-400/40 text-xs mt-1 flex items-center gap-1">
              {subtext}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-emerald-500/10`}>
          <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-emerald-200/20 dark:border-emerald-700/20">
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-yellow-500'}`}>
              {trendValue}%
            </span>
            <span className="text-emerald-600/40 dark:text-emerald-400/40 text-xs">
              {trend === 'up' ? 'increase' : trend === 'down' ? 'decrease' : 'stable'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple Pie Chart Component
const RevenuePieChart = ({ data, colors, title }) => {
  const total = data.reduce((sum, item) => sum + item.total, 0);
  let currentAngle = 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <PieChartIcon className="w-4 h-4 text-emerald-500" />
        <h4 className="text-emerald-900 dark:text-emerald-100 font-medium">{title}</h4>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = (item.total / total) * 100;
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
                <span className="text-xs text-emerald-700 dark:text-emerald-300">{item.planName}</span>
              </div>
              <span className="text-xs font-medium text-emerald-900 dark:text-emerald-100">
                ₹{item.total.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Chart Card Component
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

// Monthly Bar Chart
const MonthlyBarChart = ({ data }) => {
  const maxValue = Math.max(...data.map(item => item.total), 1);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-emerald-700/60 dark:text-emerald-400/60">Month</span>
        <span className="text-emerald-700/60 dark:text-emerald-400/60">Revenue (₹)</span>
      </div>
      <div className="space-y-2">
        {data.map((item, index) => {
          const percentage = (item.total / maxValue) * 100;
          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-emerald-700 dark:text-emerald-300">{item.monthName}</span>
                <span className="text-emerald-900 dark:text-emerald-100 font-medium">₹{item.total.toLocaleString()}</span>
              </div>
              <div className="w-full h-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Revenue = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueAnalytics();
  }, []);

  const fetchRevenueAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsService.getRevenueAnalytics();
      if (response?.success) {
        setAnalytics(response.data);
      } else {
        toast.error('Failed to fetch revenue analytics');
      }
    } catch (error) {
      console.error('Error fetching revenue:', error);
      toast.error('Failed to fetch revenue analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-50/50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent dark:border-emerald-400 mx-auto"></div>
          <p className="mt-6 text-emerald-700 dark:text-emerald-400/70">Loading revenue data...</p>
        </div>
      </div>
    );
  }

  const data = analytics || {};
  const overview = data.overview || {};
  const growth = data.growth || {};
  const recurring = data.recurringRevenue || {};
  const breakdowns = data.breakdowns || {};
  const summary = data.summary || {};

  const colors = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];

  return (
    <div className="min-h-screen bg-emerald-50/50 dark:bg-black relative overflow-hidden">
      {/* Background Effects */}
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
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-100/80 to-emerald-200/80 
                      dark:from-emerald-950/40 dark:to-emerald-900/40
                      backdrop-blur-sm rounded-2xl p-6 lg:p-8 
                      border border-emerald-200/50 dark:border-emerald-800/30 
                      shadow-[0_0_60px_rgba(16,185,129,0.05)]
                      mb-6 relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/20">
              <IndianRupee className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-emerald-900 dark:text-emerald-50">
                Revenue Analytics
              </h1>
              <p className="text-emerald-700/70 dark:text-emerald-400/60">
                Track your platform's revenue and financial performance
              </p>
            </div>
          </div>
        </div>

        {/* Revenue Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <RevenueCard 
            icon={Wallet}
            label="Today's Revenue"
            value={overview.today?.total || 0}
            subtext={`${overview.today?.count || 0} transactions`}
            delay={100}
          />
          <RevenueCard 
            icon={Calendar}
            label="This Month"
            value={overview.thisMonth?.total || 0}
            subtext={`${overview.thisMonth?.count || 0} transactions`}
            trend={growth.monthOverMonth?.trend}
            trendValue={growth.monthOverMonth?.percentage?.toFixed(1) || 0}
            delay={200}
          />
          <RevenueCard 
            icon={Award}
            label="This Year"
            value={overview.thisYear?.total || 0}
            subtext={`${overview.thisYear?.count || 0} transactions`}
            trend={growth.yearOverYear?.trend}
            trendValue={growth.yearOverYear?.percentage?.toFixed(1) || 0}
            delay={300}
          />
          <RevenueCard 
            icon={CreditCard}
            label="All Time"
            value={overview.allTime?.total || 0}
            subtext={`${overview.allTime?.count || 0} total transactions`}
            delay={400}
          />
        </div>

        {/* Recurring Revenue & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-emerald-50/80 dark:bg-emerald-950/20 backdrop-blur-sm rounded-2xl p-5 
                        border border-emerald-200/30 dark:border-emerald-800/30
                        hover:border-emerald-300/50 dark:hover:border-emerald-700/50
                        transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10">
                <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-emerald-700/60 dark:text-emerald-400/60 text-sm">Monthly Recurring Revenue</p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  ₹{(recurring.monthlyRecurring || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50/80 dark:bg-emerald-950/20 backdrop-blur-sm rounded-2xl p-5 
                        border border-emerald-200/30 dark:border-emerald-800/30
                        hover:border-emerald-300/50 dark:hover:border-emerald-700/50
                        transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10">
                <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-emerald-700/60 dark:text-emerald-400/60 text-sm">Active Subscribers</p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  {recurring.activeSubscribers || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50/80 dark:bg-emerald-950/20 backdrop-blur-sm rounded-2xl p-5 
                        border border-emerald-200/30 dark:border-emerald-800/30
                        hover:border-emerald-300/50 dark:hover:border-emerald-700/50
                        transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10">
                <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-emerald-700/60 dark:text-emerald-400/60 text-sm">Average Transaction</p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  ₹{(summary.averageTransactionValue || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ChartCard title="Revenue by Plan" icon={PieChartIcon}>
            {breakdowns.byPlan && breakdowns.byPlan.length > 0 ? (
              <RevenuePieChart 
                data={breakdowns.byPlan}
                colors={colors}
                title="Revenue Distribution by Plan"
              />
            ) : (
              <p className="text-emerald-700/50 dark:text-emerald-400/50 text-center py-8">No data available</p>
            )}
          </ChartCard>

          <ChartCard title="Monthly Revenue" icon={BarChart3}>
            {breakdowns.monthly && breakdowns.monthly.length > 0 ? (
              <MonthlyBarChart data={breakdowns.monthly} />
            ) : (
              <p className="text-emerald-700/50 dark:text-emerald-400/50 text-center py-8">No data available</p>
            )}
          </ChartCard>
        </div>

        {/* Growth & Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-emerald-50/80 dark:bg-emerald-950/20 backdrop-blur-sm rounded-2xl p-5 
                        border border-emerald-200/30 dark:border-emerald-800/30
                        hover:border-emerald-300/50 dark:hover:border-emerald-700/50
                        transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <h4 className="text-emerald-900 dark:text-emerald-100 font-medium">Month over Month</h4>
            </div>
            <p className={`text-2xl font-bold ${growth.monthOverMonth?.trend === 'up' ? 'text-emerald-500' : growth.monthOverMonth?.trend === 'down' ? 'text-red-500' : 'text-yellow-500'}`}>
              {growth.monthOverMonth?.percentage?.toFixed(1) || 0}%
            </p>
            <p className="text-emerald-700/50 dark:text-emerald-400/50 text-sm mt-1">
              {growth.monthOverMonth?.currentMonth?.toLocaleString()} vs {growth.monthOverMonth?.lastMonth?.toLocaleString()}
            </p>
          </div>

          <div className="bg-emerald-50/80 dark:bg-emerald-950/20 backdrop-blur-sm rounded-2xl p-5 
                        border border-emerald-200/30 dark:border-emerald-800/30
                        hover:border-emerald-300/50 dark:hover:border-emerald-700/50
                        transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <h4 className="text-emerald-900 dark:text-emerald-100 font-medium">Year over Year</h4>
            </div>
            <p className={`text-2xl font-bold ${growth.yearOverYear?.trend === 'up' ? 'text-emerald-500' : growth.yearOverYear?.trend === 'down' ? 'text-red-500' : 'text-yellow-500'}`}>
              {growth.yearOverYear?.percentage?.toFixed(1) || 0}%
            </p>
            <p className="text-emerald-700/50 dark:text-emerald-400/50 text-sm mt-1">
              {growth.yearOverYear?.currentYear?.toLocaleString()} vs {growth.yearOverYear?.lastYear?.toLocaleString()}
            </p>
          </div>

          <div className="bg-emerald-50/80 dark:bg-emerald-950/20 backdrop-blur-sm rounded-2xl p-5 
                        border border-emerald-200/30 dark:border-emerald-800/30
                        hover:border-emerald-300/50 dark:hover:border-emerald-700/50
                        transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <h4 className="text-emerald-900 dark:text-emerald-100 font-medium">Total Transactions</h4>
            </div>
            <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              {summary.totalTransactions || 0}
            </p>
            <p className="text-emerald-700/50 dark:text-emerald-400/50 text-sm mt-1">
              Revenue: ₹{(overview.allTime?.total || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="bg-emerald-50/80 dark:bg-emerald-950/20 backdrop-blur-sm rounded-2xl p-6 
                      border border-emerald-200/30 dark:border-emerald-800/30">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-emerald-900 dark:text-emerald-100 font-semibold">Revenue Summary</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-emerald-100/50 dark:bg-emerald-900/30 rounded-xl p-4 text-center border border-emerald-200/30 dark:border-emerald-800/30">
              <p className="text-emerald-700/60 dark:text-emerald-400/50 text-xs">Today</p>
              <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                ₹{(overview.today?.total || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-emerald-100/50 dark:bg-emerald-900/30 rounded-xl p-4 text-center border border-emerald-200/30 dark:border-emerald-800/30">
              <p className="text-emerald-700/60 dark:text-emerald-400/50 text-xs">This Week</p>
              <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                ₹{(overview.thisWeek?.total || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-emerald-100/50 dark:bg-emerald-900/30 rounded-xl p-4 text-center border border-emerald-200/30 dark:border-emerald-800/30">
              <p className="text-emerald-700/60 dark:text-emerald-400/50 text-xs">This Month</p>
              <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                ₹{(overview.thisMonth?.total || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-emerald-100/50 dark:bg-emerald-900/30 rounded-xl p-4 text-center border border-emerald-200/30 dark:border-emerald-800/30">
              <p className="text-emerald-700/60 dark:text-emerald-400/50 text-xs">This Year</p>
              <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                ₹{(overview.thisYear?.total || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Revenue;