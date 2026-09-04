import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/DarkModeContext';
import { 
  Menu, Users, BookOpen, Library, BarChart3, 
  Settings, LogOut, Bell, MessageSquare, Sun, Moon,
  Shield, ChevronLeft, ChevronRight, Home, UserCog,
  IndianRupee,
  UserCheck,
  BookAudio,
  BookUp2,
  Crown,
  FileText,
  File
} from 'lucide-react';
import { useAuth } from '../../context/authContext';
import { FaFilePdf } from 'react-icons/fa';
import AutoOnTop from '../../components/style/AutoOnTop';
import AdminGoTop from '../../components/admin/AdminGoTop';
import Notifications from '../../components/admin/Notifications';
import AdminMessages from '../../components/admin/AdminMessage';
import ReportNotify from '../../components/admin/ReportNotify';
import supportService from '../../services/support.service';
import analyticsService from '../../services/analytics.service';
import Loading from '../../pages/Loading';

const AdminPannel = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showReportNotify, setShowReportNotify] = useState(false);
  const [totalReports, setTotalReports] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchTotalReports();
    fetchUnreadNotificationCount();
    
    // Show loading for 2 seconds when admin panel loads
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const fetchTotalReports = async () => {
    try {
      const response = await supportService.getTotalReports();
      if (response.success) {
        setTotalReports(response.data.totalReports);
      }
    } catch (error) {
      console.error('Error fetching total reports:', error);
    }
  };

  const fetchUnreadNotificationCount = async () => {
    try {
      const response = await analyticsService.getUnreadNotificationCount();
      if (response.success) {
        setUnreadNotificationCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
    }
  };

  const handleNotificationsClose = () => {
    setShowNotifications(false);
    fetchUnreadNotificationCount();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { path: '/admin/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/subscribers', icon: UserCheck, label: 'Subscribers' },
    { path: '/admin/books', icon: Library, label: 'Books' },
    { path: '/admin/book-analytics', icon: BookUp2, label: 'Books Analytics' },
    { path: '/admin/pdf', icon: FaFilePdf, label: 'PDF Tools' },
    { path: '/admin/ebooks', icon: BookAudio, label: 'E-Books' },
    { path: '/admin/courses', icon: BookOpen, label: 'Courses' },
    { path: '/admin/subscriptions', icon: Crown, label: 'Subscriptions' },
    { path: '/admin/revenue', icon: IndianRupee, label: 'Revenue'},
    { path: '/admin/reports', icon: File, label: 'Reports' },
  ];

  const bottomNavItems = [
    { path: '/admin/profile', icon: UserCog, label: 'Profile' },
  ];

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(34, 197, 94, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34, 197, 94, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 197, 94, 0.5);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(34, 197, 94, 0.05);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34, 197, 94, 0.3);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 197, 94, 0.5);
        }
        * {
          transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-up {
          animation: scale-up 0.25s ease-out;
        }
      `}</style>

      <AutoOnTop/>
      <AdminGoTop/>

      <div className="min-h-screen bg-[#f0f7f0] dark:bg-[#0a0a0a]">
        <div className="flex h-screen bg-[#f0f7f0] dark:bg-[#0a0a0a] overflow-hidden">
          
          <aside 
            className={`
              fixed lg:relative z-50 h-full transition-all duration-300 ease-in-out
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
              ${isSidebarOpen ? 'w-60' : 'lg:w-20'}
              bg-gradient-to-b from-[#e8f5e9] via-[#c8e6c9] to-[#e8f5e9]
              dark:bg-[#0a0a0a] dark:bg-none
              border-r border-[rgba(34,197,94,0.3)] dark:border-[rgba(34,197,94,0.15)]
              shadow-[4px_0_40px_rgba(34,197,94,0.1)] dark:shadow-[4px_0_40px_rgba(0,0,0,0.8)]
              flex flex-col
            `}
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-[rgba(34,197,94,0.2)] dark:border-[rgba(34,197,94,0.1)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#22c55e] to-[#16a34a] 
                              dark:bg-gradient-to-br dark:from-[#4ade80] dark:to-[#22c55e]
                              flex items-center justify-center shadow-lg shadow-[rgba(34,197,94,0.3)]
                              dark:shadow-[rgba(74,222,128,0.2)]">
                  <Shield className="w-5 h-5 text-[#f0f7f0] dark:text-[#0a0a0a]" />
                </div>
                {isSidebarOpen && (
                  <div className="flex flex-col">
                    <span className="text-[#1a3a1a] dark:text-[#4ade80] font-bold text-lg tracking-wider">EDURARY</span>
                    <span className="text-[#2a5a2a] dark:text-[#6b8b6b] text-xs tracking-widest uppercase">Admin Panel</span>
                  </div>
                )}
              </div>
              {!isMobile && (
                <button
                  onClick={toggleSidebar}
                  className="p-1.5 rounded-lg hover:bg-[rgba(34,197,94,0.15)] dark:hover:bg-[rgba(34,197,94,0.1)] transition-colors"
                >
                  {isSidebarOpen ? (
                    <ChevronLeft className="w-4 h-4 text-[#2a5a2a] dark:text-[#6b8b6b]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[#2a5a2a] dark:text-[#6b8b6b]" />
                  )}
                </button>
              )}
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-3 rounded-xl
                    transition-all duration-200 group
                    ${isActive 
                      ? 'bg-[rgba(34,197,94,0.2)] dark:bg-[rgba(34,197,94,0.15)] text-[#1a3a1a] dark:text-[#4ade80] shadow-[inset_0_0_30px_rgba(34,197,94,0.1)] dark:shadow-[inset_0_0_30px_rgba(74,222,128,0.1)]' 
                      : 'text-[#2a5a2a] dark:text-[#6b8b6b] hover:bg-[rgba(34,197,94,0.12)] dark:hover:bg-[rgba(34,197,94,0.08)] hover:text-[#1a3a1a] dark:hover:text-[#4ade80]'
                    }
                    ${!isSidebarOpen && 'justify-center'}
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-[#16a34a] dark:text-[#4ade80]' : 'text-[#2a5a2a] dark:text-[#6b8b6b] group-hover:text-[#16a34a] dark:group-hover:text-[#4ade80]'}`} />
                      {isSidebarOpen && (
                        <span className="text-sm font-medium">{item.label}</span>
                      )}
                      {isActive && isSidebarOpen && (
                        <div className="ml-auto w-1.5 h-8 rounded-full bg-gradient-to-b from-[#22c55e] to-[#16a34a] dark:from-[#4ade80] dark:to-[#22c55e]" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="border-t border-[rgba(34,197,94,0.2)] dark:border-[rgba(34,197,94,0.1)] p-3 space-y-1">
              {bottomNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-3 rounded-xl
                    transition-all duration-200 group
                    ${isActive 
                      ? 'bg-[rgba(34,197,94,0.2)] dark:bg-[rgba(34,197,94,0.15)] text-[#1a3a1a] dark:text-[#4ade80]' 
                      : 'text-[#2a5a2a] dark:text-[#6b8b6b] hover:bg-[rgba(34,197,94,0.12)] dark:hover:bg-[rgba(34,197,94,0.08)] hover:text-[#1a3a1a] dark:hover:text-[#4ade80]'
                    }
                    ${!isSidebarOpen && 'justify-center'}
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </NavLink>
              ))}
              
              <button
                onClick={handleLogout}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-xl
                  transition-all duration-200 group
                  text-[#dc2626] dark:text-[#ef4444] hover:bg-[rgba(220,38,38,0.1)] dark:hover:bg-[rgba(239,68,68,0.15)]
                  ${!isSidebarOpen && 'justify-center'}
                `}
              >
                <LogOut className="w-5 h-5" />
                {isSidebarOpen && <span className="text-sm font-medium">Logout</span>}
              </button>
            </div>
          </aside>

          <div className="flex-1 flex flex-col min-w-0 bg-[#f0f7f0] dark:bg-[#0a0a0a]">
            
            <header className="sticky top-0 z-40 bg-[#f0f7f0]/80 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-[rgba(34,197,94,0.2)] dark:border-[rgba(34,197,94,0.1)]">
              <div className="flex items-center justify-between px-4 py-3 lg:px-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg hover:bg-[rgba(34,197,94,0.1)] dark:hover:bg-[rgba(34,197,94,0.08)] transition-colors lg:hidden"
                  >
                    <Menu className="w-5 h-5 text-[#16a34a] dark:text-[#4ade80]" />
                  </button>
                  <div className="hidden lg:flex items-center gap-2">
                    <div className="h-6 w-px bg-[rgba(34,197,94,0.3)] dark:bg-[rgba(34,197,94,0.15)]" />
                    <span className="text-[#2a5a2a] dark:text-[#6b8b6b] text-sm font-medium">
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden sm:block text-center">
                    <h1 className="text-[#1a3a1a] dark:text-[#4ade80] text-sm font-bold tracking-wider uppercase">
                      EDURARY
                    </h1>
                    <p className="text-[#2a5a2a] dark:text-[#6b8b6b] text-xs">Admin Panel</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleTheme}
                    className="relative w-10 h-10 rounded-xl bg-[rgba(34,197,94,0.1)] dark:bg-[rgba(34,197,94,0.08)]
                             border border-[rgba(34,197,94,0.2)] dark:border-[rgba(34,197,94,0.15)]
                             flex items-center justify-center
                             hover:bg-[rgba(34,197,94,0.2)] dark:hover:bg-[rgba(34,197,94,0.15)]
                             transition-all duration-300 group"
                  >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#22c55e]/5 to-transparent" />
                    {isDark ? (
                      <Sun className="w-4 h-4 text-[#16a34a] dark:text-[#4ade80] transition-transform duration-500 rotate-0 group-hover:rotate-90" />
                    ) : (
                      <Moon className="w-4 h-4 text-[#16a34a] dark:text-[#4ade80] transition-transform duration-500 rotate-0 group-hover:-rotate-90" />
                    )}
                  </button>

                  <button 
                    onClick={() => {
                      setShowReportNotify(true);
                      setShowNotifications(false);
                      setShowMessages(false);
                    }}
                    className="relative w-10 h-10 rounded-xl bg-[rgba(34,197,94,0.1)] dark:bg-[rgba(34,197,94,0.08)]
                             border border-[rgba(34,197,94,0.2)] dark:border-[rgba(34,197,94,0.15)]
                             flex items-center justify-center
                             hover:bg-[rgba(34,197,94,0.2)] dark:hover:bg-[rgba(34,197,94,0.15)]
                             transition-all duration-300"
                  >
                    <FileText className="w-4 h-4 text-[#2a5a2a] dark:text-[#6b8b6b]" />
                    {totalReports > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full 
                                   bg-gradient-to-r from-[#dc2626] to-[#ef4444] 
                                   text-[#f0f7f0] dark:text-[#0a0a0a] text-[10px] font-bold flex items-center justify-center px-1.5">
                        {totalReports > 99 ? '99+' : totalReports}
                      </span>
                    )}
                  </button>

                  <button 
                    onClick={() => {
                      setShowNotifications(true);
                      setShowMessages(false);
                      setShowReportNotify(false);
                    }}
                    className="relative w-10 h-10 rounded-xl bg-[rgba(34,197,94,0.1)] dark:bg-[rgba(34,197,94,0.08)]
                             border border-[rgba(34,197,94,0.2)] dark:border-[rgba(34,197,94,0.15)]
                             flex items-center justify-center
                             hover:bg-[rgba(34,197,94,0.2)] dark:hover:bg-[rgba(34,197,94,0.15)]
                             transition-all duration-300"
                  >
                    <Bell className="w-4 h-4 text-[#2a5a2a] dark:text-[#6b8b6b]" />
                    {unreadNotificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full 
                                   bg-gradient-to-r from-[#dc2626] to-[#ef4444] 
                                   text-[#f0f7f0] dark:text-[#0a0a0a] text-[10px] font-bold flex items-center justify-center px-1.5">
                        {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                      </span>
                    )}
                  </button>

                  <button 
                    onClick={() => {
                      setShowMessages(true);
                      setShowNotifications(false);
                      setShowReportNotify(false);
                    }}
                    className="relative w-10 h-10 rounded-xl bg-[rgba(34,197,94,0.1)] dark:bg-[rgba(34,197,94,0.08)]
                             border border-[rgba(34,197,94,0.2)] dark:border-[rgba(34,197,94,0.15)]
                             flex items-center justify-center
                             hover:bg-[rgba(34,197,94,0.2)] dark:hover:bg-[rgba(34,197,94,0.15)]
                             transition-all duration-300"
                  >
                    <MessageSquare className="w-4 h-4 text-[#2a5a2a] dark:text-[#6b8b6b]" />
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full 
                                   bg-gradient-to-r from-[#dc2626] to-[#ef4444] 
                                   text-[#f0f7f0] dark:text-[#0a0a0a] text-[10px] font-bold flex items-center justify-center px-1.5">
                      5
                    </span>
                  </button>
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar">
              <div className="min-h-[calc(100vh-100px)]">
                <Outlet />
              </div>
            </main>
          </div>

          {isSidebarOpen && isMobile && (
            <div
              className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-40 lg:hidden"
              onClick={toggleSidebar}
            />
          )}
        </div>
      </div>

      {/* Report Notify Modal */}
      {showReportNotify && (
        <ReportNotify onClose={() => setShowReportNotify(false)} />
      )}

      {/* Notifications Modal */}
      {showNotifications && (
        <Notifications onClose={handleNotificationsClose} />
      )}

      {/* Messages Modal */}
      {showMessages && (
        <AdminMessages onClose={() => setShowMessages(false)} />
      )}
    </>
  );
};

export default AdminPannel;