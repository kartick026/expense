/**
 * Budget Controller
 * Handles all budget-related operations (CRUD, status monitoring)
 */

const { validationResult } = require('express-validator');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get all budgets for the authenticated user
 * GET /api/budgets
 */
const getBudgets = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { monthYear } = req.query;

  let budgets;
  if (monthYear) {
    budgets = await Budget.findByUserAndMonth(userId, monthYear);
  } else {
    budgets = await Budget.findCurrentMonthBudgets(userId);
  }

  res.json({
    success: true,
    data: { budgets }
  });
});

/**
 * Get budget status with spending information
 * GET /api/budgets/status
 */
const getBudgetStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { monthYear } = req.query;

  const targetMonthYear = monthYear || new Date().toISOString().substring(0, 7);
  const budgetStatus = await Budget.getBudgetStatus(userId, targetMonthYear);

  res.json({
    success: true,
    data: {
      monthYear: targetMonthYear,
      budgetStatus
    }
  });
});

/**
 * Get a single budget by ID
 * GET /api/budgets/:id
 */
const getBudget = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const budget = await Budget.findOne({ _id: id, userId });

  if (!budget) {
    return res.status(404).json({
      success: false,
      message: 'Budget not found'
    });
  }

  // Get current spending for this budget
  const currentSpending = await budget.getCurrentSpending();
  const remaining = budget.amountLimit - currentSpending;
  const percentageUsed = (currentSpending / budget.amountLimit) * 100;

  res.json({
    success: true,
    data: {
      budget: {
        ...budget.toObject(),
        currentSpending,
        remaining,
        percentageUsed: Math.round(percentageUsed * 100) / 100,
        isOverBudget: currentSpending > budget.amountLimit
      }
    }
  });
});

/**
 * Create a new budget
 * POST /api/budgets
 */
const createBudget = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const userId = req.user._id;
  const { category, amountLimit, monthYear, notifications } = req.body;

  // Use current month if not specified
  const targetMonthYear = monthYear || new Date().toISOString().substring(0, 7);

  // Check if budget already exists for this category and month
  const existingBudget = await Budget.findOne({
    userId,
    category,
    monthYear: targetMonthYear
  });

  if (existingBudget) {
    return res.status(400).json({
      success: false,
      message: `Budget for ${category} already exists for ${targetMonthYear}`
    });
  }

  // Create budget
  const budget = await Budget.create({
    userId,
    category,
    amountLimit,
    monthYear: targetMonthYear,
    notifications: notifications || {
      enabled: true,
      threshold: 0.8
    }
  });

  res.status(201).json({
    success: true,
    message: 'Budget created successfully',
    data: { budget }
  });
});

/**
 * Update a budget
 * PUT /api/budgets/:id
 */
const updateBudget = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { id } = req.params;
  const userId = req.user._id;
  const updateData = req.body;

  // Remove userId from update data to prevent unauthorized changes
  delete updateData.userId;

  const budget = await Budget.findOneAndUpdate(
    { _id: id, userId },
    updateData,
    { new: true, runValidators: true }
  );

  if (!budget) {
    return res.status(404).json({
      success: false,
      message: 'Budget not found'
    });
  }

  res.json({
    success: true,
    message: 'Budget updated successfully',
    data: { budget }
  });
});

/**
 * Delete a budget
 * DELETE /api/budgets/:id
 */
const deleteBudget = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const budget = await Budget.findOneAndDelete({ _id: id, userId });

  if (!budget) {
    return res.status(404).json({
      success: false,
      message: 'Budget not found'
    });
  }

  res.json({
    success: true,
    message: 'Budget deleted successfully'
  });
});

/**
 * Get budget alerts (budgets that are close to or over limit)
 * GET /api/budgets/alerts
 */
const getBudgetAlerts = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { monthYear } = req.query;

  const targetMonthYear = monthYear || new Date().toISOString().substring(0, 7);
  const budgetStatus = await Budget.getBudgetStatus(userId, targetMonthYear);

  const alerts = budgetStatus.filter(budget => 
    budget.isOverBudget || budget.shouldAlert
  );

  res.json({
    success: true,
    data: {
      monthYear: targetMonthYear,
      alerts
    }
  });
});

/**
 * Copy budget from previous month
 * POST /api/budgets/copy-previous
 */
const copyPreviousMonthBudget = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { category } = req.body;

  // Get previous month
  const now = new Date();
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1);
  const previousMonthYear = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, '0')}`;

  // Find budget from previous month
  const previousBudget = await Budget.findOne({
    userId,
    category,
    monthYear: previousMonthYear
  });

  if (!previousBudget) {
    return res.status(404).json({
      success: false,
      message: `No budget found for ${category} in ${previousMonthYear}`
    });
  }

  // Create new budget for current month
  const currentMonthYear = new Date().toISOString().substring(0, 7);
  
  // Check if budget already exists for current month
  const existingBudget = await Budget.findOne({
    userId,
    category,
    monthYear: currentMonthYear
  });

  if (existingBudget) {
    return res.status(400).json({
      success: false,
      message: `Budget for ${category} already exists for ${currentMonthYear}`
    });
  }

  const newBudget = await Budget.create({
    userId,
    category,
    amountLimit: previousBudget.amountLimit,
    monthYear: currentMonthYear,
    notifications: previousBudget.notifications
  });

  res.status(201).json({
    success: true,
    message: 'Budget copied from previous month successfully',
    data: { budget: newBudget }
  });
});

/**
 * Get budget recommendations based on spending history
 * GET /api/budgets/recommendations
 */
const getBudgetRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { months = 3 } = req.query;

  // Calculate average spending per category over the last N months
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - parseInt(months), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth(), 0);

  const averageSpending = await Expense.aggregate([
    {
      $match: {
        userId,
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$category',
        averageSpending: { $avg: '$amount' },
        totalSpending: { $sum: '$amount' },
        transactionCount: { $sum: 1 }
      }
    },
    {
      $sort: { averageSpending: -1 }
    }
  ]);

  // Generate recommendations
  const recommendations = averageSpending.map(item => ({
    category: item._id,
    averageSpending: Math.round(item.averageSpending * 100) / 100,
    totalSpending: Math.round(item.totalSpending * 100) / 100,
    transactionCount: item.transactionCount,
    recommendedBudget: Math.round(item.averageSpending * 1.2 * 100) / 100, // 20% buffer
    confidence: item.transactionCount >= 5 ? 'high' : 'medium'
  }));

  res.json({
    success: true,
    data: {
      period: `${months} months`,
      recommendations
    }
  });
});

module.exports = {
  getBudgets,
  getBudgetStatus,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetAlerts,
  copyPreviousMonthBudget,
  getBudgetRecommendations
};
