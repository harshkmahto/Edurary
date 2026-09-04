// components/admin/AdminGoToTop.jsx (Chevron style)
import React, { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";

const AdminGoToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const getScrollContainer = () => {
      const mainElement = document.querySelector('main.custom-scrollbar');
      if (mainElement) return mainElement;
      return window;
    };

    const handleScroll = () => {
      const container = getScrollContainer();
      
      let scrollTop, scrollHeight, clientHeight;
      
      if (container === window) {
        scrollTop = window.scrollY;
        scrollHeight = document.documentElement.scrollHeight;
        clientHeight = window.innerHeight;
      } else {
        scrollTop = container.scrollTop;
        scrollHeight = container.scrollHeight;
        clientHeight = container.clientHeight;
      }

      if (scrollTop > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      const maxScroll = scrollHeight - clientHeight;
      const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    const container = getScrollContainer();
    container.addEventListener("scroll", handleScroll);
    
    setTimeout(handleScroll, 100);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    const container = document.querySelector('main.custom-scrollbar');
    if (container) {
      container.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-[9999] group"
          aria-label="Go to top"
        >
          <div className="relative">
            {/* Glow behind button */}
            <div className="absolute -inset-2 bg-gradient-to-r from-[#22c55e]/30 to-[#4ade80]/20 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
            
            {/* Glass morphism button */}
            <div className="relative w-14 h-14 bg-white/10 backdrop-blur-md border-2 border-[#22c55e]/30 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-[#22c55e]/20 transition-all duration-300 group-hover:scale-110 group-hover:border-[#22c55e]/60">
              
              {/* Progress ring */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 56 56"
              >
                <rect
                  x="3"
                  y="3"
                  width="50"
                  height="50"
                  rx="12"
                  fill="none"
                  stroke="rgba(34, 197, 94, 0.15)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect
                  x="3"
                  y="3"
                  width="50"
                  height="50"
                  rx="12"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="188"
                  strokeDashoffset={188 - (scrollProgress / 100) * 188}
                  className="transition-all duration-200 ease-out"
                />
              </svg>
              
              {/* Icon - Chevron arrow without line */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg 
                  className="w-7 h-7 text-[#22c55e] relative z-10 group-hover:-translate-y-1 transition-all duration-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </div>
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#22c55e]/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
          
          {/* Tooltip */}
          <span className="absolute -top-12 right-0 px-3 py-1.5 text-xs font-medium text-white bg-black/80 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-lg border border-white/10">
            <span className="flex items-center gap-2">
              <span>↑ Back to top</span>
              <span className="px-1.5 py-0.5 bg-[#22c55e]/30 rounded-md text-[#4ade80] text-[10px]">
                {Math.round(scrollProgress)}%
              </span>
            </span>
          </span>
        </button>
      )}
    </>
  );
};

export default AdminGoToTop;