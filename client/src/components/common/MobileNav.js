import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';

const MobileNav = () => {
  const location = useLocation();
  const { isDark } = useTheme();

  const navItems = [
    { path: '/dashboard', icon: HomeIcon, label: 'Home' },
    { path: '/expenses', icon: CurrencyDollarIcon, label: 'Expenses' },
    { path: '/budgets', icon: ChartBarIcon, label: 'Budgets' },
    { path: '/analytics', icon: ChartBarIcon, label: 'Analytics' },
    { path: '/profile', icon: UserIcon, label: 'Profile' }
  ];

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 ${
      isDark 
        ? 'bg-slate-900 border-t border-slate-700' 
        : 'bg-white border-t border-gray-200'
    } sm:hidden`}>
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? isDark
                    ? 'bg-slate-800 text-blue-400'
                    : 'bg-blue-50 text-blue-600'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-300'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 ${isActive ? 'scale-110' : ''} transition-transform duration-200`} />
              <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
        
        {/* Quick Add Button */}
        <Link
          to="/expenses"
          className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
            isDark
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          } shadow-lg`}
        >
          <PlusIcon className="h-5 w-5 mb-1" />
          <span className="text-xs font-medium">Add</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileNav;
