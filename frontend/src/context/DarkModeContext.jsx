// context/DarkModeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first
    const theme = localStorage.getItem("theme");
    if (theme) {
      return theme === "dark";
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove both classes first to avoid conflicts
    root.classList.remove('light', 'dark');
    
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.add('light');
      localStorage.setItem("theme", "light");
    }
    
    // Debug log
    console.log('Theme changed to:', isDark ? 'dark' : 'light');
    console.log('HTML classes:', root.className);
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  return (
    <DarkModeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useTheme must be used within a DarkModeProvider');
  }
  return context;
};