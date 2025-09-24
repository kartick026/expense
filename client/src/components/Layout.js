import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import MobileNav from './common/MobileNav';

const Layout = () => {
  const { isDark } = useTheme();
  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100'
    }`}>
      {/* Main content */}
      <main className="flex-1 pb-16 sm:pb-0">
        <Outlet />
      </main>
      
      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

export default Layout;