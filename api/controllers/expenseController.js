/**
 * Expense Controller
 * Handles all expense-related operations (CRUD, filtering, analytics)
 */

const { validationResult } = require('express-validator');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get all expenses for the authenticated user
 * GET /api/expenses
 * Query params: page, limit, category, startDate, endDate, sortBy
 */
const getExpenses = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const {
    page = 1,
    limit = 10,
    category,
    startDate,
    endDate,
    sortBy = 'date',
    sortOrder = 'desc'
  } = req.query;

  // Build filter object
  const filter = { userId };

  if (category) {
    filter.category = category;
  }

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query
  const expenses = await Expense.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count for pagination
  const total = await Expense.countDocuments(filter);

  res.json({
    success: true,
    data: {
      expenses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    }
  });
});

/**
 * Get a single expense by ID
 * GET /api/expenses/:id
 */
const getExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const expense = await Expense.findOne({ _id: id, userId });

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: 'Expense not found'
    });
  }

  res.json({
    success: true,
    data: { expense }
  });
});

/**
 * Create a new expense
 * POST /api/expenses
 */
const createExpense = asyncHandler(async (req, res) => {
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
  const { amount, category, date, paymentMethod, description, tags } = req.body;

  // Create expense
  const expense = await Expense.create({
    userId,
    amount,
    category,
    date: date || new Date(),
    paymentMethod,
    description,
    tags: tags || []
  });

  // Check if this expense exceeds any budget
  const currentMonth = new Date().toISOString().substring(0, 7);
  const budgets = await Budget.findByUserAndMonth(userId, currentMonth);
  
  const budgetAlerts = [];
  for (const budget of budgets) {
    if (budget.category === category) {
      const currentSpending = await budget.getCurrentSpending();
      const newTotal = currentSpending + amount;
      const percentageUsed = (newTotal / budget.amountLimit) * 100;
      
      if (newTotal > budget.amountLimit) {
        budgetAlerts.push({
          category: budget.category,
          amountLimit: budget.amountLimit,
          currentSpending: newTotal,
          exceededBy: newTotal - budget.amountLimit
        });
      } else if (percentageUsed >= (budget.notifications.threshold * 100)) {
        budgetAlerts.push({
          category: budget.category,
          amountLimit: budget.amountLimit,
          currentSpending: newTotal,
          percentageUsed: Math.round(percentageUsed * 100) / 100
        });
      }
    }
  }

  res.status(201).json({
    success: true,
    message: 'Expense created successfully',
    data: { expense },
    ...(budgetAlerts.length > 0 && { budgetAlerts })
  });
});

/**
 * Update an expense
 * PUT /api/expenses/:id
 */
const updateExpense = asyncHandler(async (req, res) => {
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

  const expense = await Expense.findOneAndUpdate(
    { _id: id, userId },
    updateData,
    { new: true, runValidators: true }
  );

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: 'Expense not found'
    });
  }

  res.json({
    success: true,
    message: 'Expense updated successfully',
    data: { expense }
  });
});

/**
 * Delete an expense
 * DELETE /api/expenses/:id
 */
const deleteExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const expense = await Expense.findOneAndDelete({ _id: id, userId });

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: 'Expense not found'
    });
  }

  res.json({
    success: true,
    message: 'Expense deleted successfully'
  });
});

/**
 * Get expense statistics
 * GET /api/expenses/stats
 */
const getExpenseStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { period = 'month' } = req.query;

  let startDate, endDate;
  const now = new Date();

  switch (period) {
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - now.getDay()));
      endDate = new Date(now.setDate(now.getDate() - now.getDay() + 6));
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }

  // Get total spending
  const totalSpending = await Expense.aggregate([
    {
      $match: {
        userId: userId,
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        average: { $avg: '$amount' }
      }
    }
  ]);

  // Get spending by category
  const spendingByCategory = await Expense.aggregate([
    {
      $match: {
        userId: userId,
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { total: -1 }
    }
  ]);

  // Get spending by payment method
  const spendingByPaymentMethod = await Expense.aggregate([
    {
      $match: {
        userId: userId,
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$paymentMethod',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { total: -1 }
    }
  ]);

  res.json({
    success: true,
    data: {
      period,
      dateRange: { startDate, endDate },
      totalSpending: totalSpending[0] || { total: 0, count: 0, average: 0 },
      spendingByCategory,
      spendingByPaymentMethod
    }
  });
});

/**
 * Search expenses
 * GET /api/expenses/search
 */
const searchExpenses = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { q, page = 1, limit = 10 } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 2 characters long'
    });
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const expenses = await Expense.find({
    userId,
    $or: [
      { description: { $regex: q, $options: 'i' } },
      { category: { $regex: q, $options: 'i' } },
      { paymentMethod: { $regex: q, $options: 'i' } },
      { tags: { $in: [new RegExp(q, 'i')] } }
    ]
  })
  .sort({ date: -1 })
  .skip(skip)
  .limit(parseInt(limit));

  const total = await Expense.countDocuments({
    userId,
    $or: [
      { description: { $regex: q, $options: 'i' } },
      { category: { $regex: q, $options: 'i' } },
      { paymentMethod: { $regex: q, $options: 'i' } },
      { tags: { $in: [new RegExp(q, 'i')] } }
    ]
  });

  res.json({
    success: true,
    data: {
      expenses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      },
      query: q
    }
  });
});

module.exports = {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  searchExpenses
};
