import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { budgetsAPI } from '../../services/api';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import Badge from '../common/Badge';
import BudgetModal from './BudgetModal';
import BudgetCard from './BudgetCard';
import toast from 'react-hot-toast';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [budgetStatus, setBudgetStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().substring(0, 7)
  );

  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Healthcare',
    'Education',
    'Bills & Utilities',
    'Travel',
    'Personal Care',
    'Subscriptions',
    'Gifts & Donations',
    'Other'
  ];

  useEffect(() => {
    loadBudgets();
  }, [selectedMonth]);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const [budgetsResponse, statusResponse] = await Promise.all([
        budgetsAPI.getBudgets(selectedMonth),
        budgetsAPI.getBudgetStatus(selectedMonth)
      ]);
      
      setBudgets(budgetsResponse.data.data.budgets);
      setBudgetStatus(statusResponse.data.data.budgetStatus);
    } catch (error) {
      console.error('Failed to load budgets:', error);
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetSaved = () => {
    setShowModal(false);
    setEditingBudget(null);
    loadBudgets();
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setShowModal(true);
  };

  const handleDeleteBudget = async (budgetId) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }

    try {
      await budgetsAPI.deleteBudget(budgetId);
      toast.success('Budget deleted successfully');
      loadBudgets();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete budget');
    }
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const getMonthName = (monthYear) => {
    const [year, month] = monthYear.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const getOverBudgetCount = () => {
    return budgetStatus.filter(budget => budget.isOverBudget).length;
  };

  const getAlertCount = () => {
    return budgetStatus.filter(budget => budget.shouldAlert && !budget.isOverBudget).length;
  };

  const getTotalBudgeted = () => {
    return budgets.reduce((total, budget) => total + budget.amountLimit, 0);
  };

  const getTotalSpent = () => {
    return budgetStatus.reduce((total, budget) => total + budget.totalSpent, 0);
  };

  const getRemainingBudget = () => {
    return getTotalBudgeted() - getTotalSpent();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-8 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Minimal Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Budgets</h1>
              <p className="text-gray-600">Manage your monthly spending limits</p>
            </div>
            <div className="flex space-x-3">
              <input
                type="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                className="px-4 py-2 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              />
              <Button 
                onClick={() => setShowModal(true)} 
                variant="primary"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Budget
              </Button>
            </div>
          </div>
          
          <div className="space-y-6">

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Budget
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  ₹{getTotalBudgeted().toFixed(2)}
                </dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Spent
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  ₹{getTotalSpent().toFixed(2)}
                </dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-warning-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Remaining
                </dt>
                <dd className={`text-2xl font-semibold ${
                  getRemainingBudget() >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ₹{getRemainingBudget().toFixed(2)}
                </dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className={`h-8 w-8 ${
                getOverBudgetCount() > 0 ? 'text-danger-600' : 'text-gray-400'
              }`} />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Alerts
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {getAlertCount() + getOverBudgetCount()}
                </dd>
              </dl>
            </div>
          </div>
        </Card>
      </div>

      {/* Month Selector and Alerts */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-lg font-medium text-gray-900">
              {getMonthName(selectedMonth)}
            </span>
          </div>
          
          {getOverBudgetCount() > 0 && (
            <Badge variant="danger">
              {getOverBudgetCount()} Over Budget
            </Badge>
          )}
          
          {getAlertCount() > 0 && (
            <Badge variant="warning">
              {getAlertCount()} Approaching Limit
            </Badge>
          )}
        </div>
      </div>

      {/* Budgets Grid */}
      {budgetStatus.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgetStatus.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={handleEditBudget}
              onDelete={handleDeleteBudget}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No budgets</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first budget for {getMonthName(selectedMonth)}.
          </p>
          <div className="mt-6">
            <Button onClick={() => setShowModal(true)} variant="primary">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Budget
            </Button>
          </div>
        </Card>
      )}

            {/* Budget Modal */}
            {showModal && (
              <BudgetModal
                budget={editingBudget}
                selectedMonth={selectedMonth}
                onClose={() => {
                  setShowModal(false);
                  setEditingBudget(null);
                }}
                onSaved={handleBudgetSaved}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Budgets;
