import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex h-10 w-10 items-center justify-center
        rounded-full transition-all duration-300 ease-in-out
        ${isDark 
          ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-900' 
          : 'bg-gray-800 hover:bg-gray-900 text-yellow-400'
        }
        shadow-lg hover:shadow-xl transform hover:scale-110
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${isDark ? 'focus:ring-yellow-400' : 'focus:ring-gray-800'}
        ${className}
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-6 h-6">
        <SunIcon 
          className={`
            absolute inset-0 w-6 h-6 transition-all duration-300 ease-in-out
            ${isDark ? 'opacity-0 rotate-180 scale-0' : 'opacity-100 rotate-0 scale-100'}
          `}
        />
        <MoonIcon 
          className={`
            absolute inset-0 w-6 h-6 transition-all duration-300 ease-in-out
            ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-0'}
          `}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
