import React, { useEffect, useState } from 'react';
import {
  X, BookOpen, GraduationCap, FileText, Users,
  Home, LogIn, UserPlus, Settings,
  ChevronRight, Sun, Moon, Library, Award,
  BadgeIndianRupeeIcon,
  InboxIcon,
  BookHeadphones,
  LogInIcon,
  LogOut,
  Crown,
  ShoppingBag,
  Save,
  SaveIcon,
  SaveAll,
  SaveCheck,
  SavePlus,
  LucideSave,
  Bookmark,
  IndianRupee
} from 'lucide-react';
import { useTheme } from '../../context/DarkModeContext';
import { useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png'

const Menubar = ({ isOpen, onClose }) => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // ✅ NEW: Handle navigation with menu close
  const handleNavigation = (path) => {
    onClose(); // Close menu first
    navigate(path); // Then navigate
  };

  const mainMenuItems = [
    { icon: Home, label: 'Home', path: '/', delay: 0 },
    { icon: BookOpen, label: 'Books', path: '/books', delay: 50 },
    { icon: FileText, label: 'Materials', path: '/materials', delay: 100 },
    { icon: GraduationCap, label: 'Courses', path: '/courses', delay: 150 },
    { icon: Award, label: 'Tests', path: '/tests', delay: 250 },
    { icon: Library, label: 'About Us', path: '/about', delay: 200 },
    { icon: Users, label: 'Community', path: '/community', delay: 300 },
    { icon: BadgeIndianRupeeIcon, label: 'Subscription', path: '/subscription', delay: 400 },
    { icon: InboxIcon, label: 'Reports', path: '/reports', delay: 350 },
  ];

  const logoutHandle = () => {
    onClose(); // Close menu before logout
    logout();
  };

  const loginHandle = () => {
    onClose(); // ✅ Close menu before navigating to login
    navigate('/auth/signin');
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-md z-[2000] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                    ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 w-[320px] max-w-[85vw] h-full 
                    bg-gradient-menubar
                    backdrop-blur-[30px] border-l border-[#6b1a1a]/30 
                    shadow-[-20px_0_60px_rgba(0,0,0,0.9)] p-6 
                    transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] 
                    z-[2001] flex flex-col
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between pb-5 border-b border-[#6b1a1a]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#c8963e] to-[#d4a85a] 
                            rounded-xl flex items-center justify-center
                            shadow-[0_4px_15px_rgba(200,150,62,0.3)]">
              <img src={logo} className='w-full h-full object-cover' alt="Logo" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#d4a85a] to-[#e8c87a] 
                           bg-clip-text text-transparent">
              EDURARY
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl border border-[#6b1a1a]/30 
                     bg-[#1a0a06]/50 text-[#d4b8a0] hover:bg-[#c8963e]/15 
                     hover:text-[#d4a85a] hover:border-[#c8963e]/30 
                     hover:rotate-90 hover:scale-110
                     transition-all duration-300 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 py-4 overflow-y-auto menubar-scroll">
          <div className="mb-6 p-3 rounded-xl bg-[#1a0a06]/50 border border-[#6b1a1a]/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isDark ? (
                  <Moon className="w-4 h-4 text-[#d4a85a]" />
                ) : (
                  <Sun className="w-4 h-4 text-[#d4a85a]" />
                )}
                <span className="text-sm font-medium text-[#d4b8a0]">
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-12 h-6 rounded-full transition-all duration-300
                          ${isDark ? 'bg-[#c8963e]' : 'bg-[#6b1a1a]'}
                          shadow-[0_0_20px_rgba(200,150,62,0.2)]`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white 
                            shadow-md transition-all duration-300
                            ${isDark ? 'left-6' : 'left-0.5'}`}
                />
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-[1.5px] text-[#a08070] pl-2 mb-3">
              Main Menu
            </h3>
            <ul className="space-y-0.5">
              {mainMenuItems.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-xl 
                               text-[#d4b8a0] hover:text-[#d4a85a] hover:bg-[#c8963e]/10 
                               text-sm font-medium
                               hover:translate-x-1 hover:shadow-[0_4px_15px_rgba(200,150,62,0.05)]
                               transition-all duration-300
                               ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}
                    style={{ transitionDelay: `${item.delay}ms` }}
                  >
                    <span className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-[#a08070] group-hover:text-[#d4a85a] 
                                          transition-all duration-300 group-hover:scale-110" />
                      <span>{item.label}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 
                                           transition-all duration-300 group-hover:translate-x-1" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-[#6b1a1a]/30 to-transparent my-4" />

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[1.5px] text-[#a08070] pl-2 mb-3">
              Account
            </h3>

            {user && (
              <div className="mb-2">
                <button
                  onClick={() => handleNavigation('/profile')}
                  className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-xl 
                             text-[#d4b8a0] hover:text-[#d4a85a] hover:bg-[#c8963e]/10 
                             text-sm font-medium
                             hover:translate-x-1 hover:shadow-[0_4px_15px_rgba(200,150,62,0.05)]
                             transition-all duration-300
                             ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}
                  style={{ transitionDelay: '550ms' }}
                >
                  <span className="flex items-center gap-3">
                    <UserPlus className="w-4 h-4 text-[#a08070] group-hover:text-[#d4a85a] 
                                       transition-all duration-300 group-hover:scale-110" />
                    <span>Profile</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 
                                         transition-all duration-300 group-hover:translate-x-1" />
                </button>
                
                <div className="px-3 py-1.5 m-1 text-xs text-[#a08070] border border-[#6b1a1a]/20 rounded-lg bg-[#1a0a06]/30">
                  Login as: {user.name}
                </div>
               
                <button
                  onClick={() => handleNavigation('/orders')}
                  className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-xl 
                             text-[#d4b8a0] hover:text-[#d4a85a] hover:bg-[#c8963e]/10 
                             text-sm font-medium
                             hover:translate-x-1 hover:shadow-[0_4px_15px_rgba(200,150,62,0.05)]
                             transition-all duration-300
                             ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}
                  style={{ transitionDelay: '550ms' }}
                >
                  <span className="flex items-center gap-3">
                    <ShoppingBag className="w-4 h-4 text-[#a08070] group-hover:text-[#d4a85a] 
                                       transition-all duration-300 group-hover:scale-110" />
                    <span>Orders</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 
                                         transition-all duration-300 group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => handleNavigation('/invoices')}
                  className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-xl 
                             text-[#d4b8a0] hover:text-[#d4a85a] hover:bg-[#c8963e]/10 
                             text-sm font-medium
                             hover:translate-x-1 hover:shadow-[0_4px_15px_rgba(200,150,62,0.05)]
                             transition-all duration-300
                             ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}
                  style={{ transitionDelay: '550ms' }}
                >
                  <span className="flex items-center gap-3">
                    <IndianRupee className="w-4 h-4 text-[#a08070] group-hover:text-[#d4a85a] 
                                       transition-all duration-300 group-hover:scale-110" />
                    <span>Invoices</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 
                                         transition-all duration-300 group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => handleNavigation('/save')}
                  className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-xl 
                             text-[#d4b8a0] hover:text-[#d4a85a] hover:bg-[#c8963e]/10 
                             text-sm font-medium
                             hover:translate-x-1 hover:shadow-[0_4px_15px_rgba(200,150,62,0.05)]
                             transition-all duration-300
                             ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}
                  style={{ transitionDelay: '550ms' }}
                >
                  <span className="flex items-center gap-3">
                    <Bookmark className="w-4 h-4 text-[#a08070] group-hover:text-[#d4a85a] 
                                       transition-all duration-300 group-hover:scale-110" />
                    <span>Save</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 
                                         transition-all duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            )}

            {user?.role === 'admin' && (
              <button
                onClick={() => handleNavigation('/admin')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl 
                           text-[#d4b8a0] hover:text-[#d4a85a] hover:bg-[#c8963e]/10 
                           text-sm font-medium cursor-pointer
                           hover:translate-x-1 hover:shadow-[0_4px_15px_rgba(200,150,62,0.05)]
                           transition-all duration-300
                           ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}
                style={{ transitionDelay: '600ms' }}
              >
                <Crown className="w-6 h-6 text-[#a08070] group-hover:text-[#d4a85a] 
                                 transition-all duration-300" />
                Admin
              </button>
            )}

            {user ? (
              <button
                onClick={logoutHandle}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl 
                           text-[#d4b8a0] hover:text-[#d5400e] hover:bg-[#c8963e]/10 
                           text-sm font-medium cursor-pointer
                           hover:translate-x-1 hover:shadow-[0_4px_15px_rgba(200,150,62,0.05)]
                           transition-all duration-300
                           ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}
                style={{ transitionDelay: '600ms' }}
              >
                <LogOut className="w-4 h-4 text-[#a08070] group-hover:text-[#d4a85a] 
                                  transition-all duration-300" />
                Logout
              </button>
            ) : (
              <button
                onClick={loginHandle}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl 
                           text-[#d4b8a0] hover:text-[#d4a85a] hover:bg-[#c8963e]/10 
                           text-sm font-medium cursor-pointer
                           hover:translate-x-1 hover:shadow-[0_4px_15px_rgba(200,150,62,0.05)]
                           transition-all duration-300
                           ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}
                style={{ transitionDelay: '600ms' }}
              >
                <LogIn className="w-4 h-4 text-[#a08070] group-hover:text-[#d4a85a] 
                                 transition-all duration-300" />
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Menubar;