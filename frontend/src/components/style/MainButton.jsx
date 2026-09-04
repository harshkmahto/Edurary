import React from 'react';

const MainButton = ({ 
  text = 'Start Journey',
  href = '#',
  onClick,
  className = '',
  icon = '',
  size = 'default',
  variant = 'primary',
  fullWidth = false,
  target,
  rel,
  ...props 
}) => {
  // Size variations
  const sizeClasses = {
    sm: 'px-5 py-2 text-sm',
    default: 'px-8 py-3 text-base',
    lg: 'px-10 py-4 text-lg',
  };

  // Variant styles - Yellowish theme with glow
  const variantStyles = {
    primary: {
      background: 'linear-gradient(96.76deg, #d4a85a 5.3%, #8b6914 234.66%)',
      hoverBg: 'linear-gradient(96.76deg, #e8c87a 5.3%, #a07820 234.66%)',
      textColor: 'text-[#0d0604]',
      shadow: 'rgba(212, 168, 90, 0.6)',
      glowColor: 'rgba(212, 168, 90, 0.5)',
      border: 'border-transparent',
    },
    secondary: {
      background: 'linear-gradient(96.76deg, #8b4513 5.3%, #3d1a0e 234.66%)',
      hoverBg: 'linear-gradient(96.76deg, #a0522d 5.3%, #4a0f0f 234.66%)',
      textColor: 'text-[#f5e6d3]',
      shadow: 'rgba(139, 69, 19, 0.6)',
      glowColor: 'rgba(139, 69, 19, 0.4)',
      border: 'border-transparent',
    },
    outline: {
      background: 'transparent',
      hoverBg: 'transparent',
      textColor: 'text-[#d4a85a]',
      shadow: 'rgba(212, 168, 90, 0.3)',
      glowColor: 'rgba(212, 168, 90, 0.2)',
      border: 'border-2 border-[#d4a85a]',

    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.primary;

  const buttonContent = (
    <div className="relative overflow-hidden w-full cursor-pointer active:scale-95">
      <div className="transition-transform duration-300 ease-out group-hover:-translate-y-full">
        {text} {icon && <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">{icon}</span>}
      </div>
      <div className="absolute inset-0 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0">
        {text} {icon && <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">{icon}</span>}
      </div>
    </div>
  );

  const buttonClassName = `
    ${currentVariant.textColor}
    text-center group font-semibold
    ${sizeClasses[size] || sizeClasses.default}
    rounded-xl outline-none
    transition-all duration-300
    border ${currentVariant.border}
    relative overflow-hidden
    inline-block
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim();

  const buttonStyle = {
    background: currentVariant.background,
    backgroundSize: '150% 100%',
    backgroundPosition: 'right center',
    transition: 'background-position 0.4s ease, box-shadow 0.3s ease, transform 0.3s ease',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  };

  const handleMouseEnter = (e) => {
    const target = e.currentTarget;
    target.style.backgroundPosition = 'left center';
    target.style.boxShadow = `0 0px 40px 10px ${currentVariant.shadow}`;
    target.style.transform = 'translateY(-2px) scale(1.02)';
  };

  const handleMouseLeave = (e) => {
    const target = e.currentTarget;
    target.style.backgroundPosition = 'right center';
    target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    target.style.transform = 'translateY(0) scale(1)';
  };

  // If it's a link
  if (href && href !== '#') {
    return (
      <a
        href={href}
        className={buttonClassName}
        style={buttonStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        target={target}
        rel={rel}
        {...props}
      >
        {buttonContent}
      </a>
    );
  }

  // If it's a button
  return (
    <button
      onClick={onClick}
      className={buttonClassName}
      style={buttonStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {buttonContent}
    </button>
  );
};

export default MainButton;