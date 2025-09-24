import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';

const AdvancedCharts = ({ data }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  };

  // Enhanced spending trends with multiple lines
  const SpendingTrendsChart = ({ data }) => (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="month" 
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            tickFormatter={(value) => `₹${value}`}
            stroke="#6b7280"
            fontSize={12}
          />
          <Tooltip 
            formatter={(value, name) => [formatCurrency(value), name]}
            labelStyle={{ color: '#374151' }}
            contentStyle={{ 
              backgroundColor: '#f9fafb', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="expenses" 
            stroke="#ef4444" 
            strokeWidth={3}
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="budget" 
            stroke="#10b981" 
            strokeWidth={3}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  // Enhanced category breakdown with donut chart
  const CategoryBreakdownChart = ({ data }) => {
    const COLORS = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308', 
      '#84cc16', '#22c55e', '#10b981', '#14b8a6',
      '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1'
    ];

    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => formatCurrency(value)}
              contentStyle={{ 
                backgroundColor: '#f9fafb', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry) => (
                <span style={{ color: entry.color }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Monthly spending comparison
  const MonthlyComparisonChart = ({ data }) => (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="month" 
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            tickFormatter={(value) => `₹${value}`}
            stroke="#6b7280"
            fontSize={12}
          />
          <Tooltip 
            formatter={(value, name) => [formatCurrency(value), name]}
            contentStyle={{ 
              backgroundColor: '#f9fafb', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Bar 
            dataKey="current" 
            fill="#3b82f6" 
            radius={[4, 4, 0, 0]}
            name="Current Month"
          />
          <Bar 
            dataKey="previous" 
            fill="#94a3b8" 
            radius={[4, 4, 0, 0]}
            name="Previous Month"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  // Spending velocity chart
  const SpendingVelocityChart = ({ data }) => (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="day" 
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            tickFormatter={(value) => `₹${value}`}
            stroke="#6b7280"
            fontSize={12}
          />
          <Tooltip 
            formatter={(value) => formatCurrency(value)}
            contentStyle={{ 
              backgroundColor: '#f9fafb', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#colorExpenses)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Spending Trends */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Spending Trends
        </h3>
        <SpendingTrendsChart data={data?.spendingTrends || []} />
      </div>

      {/* Category Breakdown */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Category Breakdown
        </h3>
        <CategoryBreakdownChart data={data?.categoryBreakdown || []} />
      </div>

      {/* Monthly Comparison */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Monthly Comparison
        </h3>
        <MonthlyComparisonChart data={data?.monthlyComparison || []} />
      </div>

      {/* Spending Velocity */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Daily Spending Velocity
        </h3>
        <SpendingVelocityChart data={data?.spendingVelocity || []} />
      </div>
    </div>
  );
};

export default AdvancedCharts;
