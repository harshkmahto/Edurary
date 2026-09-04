import React from 'react';
import load from '../assets/intro.gif';

const Loading = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center 
                    bg-gradient-to-b from-[#0a0503] via-[#1a0a06] to-[#0d0604]">
      
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] 
                      bg-gradient-to-br from-[#8b0000]/20 to-transparent 
                      rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] 
                      bg-gradient-to-tl from-[#c8963e]/15 to-transparent 
                      rounded-full blur-3xl animate-pulse" 
                      style={{ animationDelay: '1s' }} />
        
        {/* Stars */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/80 animate-twinkle"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 2 + 2}s`,
              opacity: Math.random() * 0.6 + 0.2
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-4">
        
        {/* GIF in middle - Big but not full screen */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-[#d4a85a]/20 rounded-full blur-3xl animate-pulse" />
          <img 
            src={load}
            alt="Loading"
            className="relative w-72 h-72 md:w-96 md:h-96 object-contain drop-shadow-[0_0_40px_rgba(200,150,62,0.3)]"
          />
        </div>

        {/* EDURARY Text at bottom */}
        <div className="absolute bottom-12 left-0 right-0 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-[#f5e6d3] 
                        tracking-tight animate-fade-in
                        bg-gradient-to-r from-[#c8963e] via-[#f5e6d3] to-[#c8963e] 
                        bg-clip-text text-transparent">
            EDURARY
          </h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#c8963e]/50" />
            <div className="h-1.5 w-1.5 bg-[#d4a85a] rounded-full animate-pulse" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#c8963e]/50" />
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-twinkle {
          animation: twinkle infinite ease-in-out;
        }
        
        .animate-fade-in {
          animation: fade-in 1.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default Loading;