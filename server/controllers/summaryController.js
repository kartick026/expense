/**
 * Summary Controller
 * Handles analytics and summary data for expenses and budgets
 */

const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get monthly expense summary
 * GET /api/summary/monthly
 */
const getMonthlySummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { year, month } = req.query;

  const targetYear = parseInt(year) || new Date().getFullYear();
  const targetMonth = parseInt(month) || new Date().getMonth() + 1;

  // Get monthly spending data
  const monthlyData = await Expense.getMonthlySummary(userId, targetYear, targetMonth - 1);

  // Get total spending for the month
  const totalSpending = monthlyData.reduce((sum, category) => sum + category.totalAmount, 0);

  // Get budget status for the month
  const monthYear = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;
  const budgetStatus = await Budget.getBudgetStatus(userId, monthYear);

  res.json({
    success: true,
    data: {
      month: targetMonth,
      year: targetYear,
      monthYear,
      totalSpending: Math.round(totalSpending * 100) / 100,
      categoryBreakdown: monthlyData,
      budgetStatus
    }
  });
});

/**
 * Get category-wise spending summary
 * GET /api/summary/category
 */
const getCategorySummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { period = 'month', startDate, endDate } = req.query;

  let filter = { userId };

  if (startDate && endDate) {
    filter.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  } else {
    // Default to current month if no dates specified
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    filter.date = { $gte: startOfMonth, $lte: endOfMonth };
  }

  // Get category-wise spending
  const categoryData = await Expense.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        averageAmount: { $avg: '$amount' },
        minAmount: { $min: '$amount' },
        maxAmount: { $max: '$amount' }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);

  // Calculate percentages
  const totalSpending = categoryData.reduce((sum, cat) => sum + cat.totalAmount, 0);
  const categoryDataWithPercentages = categoryData.map(cat => ({
    ...cat,
    percentage: totalSpending > 0 ? Math.round((cat.totalAmount / totalSpending) * 10000) / 100 : 0
  }));

  res.json({
    success: true,
    data: {
      period,
      totalSpending: Math.round(totalSpending * 100) / 100,
      categoryBreakdown: categoryDataWithPercentages
    }
  });
});

/**
 * Get spending trends over time
 * GET /api/summary/trends
 */
const getSpendingTrends = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { period = 'year', year } = req.query;

  const targetYear = parseInt(year) || new Date().getFullYear();

  if (period === 'year') {
    // Get monthly trends for the year
    const yearlyTrends = await Expense.getYearlyTrends(userId, targetYear);
    
    // Format data for chart
    const monthlyTrends = Array.from({ length: 12 }, (_, index) => {
      const monthData = yearlyTrends.find(trend => trend._id.month === index + 1);
      return {
        month: index + 1,
        monthName: new Date(targetYear, index, 1).toLocaleString('default', { month: 'short' }),
        totalAmount: monthData ? Math.round(monthData.totalAmount * 100) / 100 : 0,
        count: monthData ? monthData.count : 0
      };
    });

    res.json({
      success: true,
      data: {
        period: 'yearly',
        year: targetYear,
        trends: monthlyTrends
      }
    });
  } else if (period === 'month') {
    // Get daily trends for the current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const dailyTrends = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: '$date' }
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.day': 1 }
      }
    ]);

    // Format data for chart
    const daysInMonth = endOfMonth.getDate();
    const dailyData = Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const dayData = dailyTrends.find(trend => trend._id.day === day);
      return {
        day,
        totalAmount: dayData ? Math.round(dayData.totalAmount * 100) / 100 : 0,
        count: dayData ? dayData.count : 0
      };
    });

    res.json({
      success: true,
      data: {
        period: 'monthly',
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        trends: dailyData
      }
    });
  }
});

/**
 * Get payment method summary
 * GET /api/summary/payment-methods
 */
const getPaymentMethodSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { period = 'month', startDate, endDate } = req.query;

  let filter = { userId };

  if (startDate && endDate) {
    filter.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  } else {
    // Default to current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    filter.date = { $gte: startOfMonth, $lte: endOfMonth };
  }

  const paymentMethodData = await Expense.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$paymentMethod',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        averageAmount: { $avg: '$amount' }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);

  const totalSpending = paymentMethodData.reduce((sum, method) => sum + method.totalAmount, 0);
  const paymentMethodDataWithPercentages = paymentMethodData.map(method => ({
    ...method,
    percentage: totalSpending > 0 ? Math.round((method.totalAmount / totalSpending) * 10000) / 100 : 0
  }));

  res.json({
    success: true,
    data: {
      period,
      totalSpending: Math.round(totalSpending * 100) / 100,
      paymentMethodBreakdown: paymentMethodDataWithPercentages
    }
  });
});

/**
 * Get dashboard summary (overview data)
 * GET /api/summary/dashboard
 */
const getDashboardSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const now = new Date();

  // Current month data
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Previous month data
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  // This week data
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));

  // Get current month spending
  const currentMonthSpending = await Expense.aggregate([
    {
      $match: {
        userId,
        date: { $gte: currentMonthStart, $lte: currentMonthEnd }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  // Get previous month spending
  const previousMonthSpending = await Expense.aggregate([
    {
      $match: {
        userId,
        date: { $gte: previousMonthStart, $lte: previousMonthEnd }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  // Get this week spending
  const thisWeekSpending = await Expense.aggregate([
    {
      $match: {
        userId,
        date: { $gte: weekStart, $lte: weekEnd }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  // Get budget status
  const currentMonthYear = new Date().toISOString().substring(0, 7);
  const budgetStatus = await Budget.getBudgetStatus(userId, currentMonthYear);

  // Get top spending categories this month
  const topCategories = await Expense.aggregate([
    {
      $match: {
        userId,
        date: { $gte: currentMonthStart, $lte: currentMonthEnd }
      }
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' }
      }
    },
    {
      $sort: { total: -1 }
    },
    {
      $limit: 5
    }
  ]);

  const currentMonthTotal = currentMonthSpending[0]?.total || 0;
  const previousMonthTotal = previousMonthSpending[0]?.total || 0;
  const thisWeekTotal = thisWeekSpending[0]?.total || 0;

  const monthOverMonthChange = previousMonthTotal > 0 
    ? Math.round(((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 10000) / 100 
    : 0;

  res.json({
    success: true,
    data: {
      currentMonth: {
        total: Math.round(currentMonthTotal * 100) / 100,
        count: currentMonthSpending[0]?.count || 0,
        change: monthOverMonthChange
      },
      thisWeek: {
        total: Math.round(thisWeekTotal * 100) / 100,
        count: thisWeekSpending[0]?.count || 0
      },
      budgetStatus: budgetStatus.slice(0, 5), // Top 5 budgets
      topCategories: topCategories.map(cat => ({
        ...cat,
        total: Math.round(cat.total * 100) / 100
      })),
      alerts: budgetStatus.filter(budget => budget.isOverBudget || budget.shouldAlert).length
    }
  });
});

module.exports = {
  getMonthlySummary,
  getCategorySummary,
  getSpendingTrends,
  getPaymentMethodSummary,
  getDashboardSummary
};
