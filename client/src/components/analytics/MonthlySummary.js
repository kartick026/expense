import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';

const MonthlySummary = ({ data }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
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

  if (!data) {
    return null;
  }

  return (
    <Card>
      <Card.Header>
        <h3 className="text-lg font-medium text-gray-900">
          Monthly Summary - {new Date(data.year, data.month - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
        </h3>
      </Card.Header>
      <Card.Body>
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.totalSpending)}
              </div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {data.categoryBreakdown.length}
              </div>
              <div className="text-sm text-gray-600">Categories Used</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {data.categoryBreakdown.reduce((sum, cat) => sum + cat.count, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Transactions</div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Spending by Category</h4>
            <div className="space-y-3">
              {data.categoryBreakdown.map((category, index) => (
                <div key={category._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(category._id)}`}>
                      {category._id}
                    </span>
                    <div className="text-sm text-gray-600">
                      {category.count} transactions
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {formatCurrency(category.totalAmount)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Avg: {formatCurrency(category.averageAmount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Status */}
          {data.budgetStatus && data.budgetStatus.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Budget Status</h4>
              <div className="space-y-3">
                {data.budgetStatus.map((budget) => (
                  <div key={budget.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(budget.category)}`}>
                        {budget.category}
                      </span>
                      <div className="text-sm text-gray-600">
                        Budget: {formatCurrency(budget.amountLimit)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {formatCurrency(budget.totalSpent)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {budget.percentageUsed.toFixed(1)}% used
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        {budget.isOverBudget ? (
                          <Badge variant="danger">Over Budget</Badge>
                        ) : budget.shouldAlert ? (
                          <Badge variant="warning">Approaching Limit</Badge>
                        ) : (
                          <Badge variant="success">On Track</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default MonthlySummary;
