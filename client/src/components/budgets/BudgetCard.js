import React from 'react';
import {
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';

const BudgetCard = ({ budget, onEdit, onDelete }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusIcon = (budget) => {
    if (budget.isOverBudget) {
      return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
    } else if (budget.shouldAlert) {
      return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
    } else {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }
  };

  const getStatusBadge = (budget) => {
    if (budget.isOverBudget) {
      return <Badge variant="danger">Over Budget</Badge>;
    } else if (budget.shouldAlert) {
      return <Badge variant="warning">Approaching Limit</Badge>;
    } else {
      return <Badge variant="success">On Track</Badge>;
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Food & Dining': 'bg-orange-100 text-orange-800',
      'Transportation': 'bg-blue-100 text-blue-800',
      'Shopping': 'bg-purple-100 text-purple-800',
      'Entertainment': 'bg-pink-100 text-pink-800',
      'Healthcare': 'bg-red-100 text-red-800',
      'Education': 'bg-green-100 text-green-800',
      'Bills & Utilities': 'bg-yellow-100 text-yellow-800',
      'Travel': 'bg-indigo-100 text-indigo-800',
      'Personal Care': 'bg-teal-100 text-teal-800',
      'Subscriptions': 'bg-cyan-100 text-cyan-800',
      'Gifts & Donations': 'bg-rose-100 text-rose-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['Other'];
  };

  return (
    <Card className="hover:shadow-medium transition-shadow duration-200">
      <Card.Header>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(budget.category)}`}>
              {budget.category}
            </span>
            <div className="ml-2">
              {getStatusIcon(budget)}
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              onClick={() => onEdit(budget)}
              variant="ghost"
              size="sm"
              title="Edit budget"
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => onDelete(budget.id)}
              variant="ghost"
              size="sm"
              title="Delete budget"
              className="text-red-600 hover:text-red-800"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card.Header>

      <Card.Body>
        <div className="space-y-4">
          {/* Budget Amount */}
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(budget.amountLimit)}
            </div>
            <div className="text-sm text-gray-500">Budget Limit</div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Spent</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(budget.totalSpent)}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(budget.percentageUsed)}`}
                style={{ 
                  width: `${Math.min(budget.percentageUsed, 100)}%` 
                }}
              ></div>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                {budget.percentageUsed.toFixed(1)}% used
              </span>
              {budget.remaining >= 0 ? (
                <span className="text-green-600">
                  {formatCurrency(budget.remaining)} remaining
                </span>
              ) : (
                <span className="text-red-600">
                  {formatCurrency(Math.abs(budget.remaining))} over
                </span>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="flex justify-center">
            {getStatusBadge(budget)}
          </div>

          {/* Additional Info */}
          <div className="text-xs text-gray-500 text-center space-y-1">
            <div>
              Alert threshold: {Math.round(budget.notifications.threshold * 100)}%
            </div>
            <div>
              Notifications: {budget.notifications.enabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default BudgetCard;
