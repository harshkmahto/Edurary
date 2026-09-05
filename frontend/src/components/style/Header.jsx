import React, { useState, useEffect } from 'react';
import { Menu, X, BookOpen, Search, User, Sun, Moon, GraduationCap, Library, FileText, FlaskConical, MenuSquareIcon, MenuIcon } from 'lucide-react';
import Menubar from './Menubar';
import MainButton from './MainButton';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/DarkModeContext';
import { useAuth } from '../../context/authContext';
import logo from '../../assets/logo.png'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();

  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMenu();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const navItems = [
    { label: 'HOME', href: '/' },
    { label: 'BOOKS', href: '/books' },
    { label: 'COURSES', href: '/courses' },
    { label: 'TESTS', href: '/tests' },
  ];

  const handleProfileClick = () => {
    if (isAuthenticated && user) {
      navigate('/profile');
    } else {
      navigate('/auth/signin');
    }
  };

  


  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-[1000] 
                   backdrop-blur-[20px]
                   shadow-[0_4px_30px_rgba(0,0,0,0.3)]
                   px-4 sm:px-8 py-3 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                   ${isScrolled ? 'py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.5)]' : ''}
                   ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
      >
        <div className="max-w-full mx-auto flex items-center justify-between gap-4">
          {/* Logo - Left Side */}
          <a href="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-[#c8963e] to-[#d4a85a] 
                            rounded-xl flex items-center justify-center shadow-[0_4px_15px_rgba(200,150,62,0.3)]
                            group-hover:shadow-[0_4px_25px_rgba(200,150,62,0.5)] group-hover:scale-105
                            transition-all duration-300">
              <img src={logo} className='w-full h-full object-cover'/>
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-[#d4a85a] to-[#e8c87a] 
                               bg-clip-text text-transparent group-hover:from-[#e8c87a] group-hover:to-[#f5e6d3]
                               transition-all duration-300">
                EDURARY
              </span>
            </div>
          </a>

          {/* Navigation - Center with Background */}
          <nav className="hidden lg:flex items-center gap-1 px-2 py-1.5 rounded-2xl 
                         bg-[#2d1810]/40 backdrop-blur-sm border border-[#8b4513]/20
                         shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 
                           relative overflow-hidden group
                           ${item.label === 'HOME' 
                             ? 'text-[#f5e6d3] bg-gradient-to-r from-[#c8963e]/30 to-[#d4a85a]/30 border border-[#c8963e]/30 shadow-[0_0_20px_rgba(200,150,62,0.1)]' 
                             : 'text-[#d4b8a0] hover:text-[#d4a85a] hover:bg-[#c8963e]/10'}`}
              >
                <div className="relative overflow-hidden h-[20px]">
                  <div className="transition-transform duration-300 ease-out group-hover:-translate-y-full">
                    {item.label}
                  </div>
                  <div className="absolute inset-0 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0">
                    {item.label}
                  </div>
                </div>
              </a>
            ))}
          </nav>

          {/* Actions - Right Side */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full 
                       border border-[#8b4513]/30 bg-[#2d1810]/30
                       hover:border-[#c8963e]/50 hover:bg-[#c8963e]/10
                       transition-all duration-300 group"
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300
                            ${isDark ? 'bg-[#c8963e] shadow-[0_0_15px_rgba(200,150,62,0.3)]' : 'bg-[#8b4513]'}`}>
                {isDark ? 
                  <Moon className="w-3 h-3 text-[#1a0f0a]" /> : 
                  <Sun className="w-3 h-3 text-[#f5e6d3]" />
                }
              </div>
              <span className="text-xs font-medium text-[#d4b8a0] group-hover:text-[#d4a85a] transition-colors">
                {isDark ? 'Dark' : 'Light'}
              </span>
            </button>
            
            <button 
              onClick={() => navigate('/search')}
              className="hidden sm:flex w-9 h-9 rounded-xl border border-[#8b4513]/30 
                             bg-[#2d1810]/30 text-[#d4b8a0] hover:bg-[#c8963e]/15 
                             hover:text-[#d4a85a] hover:border-[#c8963e]/30 hover:-translate-y-0.5 
                             hover:shadow-[0_4px_15px_rgba(200,150,62,0.15)] hover:scale-105
                             items-center justify-center transition-all duration-300">
              <Search className="w-4 h-4" />
            </button>
            
            <button 
              onClick={handleProfileClick}
              className="hidden sm:flex w-9 h-9 rounded-xl border border-[#8b4513]/30 
                             bg-[#2d1810]/30 text-[#d4b8a0] hover:bg-[#c8963e]/15 
                             hover:text-[#d4a85a] hover:border-[#c8963e]/30 hover:-translate-y-0.5 
                             hover:shadow-[0_4px_15px_rgba(200,150,62,0.15)] hover:scale-105
                             items-center justify-center transition-all duration-300">
              {user.profilePicture ? 
              (
                <img src={user.profilePicture} className='w-8 h-8 object-cover' />
              ):(
              <User className="w-4 h-4" />
              )}
            </button>

            <button 
              onClick={toggleMenu}
              className="flex w-9 h-9 rounded-xl border border-[#8b4513]/30 
                             bg-[#2d1810]/30 text-[#d4b8a0] hover:bg-[#c8963e]/15 
                             hover:text-[#d4a85a] hover:border-[#c8963e]/30 hover:-translate-y-0.5 
                             hover:shadow-[0_4px_15px_rgba(200,150,62,0.15)] hover:scale-105
                             items-center justify-center transition-all duration-300">
              <MenuIcon className="w-4 h-4" />
            </button>

            
              <Link to="/subscription">
                <MainButton size='sm' text='SUBSCRIBE' />
              </Link>
          
          </div>
        </div>
      </header>

      <Menubar isOpen={isMenuOpen} onClose={closeMenu} />
    </>
  );
};

export default Header;