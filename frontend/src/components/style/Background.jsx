import React from 'react';

const Background = () => {
  return (
    <svg 
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 900"
      preserveAspectRatio="none"
    >
      <defs>
        {/* Main gradient - Black to Brownish-Reddish */}
        <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a0503" />
          <stop offset="35%" stopColor="#1a0a06" />
          <stop offset="65%" stopColor="#2d120a" />
          <stop offset="100%" stopColor="#0d0604" />
        </linearGradient>

        {/* Reddish glow */}
        <radialGradient id="redGlow" cx="30%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#6b1a1a" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
        </radialGradient>

        {/* Gold glow */}
        <radialGradient id="goldGlow" cx="70%" cy="50%" r="40%">
          <stop offset="0%" stopColor="#c8963e" stopOpacity="0.1"/>
          <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
        </radialGradient>

        {/* Subtle grid pattern */}
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#c8963e" opacity="0.08" />
        </pattern>

        {/* Line gradient */}
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor="#c8963e" stopOpacity="0.06" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>

      {/* Base background */}
      <rect width="100%" height="100%" fill="url(#bgGrad)" />
      
      {/* Glow overlays */}
      <rect width="100%" height="100%" fill="url(#redGlow)" />
      <rect width="100%" height="100%" fill="url(#goldGlow)" />
      
      {/* Grid pattern */}
      <rect width="100%" height="100%" fill="url(#grid)" />

      {/* 3D Curve Lines */}
      <path d="M0,150 C400,80 1000,200 1440,120" stroke="url(#lineGrad)" strokeWidth="2" fill="none" />
      <path d="M0,350 C500,300 900,400 1440,330" stroke="url(#lineGrad)" strokeWidth="1.5" fill="none" />
      <path d="M0,550 C300,500 800,600 1440,530" stroke="url(#lineGrad)" strokeWidth="2" fill="none" />
      <path d="M0,750 C600,700 1000,800 1440,730" stroke="url(#lineGrad)" strokeWidth="1.5" fill="none" />

      {/* Decorative dots */}
      <circle cx="150" cy="200" r="2" fill="#c8963e" opacity="0.15" />
      <circle cx="1300" cy="300" r="1.5" fill="#d4a85a" opacity="0.12" />
      <circle cx="200" cy="600" r="2" fill="#c8963e" opacity="0.15" />
      <circle cx="1200" cy="650" r="1.5" fill="#d4a85a" opacity="0.12" />
      <circle cx="700" cy="100" r="1.5" fill="#c8963e" opacity="0.1" />
      <circle cx="750" cy="800" r="2" fill="#c8963e" opacity="0.15" />
    </svg>
  );
};

export default Background;