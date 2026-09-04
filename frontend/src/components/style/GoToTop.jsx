import React, { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";

const GoToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
  
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }


      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const maxScroll = documentHeight - windowHeight;
      const progress = (scrollTop / maxScroll) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const radius = 25; 
  const circumference = 2 * Math.PI * radius; 
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 group"
          aria-label="Go to top"
        >
       
          <div className="relative">
          
            <div className="absolute inset-0 bg-white/10 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300 group-hover:scale-95 "></div>
            
           
            <div className="relative bg-white/10 backdrop-blur-md border border-white/30 rounded-full p-3 cursor-pointer transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:border-white/50 shadow-lg hover:shadow-2xl hover:shadow-[#FF3C38]">
            
              <svg
                className="absolute top-0 left-0 w-full h-full -rotate-90"
                style={{ overflow: "visible" }}
              >
                <circle
                  cx="50%"
                  cy="50%"
                  r={radius}
                  fill="none"
                  stroke="rgba(239, 68, 68, 0.3)" 
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r={radius}
                  fill="none"
                  stroke="#c8963e"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-200 ease-out"
                />
              </svg>
              
              {/* Arrow icon */}
              <FaArrowUp className="text-[#c8963e] relative z-10"  />
            </div>
          </div>
          
  
          <span className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs font-medium text-white bg-black/50 backdrop-blur-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
            Back to top ({Math.round(scrollProgress)}%)
          </span>
        </button>
      )}
    </>
  );
};

export default GoToTop;