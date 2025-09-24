import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CalendarIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { summaryAPI, exportAPI, downloadFile } from '../../services/api';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import CategoryChart from './CategoryChart';
import SpendingTrendsChart from './SpendingTrendsChart';
import PaymentMethodChart from './PaymentMethodChart';
import MonthlySummary from './MonthlySummary';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    categorySummary: null,
    spendingTrends: null,
    paymentMethodSummary: null,
    monthlySummary: null
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod, selectedYear, selectedMonth]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const promises = [];

      // Category summary
      promises.push(
        summaryAPI.getCategorySummary({ 
          period: selectedPeriod,
          ...(selectedPeriod === 'custom' && {
            startDate: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`,
            endDate: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-31`
          })
        })
      );

      // Spending trends
      promises.push(
        summaryAPI.getSpendingTrends(selectedPeriod, selectedYear)
      );

      // Payment method summary
      promises.push(
        summaryAPI.getPaymentMethodSummary({ 
          period: selectedPeriod,
          ...(selectedPeriod === 'custom' && {
            startDate: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`,
            endDate: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-31`
          })
        })
      );

      // Monthly summary
      if (selectedPeriod === 'month' || selectedPeriod === 'custom') {
        promises.push(
          summaryAPI.getMonthlySummary(selectedYear, selectedMonth)
        );
      } else {
        promises.push(Promise.resolve(null));
      }

      const [
        categoryResponse,
        trendsResponse,
        paymentResponse,
        monthlyResponse
      ] = await Promise.all(promises);

      setAnalyticsData({
        categorySummary: categoryResponse.data.data,
        spendingTrends: trendsResponse.data.data,
        paymentMethodSummary: paymentResponse.data.data,
        monthlySummary: monthlyResponse?.data?.data || null
      });
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format = 'csv') => {
    try {
      const params = {
        period: selectedPeriod,
        ...(selectedPeriod === 'custom' && {
          startDate: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`,
          endDate: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-31`
        })
      };

      const response = await exportAPI.exportExpensesCSV(params);
      const filename = `analytics-export-${new Date().toISOString().split('T')[0]}.${format}`;
      downloadFile(response.data, filename);
      toast.success(`Analytics data exported to ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed');
    }
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'year':
        return `${selectedYear}`;
      case 'custom':
        return `${new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`;
      default:
        return 'This Month';
    }
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
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Analytics</h1>
              <p className="text-gray-600">Insights into your spending patterns</p>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={() => handleExport('csv')} 
                variant="secondary" 
                size="sm"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
          
          <div className="space-y-6">

      {/* Filters */}
      <Card>
        <Card.Body>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Period:</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="form-select w-auto"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Month</option>
              </select>
            </div>

            {selectedPeriod === 'year' && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Year:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="form-select w-auto"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}

            {selectedPeriod === 'custom' && (
              <>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Year:</span>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="form-select w-auto"
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Month:</span>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="form-select w-auto"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>
                        {new Date(selectedYear, month - 1).toLocaleDateString('en-US', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="text-sm text-gray-500">
              Showing data for: <span className="font-medium">{getPeriodLabel()}</span>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Summary Cards */}
      {analyticsData.categorySummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total Spending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ₹{analyticsData.categorySummary.totalSpending.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Categories</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analyticsData.categorySummary.categoryBreakdown.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-warning-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Top Category</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analyticsData.categorySummary.categoryBreakdown[0]?._id || 'N/A'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        {analyticsData.categorySummary && (
          <Card>
            <Card.Header>
              <h3 className="text-lg font-medium text-gray-900">Spending by Category</h3>
            </Card.Header>
            <Card.Body>
              <CategoryChart data={analyticsData.categorySummary.categoryBreakdown} />
            </Card.Body>
          </Card>
        )}

        {/* Payment Methods */}
        {analyticsData.paymentMethodSummary && (
          <Card>
            <Card.Header>
              <h3 className="text-lg font-medium text-gray-900">Payment Methods</h3>
            </Card.Header>
            <Card.Body>
              <PaymentMethodChart data={analyticsData.paymentMethodSummary.paymentMethodBreakdown} />
            </Card.Body>
          </Card>
        )}
      </div>

      {/* Spending Trends */}
      {analyticsData.spendingTrends && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-medium text-gray-900">Spending Trends</h3>
          </Card.Header>
          <Card.Body>
            <SpendingTrendsChart 
              data={analyticsData.spendingTrends.trends} 
              period={selectedPeriod}
            />
          </Card.Body>
        </Card>
      )}

            {/* Monthly Summary */}
            {analyticsData.monthlySummary && (
              <MonthlySummary data={analyticsData.monthlySummary} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
