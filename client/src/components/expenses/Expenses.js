import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { expensesAPI, exportAPI, downloadFile } from '../../services/api';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import LoadingSpinner from '../common/LoadingSpinner';
import Badge from '../common/Badge';
import ExpenseModal from './ExpenseModal';
import ExpenseList from './ExpenseList';
import toast from 'react-hot-toast';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

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
    loadExpenses();
  }, [filters, pagination.currentPage]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: pagination.currentPage,
        limit: pagination.itemsPerPage
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') {
          delete params[key];
        }
      });

      const response = await expensesAPI.getExpenses(params);
      setExpenses(response.data.data.expenses);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Failed to load expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) {
      toast.error('Search query must be at least 2 characters');
      return;
    }

    try {
      setLoading(true);
      const response = await expensesAPI.searchExpenses(searchQuery, {
        page: 1,
        limit: pagination.itemsPerPage
      });
      setExpenses(response.data.data.expenses);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  const handleExport = async (format = 'csv') => {
    try {
      const params = { ...filters };
      Object.keys(params).forEach(key => {
        if (params[key] === '') {
          delete params[key];
        }
      });

      let response;
      if (format === 'csv') {
        response = await exportAPI.exportExpensesCSV(params);
      } else {
        response = await exportAPI.exportExpensesJSON(params);
      }

      const filename = `expenses-${new Date().toISOString().split('T')[0]}.${format}`;
      downloadFile(response.data, filename);
      toast.success(`Expenses exported to ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed');
    }
  };

  const handleExpenseSaved = () => {
    setShowModal(false);
    setEditingExpense(null);
    loadExpenses();
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowModal(true);
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await expensesAPI.deleteExpense(expenseId);
      toast.success('Expense deleted successfully');
      loadExpenses();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete expense');
    }
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      startDate: '',
      endDate: '',
      sortBy: 'date',
      sortOrder: 'desc'
    });
    setSearchQuery('');
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-8 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Minimal Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Expenses</h1>
              <p className="text-gray-600">Manage your expense records</p>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={() => handleExport('csv')} 
                variant="secondary" 
                size="sm"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button 
                onClick={() => setShowModal(true)} 
                variant="primary"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </div>
          
          <div className="space-y-6">

      {/* Search and Filters */}
      <Card>
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="flex space-x-2">
                <Input
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} variant="secondary">
                  <MagnifyingGlassIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Select
              placeholder="All Categories"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              options={categories.map(cat => ({ value: cat, label: cat }))}
            />

            <Input
              type="date"
              placeholder="Start Date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />

            <Input
              type="date"
              placeholder="End Date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />

            <div className="flex space-x-2">
              <Button onClick={clearFilters} variant="ghost" size="sm">
                Clear
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Select
                placeholder="Sort By"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                options={[
                  { value: 'date', label: 'Date' },
                  { value: 'amount', label: 'Amount' },
                  { value: 'category', label: 'Category' }
                ]}
              />
              <Select
                placeholder="Order"
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                options={[
                  { value: 'desc', label: 'Descending' },
                  { value: 'asc', label: 'Ascending' }
                ]}
              />
            </div>

            <div className="text-sm text-gray-500">
              {pagination.totalItems} expenses found
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Expenses List */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <ExpenseList
            expenses={expenses}
            onEdit={handleEditExpense}
            onDelete={handleDeleteExpense}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        )}
      </Card>

            {/* Expense Modal */}
            {showModal && (
              <ExpenseModal
                expense={editingExpense}
                onClose={() => {
                  setShowModal(false);
                  setEditingExpense(null);
                }}
                onSaved={handleExpenseSaved}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
