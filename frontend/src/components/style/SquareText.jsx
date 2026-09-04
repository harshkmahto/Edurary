import React from 'react';

const SquareText = ({ 
  text = 'READ',
  className = '',
  size = 'default',
  variant = 'primary'
}) => {
  const sizeClasses = {
    sm: 'text-lg sm:text-xl px-3 py-1.5',
    default: 'text-2xl sm:text-3xl px-4 py-2',
    lg: 'text-3xl sm:text-4xl px-5 py-2.5',
    xl: 'text-4xl sm:text-5xl px-6 py-3',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    default: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
    xl: 'w-3 h-3',
  };

  const variantStyles = {
    primary: {
      bg: 'bg-[#c8963e]/10',
      border: 'border-[#c8963e]',
      text: 'text-white',
      dot: 'bg-[#c8963e]',
      dotShadow: 'shadow-[0_0_12px_rgba(200,150,62,0.6)]',
    },
    secondary: {
      bg: 'bg-[#d4a85a]/10',
      border: 'border-[#d4a85a]',
      text: 'text-[#f5e6d3]',
      dot: 'bg-[#d4a85a]',
      dotShadow: 'shadow-[0_0_12px_rgba(212,168,90,0.6)]',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.primary;
  const currentSize = sizeClasses[size] || sizeClasses.default;
  const currentDotSize = dotSizes[size] || dotSizes.default;

  return (
    <span 
      className={`relative inline-block ${currentVariant.bg} 
                 ${currentVariant.border} border 
                 ${currentVariant.text} ${currentSize}
                 font-bold tracking-wider rounded-md
                 ${className}`}
    >
      {text}
      
      {/* Top Left Dot */}
      <span 
        className={`absolute ${currentDotSize} rounded-full ${currentVariant.dot} 
                   ${currentVariant.dotShadow}
                   top-0 left-0 -translate-x-1/2 -translate-y-1/2`}
      />
      
      {/* Top Right Dot */}
      <span 
        className={`absolute ${currentDotSize} rounded-full ${currentVariant.dot} 
                   ${currentVariant.dotShadow}
                   top-0 right-0 translate-x-1/2 -translate-y-1/2`}
      />
      
      {/* Bottom Left Dot */}
      <span 
        className={`absolute ${currentDotSize} rounded-full ${currentVariant.dot} 
                   ${currentVariant.dotShadow}
                   bottom-0 left-0 -translate-x-1/2 translate-y-1/2`}
      />
      
      {/* Bottom Right Dot */}
      <span 
        className={`absolute ${currentDotSize} rounded-full ${currentVariant.dot} 
                   ${currentVariant.dotShadow}
                   bottom-0 right-0 translate-x-1/2 translate-y-1/2`}
      />

      {/* Subtle Glow Line - Top */}
      <span className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-[#c8963e]/50 to-transparent" />
      
      {/* Subtle Glow Line - Bottom */}
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-[#c8963e]/50 to-transparent" />
    </span>
  );
};

export default SquareText;