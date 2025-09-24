import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SparklesIcon,
  BoltIcon,
  FireIcon,
  BellIcon,
  ChevronDownIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { summaryAPI } from '../../services/api';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import Badge from '../common/Badge';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [animatedNavbarOpen, setAnimatedNavbarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await summaryAPI.getDashboardSummary();
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleAnimatedNavbar = () => {
    setAnimatedNavbarOpen(!animatedNavbarOpen);
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: CurrencyDollarIcon },
    { name: 'Expenses', href: '/expenses', icon: CurrencyDollarIcon },
    { name: 'Budgets', href: '/budgets', icon: ChartBarIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your financial dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
            <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={loadDashboardData} variant="primary">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { 
    currentMonth = { total: 0, count: 0, change: 0 }, 
    thisWeek = { total: 0, count: 0 }, 
    topCategories = [], 
    budgetStatus = [], 
    alerts = 0 
  } = dashboardData || {};

  // Ensure all values are properly defined
  const safeCurrentMonth = {
    total: currentMonth?.total || 0,
    count: currentMonth?.count || 0,
    change: currentMonth?.change || 0
  };

  const safeThisWeek = {
    total: thisWeek?.total || 0,
    count: thisWeek?.count || 0
  };

  const safeTopCategories = topCategories || [];
  const safeBudgetStatus = budgetStatus || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
                   {/* Logo */}
                   <div className="flex items-center">
                     <button
                       onClick={toggleAnimatedNavbar}
                       className="flex items-center space-x-2 sm:space-x-3 group"
                     >
                       <div className="relative">
                         <div className="p-2 sm:p-2.5 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl group-hover:scale-105 transition-transform duration-300 shadow-lg">
                           <SparklesIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                         </div>
                       </div>
                       <div className="hidden sm:block">
                         <h1 className="text-xl sm:text-2xl font-bold text-white">
                           Expensifyr
                         </h1>
                       </div>
                     </button>
                   </div>

                   {/* Right side actions */}
                   <div className="flex items-center space-x-2 sm:space-x-3">
                     {/* Quick Add Button */}
                     <Link
                       to="/expenses"
                       className="hidden sm:flex items-center px-3 sm:px-4 py-2 sm:py-2.5 bg-white text-blue-600 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium hover:bg-blue-50 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                     >
                       <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                       <span className="hidden md:inline">Add Expense</span>
                       <span className="md:hidden">Add</span>
                     </Link>

                     {/* Notifications */}
                     <button className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition-all duration-300 relative">
                       <BellIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                       <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 h-1.5 w-1.5 sm:h-2 sm:w-2 bg-red-400 rounded-full"></span>
                     </button>

                     {/* Profile */}
                     <div className="relative">
                       <button
                         onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                         className="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-1.5 rounded-lg sm:rounded-xl hover:bg-white/10 transition-all duration-300"
                       >
                         <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                           <span className="text-xs sm:text-sm font-semibold text-white">
                             {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                           </span>
                         </div>
                         <span className="hidden xl:block text-sm font-medium text-white">
                           {user?.username}
                         </span>
                         <ChevronDownIcon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-200" />
                       </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 animate-scale-in">
                    <div className="py-2">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-200"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <UserIcon className="mr-3 h-4 w-4" />
                        Profile Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 transition-colors duration-200"
                      >
                        <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section with 3D Animations */}
      <div className="relative overflow-hidden min-h-[80vh] flex items-center">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600"></div>
        
        {/* 3D Floating Geometric Shapes */}
        <div className="absolute inset-0 perspective-1000">
          <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-20 animate-float shadow-blue"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-br from-teal-400 to-cyan-500 transform rotate-45 opacity-20 animate-float-reverse shadow-blue"></div>
          <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg opacity-20 animate-spin shadow-blue" style={{animationDuration: '8s'}}></div>
          <div className="absolute top-1/2 right-20 w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full opacity-20 animate-ping animate-glow" style={{animationDuration: '3s'}}></div>
          <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-br from-sky-400 to-blue-500 transform rotate-12 opacity-20 animate-float shadow-blue" style={{animationDuration: '5s'}}></div>
          <div className="absolute top-1/3 left-1/3 w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-30 animate-bounce animate-shimmer" style={{animationDuration: '4s'}}></div>
        </div>

        {/* 3D Parallax Layers */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 backdrop-blur-sm rounded-3xl transform rotate-12 animate-pulse" style={{animationDuration: '7s'}}></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/5 backdrop-blur-sm rounded-2xl transform -rotate-12 animate-pulse" style={{animationDuration: '9s'}}></div>
        </div>
        
        <div className="relative px-6 py-16 sm:px-8 lg:px-12 w-full z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              {/* 3D Animated Logo */}
              <div className="flex items-center justify-center mb-8 transform hover:scale-105 transition-all duration-500">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-3xl transform rotate-6 animate-pulse"></div>
                  <div className="relative bg-white/20 backdrop-blur-sm rounded-2xl p-4 mr-6 transform hover:rotate-6 transition-transform duration-500">
                    <SparklesIcon className="h-12 w-12 text-white animate-spin" style={{animationDuration: '3s'}} />
                  </div>
                </div>
                <div className="transform hover:scale-105 transition-transform duration-500">
                  <h1 className="text-6xl md:text-7xl font-bold text-white mb-2 transform hover:translate-y-2 transition-transform duration-500">
                    Welcome to{' '}
                    <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent animate-pulse transform hover:scale-110 transition-transform duration-500 inline-block">
                      Expensifyr
                    </span>
                  </h1>
                  <div className="w-32 h-1 bg-gradient-to-r from-cyan-300 to-blue-300 mx-auto rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* 3D Animated Text */}
              <div className="transform hover:translate-y-2 transition-transform duration-500">
                <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Take control of your finances with our{' '}
                  <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent font-semibold">
                    intelligent
                  </span>{' '}
                  expense tracking and budget management system
                </p>
              </div>

                     {/* 3D Animated Buttons - Responsive */}
                     <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center transform hover:translate-y-2 transition-transform duration-500 px-4">
                       <div className="relative group w-full sm:w-auto">
                         <div className="absolute inset-0 bg-white/20 rounded-xl transform rotate-3 group-hover:rotate-6 transition-transform duration-300"></div>
                         <Link 
                           to="/expenses" 
                           className="relative bg-white text-blue-600 hover:bg-blue-50 shadow-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-3xl w-full sm:w-auto text-sm sm:text-base py-3 sm:py-4 px-6 sm:px-8 rounded-lg font-medium flex items-center justify-center no-underline"
                         >
                           <PlusIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 animate-bounce" />
                           <span className="hidden xs:inline">Add New Expense</span>
                           <span className="xs:hidden">Add Expense</span>
                         </Link>
                       </div>
                       <div className="relative group w-full sm:w-auto">
                         <div className="absolute inset-0 bg-white/10 rounded-xl transform -rotate-3 group-hover:-rotate-6 transition-transform duration-300"></div>
                         <Link 
                           to="/analytics" 
                           className="relative text-white border-2 border-white hover:bg-white/20 shadow-xl transform hover:scale-105 transition-all duration-300 hover:shadow-2xl backdrop-blur-sm w-full sm:w-auto text-sm sm:text-base py-3 sm:py-4 px-6 sm:px-8 rounded-lg font-medium flex items-center justify-center no-underline"
                         >
                           <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 animate-pulse" />
                           <span className="hidden xs:inline">View Analytics</span>
                           <span className="xs:hidden">Analytics</span>
                         </Link>
                       </div>
                     </div>
            </div>
          </div>
        </div>

        {/* Animated Wave Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-blue-50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cyan-50 to-transparent opacity-50"></div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-12 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Current Month */}
            <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl hover-lift glass">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full -translate-y-16 translate-x-16 opacity-10"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl">
                    <CurrencyDollarIcon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant={safeCurrentMonth.change >= 0 ? "danger" : "success"} size="sm">
                    {safeCurrentMonth.change >= 0 ? (
                      <ArrowUpIcon className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownIcon className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(safeCurrentMonth.change).toFixed(1)}%
                  </Badge>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">This Month</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">₹{safeCurrentMonth.total.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{safeCurrentMonth.count} transactions</p>
              </div>
            </Card>

            {/* This Week */}
            <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl hover-lift glass">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full -translate-y-16 translate-x-16 opacity-10"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="info" size="sm">
                    <BoltIcon className="h-3 w-3 mr-1" />
                    Weekly
                  </Badge>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">This Week</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">₹{safeThisWeek.total.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{safeThisWeek.count} transactions</p>
              </div>
            </Card>

            {/* Budget Alerts */}
            <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl hover-lift glass">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400 to-red-500 rounded-full -translate-y-16 translate-x-16 opacity-10"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl">
                    <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant={alerts > 0 ? "danger" : "success"} size="sm">
                    <FireIcon className="h-3 w-3 mr-1" />
                    {alerts > 0 ? `${alerts} alerts` : 'All good'}
                  </Badge>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Budget Alerts</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">{alerts}</p>
                <p className="text-xs text-gray-500">{alerts > 0 ? 'Need attention' : 'All budgets on track'}</p>
              </div>
            </Card>

            {/* Total Transactions */}
            <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl hover-lift glass">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full -translate-y-16 translate-x-16 opacity-10"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl">
                    <ArrowUpIcon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="secondary" size="sm">
                    <SparklesIcon className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Transactions</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">{safeCurrentMonth.count}</p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
            </Card>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Categories */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <Card.Header className="border-b border-gray-200/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg mr-3">
                      <ChartBarIcon className="h-5 w-5 text-white" />
                    </div>
                    Top Categories
                  </h3>
                  <Button as={Link} to="/analytics" variant="ghost" size="sm">
                    View All
                  </Button>
                </div>
              </Card.Header>
              <Card.Body className="p-6">
                <div className="space-y-4">
                  {safeTopCategories.length > 0 ? (
                    safeTopCategories.map((category, index) => (
                      <div key={category.category} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-indigo-50 hover:to-purple-50 transition-all duration-300">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className={`h-3 w-3 rounded-full ${
                              index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                              index === 1 ? 'bg-gradient-to-r from-blue-400 to-cyan-500' :
                              index === 2 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                              'bg-gradient-to-r from-purple-400 to-pink-500'
                            }`}></div>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-semibold text-gray-900">
                              {category.category}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">₹{(category?.total || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ChartBarIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500">No expenses this month</p>
                      <p className="text-sm text-gray-400">Start tracking your expenses to see categories here</p>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>

            {/* Budget Status */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <Card.Header className="border-b border-gray-200/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg mr-3">
                      <ArrowUpIcon className="h-5 w-5 text-white" />
                    </div>
                    Budget Status
                  </h3>
                  <Button as={Link} to="/budgets" variant="ghost" size="sm">
                    Manage
                  </Button>
                </div>
              </Card.Header>
              <Card.Body className="p-6">
                <div className="space-y-4">
                  {safeBudgetStatus.length > 0 ? (
                    safeBudgetStatus.map((budget) => (
                      <div key={budget.id} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-green-50 hover:to-emerald-50 transition-all duration-300">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold text-gray-900">
                            {budget.category}
                          </p>
                          <span className="text-sm text-gray-600">
                            ₹{(budget?.currentSpending || 0).toFixed(2)} / ₹{(budget?.amountLimit || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                          <div
                            className={`h-3 rounded-full transition-all duration-500 ${
                              (budget?.percentageUsed || 0) >= 100
                                ? 'bg-gradient-to-r from-red-500 to-pink-500'
                                : (budget?.percentageUsed || 0) >= 80
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                                : 'bg-gradient-to-r from-green-400 to-emerald-500'
                            }`}
                            style={{ width: `${Math.min(budget?.percentageUsed || 0, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {(budget?.percentageUsed || 0).toFixed(1)}% used
                          </span>
                          {budget.isOverBudget && (
                            <Badge variant="danger" size="sm">Over Budget</Badge>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ArrowUpIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500">No budgets set</p>
                      <p className="text-sm text-gray-400">Create budgets to track your spending</p>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mt-6 sm:mt-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <Card.Header className="border-b border-gray-200/50 p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mr-2 sm:mr-3">
                  <BoltIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                Quick Actions
              </h3>
            </Card.Header>
            <Card.Body className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <Link to="/expenses" className="block p-3 sm:p-4 h-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-lg text-white no-underline">
                  <div className="text-center">
                    <CurrencyDollarIcon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2" />
                    <p className="font-semibold text-sm sm:text-base">View All Expenses</p>
                    <p className="text-xs opacity-90 hidden sm:block">Manage your expenses</p>
                  </div>
                </Link>
                <Link to="/budgets" className="block p-3 sm:p-4 h-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-lg text-white no-underline">
                  <div className="text-center">
                    <ChartBarIcon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2" />
                    <p className="font-semibold text-sm sm:text-base">Manage Budgets</p>
                    <p className="text-xs opacity-90 hidden sm:block">Set spending limits</p>
                  </div>
                </Link>
                <Link to="/analytics" className="block p-3 sm:p-4 h-auto bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-lg text-white no-underline sm:col-span-2 lg:col-span-1">
                  <div className="text-center">
                    <ArrowUpIcon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2" />
                    <p className="font-semibold text-sm sm:text-base">View Analytics</p>
                    <p className="text-xs opacity-90 hidden sm:block">Insights & trends</p>
                  </div>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Animated Navbar Overlay */}
      <div className={`fixed inset-0 z-50 overflow-hidden transition-all duration-500 ease-in-out ${
        animatedNavbarOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-500 ${
            animatedNavbarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={toggleAnimatedNavbar}
        ></div>
        
        {/* Animated Navbar */}
        <div className={`absolute top-0 left-0 right-0 transform transition-transform duration-500 ease-in-out ${
          animatedNavbarOpen ? 'translate-y-0' : '-translate-y-full'
        }`}>
          <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 shadow-2xl">
                   {/* Header */}
                   <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/20">
                     <div className="flex items-center">
                       <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl mr-3 sm:mr-4 shadow-lg">
                         <SparklesIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                       </div>
                       <div>
                         <h2 className="text-xl sm:text-2xl font-bold text-white">
                           Expensifyr
                         </h2>
                         <p className="text-blue-100 text-xs sm:text-sm">Smart Expense Management</p>
                       </div>
                     </div>
                     <button
                       onClick={toggleAnimatedNavbar}
                       className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 transition-colors duration-200"
                     >
                       <ArrowRightOnRectangleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                     </button>
                   </div>

            {/* Enhanced Navigation */}
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {navigation.map((item, index) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="group flex items-center p-3 sm:p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105"
                    onClick={toggleAnimatedNavbar}
                    style={{animationDelay: `${index * 100}ms`}}
                  >
                    <div className="p-2 sm:p-2.5 bg-white/20 rounded-lg sm:rounded-xl mr-3 sm:mr-4 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                      <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm sm:text-base truncate">{item.name}</p>
                      <p className="text-blue-100 text-xs sm:text-sm truncate">
                        {item.name === 'Dashboard' && 'Overview & insights'}
                        {item.name === 'Expenses' && 'Manage transactions'}
                        {item.name === 'Budgets' && 'Track spending limits'}
                        {item.name === 'Analytics' && 'Charts & reports'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

                     {/* Quick Actions */}
                     <div className="mt-8 pt-6 border-t border-white/20">
                       <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                         <Link
                           to="/expenses"
                           className="flex items-center justify-center p-3 sm:p-4 bg-white hover:bg-blue-50 hover:text-blue-600 rounded-xl sm:rounded-2xl transition-all duration-300 text-blue-600 font-medium shadow-lg text-sm sm:text-base"
                           onClick={toggleAnimatedNavbar}
                         >
                           <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                           <span className="hidden xs:inline">Add Expense</span>
                           <span className="xs:hidden">Add</span>
                         </Link>
                         <Link
                           to="/budgets"
                           className="flex items-center justify-center p-3 sm:p-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl sm:rounded-2xl transition-all duration-300 text-white font-medium text-sm sm:text-base"
                           onClick={toggleAnimatedNavbar}
                         >
                           <ChartBarIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                           <span className="hidden xs:inline">Set Budget</span>
                           <span className="xs:hidden">Budget</span>
                         </Link>
                         <Link
                           to="/analytics"
                           className="flex items-center justify-center p-3 sm:p-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl sm:rounded-2xl transition-all duration-300 text-white font-medium text-sm sm:text-base sm:col-span-2"
                           onClick={toggleAnimatedNavbar}
                         >
                           <ChartBarIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                           <span className="hidden xs:inline">View Analytics</span>
                           <span className="xs:hidden">Analytics</span>
                         </Link>
                       </div>
                     </div>

                     {/* User Info */}
                     <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/20">
                       <div className="flex items-center mb-3 sm:mb-4">
                         <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg mr-3 sm:mr-4">
                           <span className="text-sm sm:text-lg font-bold text-white">
                             {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                           </span>
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="text-white font-semibold text-sm sm:text-base truncate">{user?.username}</p>
                           <p className="text-blue-100 text-xs sm:text-sm truncate">{user?.email}</p>
                         </div>
                       </div>
                       <button
                         onClick={handleLogout}
                         className="w-full flex items-center justify-center p-2.5 sm:p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl transition-all duration-200 text-white font-medium text-sm sm:text-base"
                       >
                         <ArrowRightOnRectangleIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                         Sign Out
                       </button>
                     </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;