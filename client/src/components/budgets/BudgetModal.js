import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { budgetsAPI } from '../../services/api';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import toast from 'react-hot-toast';

const BudgetModal = ({ budget, selectedMonth, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    category: '',
    amountLimit: '',
    monthYear: selectedMonth,
    notifications: {
      enabled: true,
      threshold: 0.8
    }
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
    if (budget) {
      setFormData({
        category: budget.category,
        amountLimit: budget.amountLimit.toString(),
        monthYear: budget.monthYear,
        notifications: {
          enabled: budget.notifications.enabled,
          threshold: budget.notifications.threshold
        }
      });
    } else {
      setFormData({
        category: '',
        amountLimit: '',
        monthYear: selectedMonth,
        notifications: {
          enabled: true,
          threshold: 0.8
        }
      });
    }
  }, [budget, selectedMonth]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.amountLimit || parseFloat(formData.amountLimit) <= 0) {
      newErrors.amountLimit = 'Budget limit must be greater than 0';
    }

    if (!formData.monthYear) {
      newErrors.monthYear = 'Month is required';
    }

    if (formData.notifications.enabled && 
        (formData.notifications.threshold < 0.1 || formData.notifications.threshold > 1.0)) {
      newErrors.threshold = 'Threshold must be between 0.1 and 1.0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const budgetData = {
        ...formData,
        amountLimit: parseFloat(formData.amountLimit),
        notifications: {
          enabled: formData.notifications.enabled,
          threshold: parseFloat(formData.notifications.threshold)
        }
      };

      if (budget) {
        await budgetsAPI.updateBudget(budget.id, budgetData);
        toast.success('Budget updated successfully');
      } else {
        await budgetsAPI.createBudget(budgetData);
        toast.success('Budget created successfully');
      }

      onSaved();
    } catch (error) {
      console.error('Save failed:', error);
      const message = error.response?.data?.message || 'Failed to save budget';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {budget ? 'Edit Budget' : 'Create New Budget'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              error={errors.category}
              required
              placeholder="Select category"
              options={categories.map(cat => ({ value: cat, label: cat }))}
            />

            <Input
              label="Budget Limit"
              type="number"
              name="amountLimit"
              value={formData.amountLimit}
              onChange={handleChange}
              error={errors.amountLimit}
              required
              step="0.01"
              min="0.01"
              placeholder="0.00"
            />
          </div>

          <Input
            label="Month"
            type="month"
            name="monthYear"
            value={formData.monthYear}
            onChange={handleChange}
            error={errors.monthYear}
            required
          />

          {/* Notifications Section */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Notifications</h4>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="notifications.enabled"
                  checked={formData.notifications.enabled}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Enable budget alerts
                </label>
              </div>

              {formData.notifications.enabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alert Threshold (% of budget used)
                  </label>
                  <Input
                    type="number"
                    name="notifications.threshold"
                    value={formData.notifications.threshold}
                    onChange={handleChange}
                    error={errors.threshold}
                    step="0.1"
                    min="0.1"
                    max="1.0"
                    placeholder="0.8"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Get notified when you've used this percentage of your budget (0.1 = 10%, 1.0 = 100%)
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" loading={loading} variant="primary">
              {budget ? 'Update' : 'Create'} Budget
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;
