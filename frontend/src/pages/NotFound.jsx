import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Home, Star, Moon } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0a0503] via-[#1a0a06] to-[#0d0604] flex items-center justify-center">
      
      {/* Star Field Background */}
      <div className="absolute inset-0">
        {/* Stars */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
              opacity: Math.random() * 0.8 + 0.2
            }}
          />
        ))}

        {/* Nebula Effects */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] 
                      bg-gradient-to-br from-[#8b0000]/20 to-transparent 
                      rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] 
                      bg-gradient-to-tl from-[#c8963e]/10 to-transparent 
                      rounded-full blur-3xl animate-pulse" 
                      style={{ animationDelay: '1s' }} />
        
        {/* Planet/Moon */}
        <div className="absolute top-20 right-20 opacity-30 animate-float">
          <Moon className="w-24 h-24 text-[#d4a85a]" />
        </div>
        
        {/* Floating Stars */}
        <div className="absolute bottom-32 left-20 opacity-20 animate-float-delay">
          <Star className="w-16 h-16 text-[#c8963e]" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        
        {/* Glowing Orb Effect */}
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-[#d4a85a]/20 rounded-full blur-3xl animate-pulse" />
          
          {/* Astronaut/404 Display */}
          <div className="relative">
            <h1 className="text-[8rem] md:text-[12rem] font-bold leading-none 
                          bg-gradient-to-b from-[#f5e6d3] to-[#d4a85a] 
                          bg-clip-text text-transparent
                          drop-shadow-[0_0_30px_rgba(212,168,90,0.3)]">
              404
            </h1>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl md:text-5xl font-bold text-[#f5e6d3] mb-4 
                      tracking-tight animate-fade-in-up">
          Lost in Space
        </h2>

        {/* Description */}
        <p className="text-lg md:text-xl text-[#d4b8a0] mb-8 max-w-2xl mx-auto 
                      leading-relaxed font-light animate-fade-in-up"
           style={{ animationDelay: '0.2s' }}>
          The page you're looking for has drifted into the cosmic void. 
          It might have been moved, deleted, or simply lost among the stars.
        </p>

        {/* Floating Rocket Icon */}
        <div className="flex justify-center mb-12">
          <div className="relative">
            <Rocket className="w-16 h-16 text-[#d4a85a] animate-float" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-12 
                          bg-gradient-to-t from-[#c8963e]/30 to-transparent 
                          rounded-full blur-md" />
          </div>
        </div>

        {/* Back to Earth Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
             style={{ animationDelay: '0.4s' }}>
          
          {/* Primary Button */}
          <button 
            onClick={() => navigate('/')}
            className="group relative inline-flex items-center gap-3
                      bg-gradient-to-b from-[#c8963e] to-[#8b6914]
                      text-[#0a0503] font-semibold
                      px-8 py-4 rounded-2xl
                      hover:shadow-[0_0_40px_rgba(200,150,62,0.4)]
                      hover:scale-105
                      transition-all duration-300
                      overflow-hidden"
          >
            <Home className="w-5 h-5" />
            <span>Back to Earth</span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                           -translate-x-full group-hover:translate-x-full
                           transition-transform duration-700" />
          </button>

          {/* Secondary Button */}
          <button 
            onClick={() => navigate('/books')}
            className="inline-flex items-center gap-3
                      bg-white/5 backdrop-blur-sm
                      border border-[#c8963e]/30
                      text-[#d4a85a] font-medium
                      px-8 py-4 rounded-2xl
                      hover:bg-[#c8963e]/10 hover:border-[#c8963e]/50
                      hover:scale-105
                      transition-all duration-300"
          >
            <Rocket className="w-5 h-5" />
            <span>Explore Books</span>
          </button>
        </div>

        {/* Decorative Line */}
        <div className="mt-12 flex items-center justify-center gap-4">
          <div className="h-px w-24 bg-gradient-to-r from-transparent to-[#c8963e]/30" />
          <Star className="w-4 h-4 text-[#c8963e] opacity-50" />
          <div className="h-px w-24 bg-gradient-to-l from-transparent to-[#c8963e]/30" />
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes float-delay {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-twinkle {
          animation: twinkle infinite ease-in-out;
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-float-delay {
          animation: float-delay 5s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default NotFound;