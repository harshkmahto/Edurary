import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Mail, MapPin, Phone, Heart, ArrowUp } from 'lucide-react';
import logo from '../../assets/logo.png'

const Footer = () => {
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-20 bg-gradient-to-b from-[#0d0604] via-[#1a0a06] to-[#2d120a] border-t border-[#6b1a1a]/30 pt-12 pb-5 px-5 sm:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-10">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-2xl font-bold">
              <img src={logo} className='w-12 h-12 object-cover'/>
              <span className="bg-gradient-to-r from-[#d4a85a] to-[#e8c87a] bg-clip-text text-transparent">
                EDURARY
              </span>
            </div>
           
            <div className="flex gap-2.5 ">
              {/* Facebook */}
              <a href="#" className="w-10 h-10 rounded-xl border border-[#6b1a1a]/30 bg-[#1a0a06]/30 text-[#d4b8a0] hover:bg-[#c8963e]/15 hover:text-[#d4a85a] hover:border-[#c8963e]/30 hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(200,150,62,0.15)] flex items-center justify-center transition-all duration-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              
              {/* Twitter */}
              <a href="#" className="w-10 h-10 rounded-xl border border-[#6b1a1a]/30 bg-[#1a0a06]/30 text-[#d4b8a0] hover:bg-[#c8963e]/15 hover:text-[#d4a85a] hover:border-[#c8963e]/30 hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(200,150,62,0.15)] flex items-center justify-center transition-all duration-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              
              {/* Instagram */}
              <a href="#" className="w-10 h-10 rounded-xl border border-[#6b1a1a]/30 bg-[#1a0a06]/30 text-[#d4b8a0] hover:bg-[#c8963e]/15 hover:text-[#d4a85a] hover:border-[#c8963e]/30 hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(200,150,62,0.15)] flex items-center justify-center transition-all duration-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              
              {/* YouTube */}
              <a href="#" className="w-10 h-10 rounded-xl border border-[#6b1a1a]/30 bg-[#1a0a06]/30 text-[#d4b8a0] hover:bg-[#c8963e]/15 hover:text-[#d4a85a] hover:border-[#c8963e]/30 hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(200,150,62,0.15)] flex items-center justify-center transition-all duration-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              
              {/* GitHub */}
              <a href="#" className="w-10 h-10 rounded-xl border border-[#6b1a1a]/30 bg-[#1a0a06]/30 text-[#d4b8a0] hover:bg-[#c8963e]/15 hover:text-[#d4a85a] hover:border-[#c8963e]/30 hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(200,150,62,0.15)] flex items-center justify-center transition-all duration-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.15 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.62.24 2.85.12 3.15.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-[#d4a85a]">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Books Library', path: '/books' },
                { label: 'Courses', path: '/courses' },
                { label: 'Subscriptions', path: '/subscription' },
                { label: 'My Orders', path: '/orders' },
                { label: 'Invoices', path: '/invoices' },
                { label: 'Profile', path: '/profile' }
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => handleNavigate(item.path)}
                    className="text-[#d4b8a0] text-sm hover:text-[#d4a85a] hover:translate-x-1 inline-block transition-all duration-300 cursor-pointer"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Support */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-[#d4a85a]">Legal & Support</h3>
            <ul className="space-y-2.5">
              {[
                'Privacy Policy',
                'Terms of Service',
                'Cookie Policy',
                'Support Center',
                'FAQ'
              ].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => handleNavigate(`/${item.toLowerCase().replace(/\s+/g, '-')}`)}
                    className="text-[#d4b8a0] text-sm hover:text-[#d4a85a] hover:translate-x-1 inline-block transition-all duration-300 cursor-pointer"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-[#d4a85a]">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-[#d4b8a0] text-sm">
                <MapPin className="w-4 h-4 text-[#c8963e] flex-shrink-0" />
                <span>123 Education Street, Knowledge City</span>
              </li>
              <li className="flex items-center gap-3 text-[#d4b8a0] text-sm">
                <Mail className="w-4 h-4 text-[#c8963e] flex-shrink-0" />
                <span>support@edurary.com</span>
              </li>
              <li className="flex items-center gap-3 text-[#d4b8a0] text-sm">
                <Phone className="w-4 h-4 text-[#c8963e] flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
            </ul>
          </div>
        </div>

       
      </div>
    </footer>
  );
};

export default Footer;