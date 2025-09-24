/**
 * Export Controller
 * Handles data export functionality (CSV, JSON)
 */

const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const { asyncHandler } = require('../middleware/errorHandler');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs').promises;

/**
 * Export expenses to CSV
 * GET /api/export/expenses/csv
 */
const exportExpensesToCSV = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { startDate, endDate, category } = req.query;

  // Build filter
  const filter = { userId };
  if (category) filter.category = category;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  // Get expenses
  const expenses = await Expense.find(filter).sort({ date: -1 });

  if (expenses.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No expenses found for the specified criteria'
    });
  }

  // Create CSV file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `expenses-${timestamp}.csv`;
  const filepath = path.join(__dirname, '../exports', filename);

  // Ensure exports directory exists
  await fs.mkdir(path.dirname(filepath), { recursive: true });

  const csvWriter = createCsvWriter({
    path: filepath,
    header: [
      { id: 'date', title: 'Date' },
      { id: 'category', title: 'Category' },
      { id: 'amount', title: 'Amount' },
      { id: 'paymentMethod', title: 'Payment Method' },
      { id: 'description', title: 'Description' },
      { id: 'tags', title: 'Tags' },
      { id: 'createdAt', title: 'Created At' }
    ]
  });

  // Format data for CSV
  const csvData = expenses.map(expense => ({
    date: expense.date.toISOString().split('T')[0],
    category: expense.category,
    amount: expense.amount,
    paymentMethod: expense.paymentMethod,
    description: expense.description,
    tags: expense.tags.join(', '),
    createdAt: expense.createdAt.toISOString()
  }));

  await csvWriter.writeRecords(csvData);

  // Send file to client
  res.download(filepath, filename, (err) => {
    if (err) {
      console.error('Error sending file:', err);
    }
    // Clean up file after download
    fs.unlink(filepath).catch(console.error);
  });
});

/**
 * Export expenses to JSON
 * GET /api/export/expenses/json
 */
const exportExpensesToJSON = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { startDate, endDate, category } = req.query;

  // Build filter
  const filter = { userId };
  if (category) filter.category = category;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  // Get expenses
  const expenses = await Expense.find(filter).sort({ date: -1 });

  if (expenses.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No expenses found for the specified criteria'
    });
  }

  // Format data for JSON export
  const exportData = {
    exportInfo: {
      exportedAt: new Date().toISOString(),
      totalRecords: expenses.length,
      filters: { startDate, endDate, category },
      user: {
        id: userId.toString(),
        username: req.user.username,
        email: req.user.email
      }
    },
    expenses: expenses.map(expense => ({
      id: expense._id,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      paymentMethod: expense.paymentMethod,
      description: expense.description,
      tags: expense.tags,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt
    }))
  };

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `expenses-${timestamp}.json`;

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.json(exportData);
});

/**
 * Export budgets to CSV
 * GET /api/export/budgets/csv
 */
const exportBudgetsToCSV = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { monthYear } = req.query;

  // Get budgets
  const budgets = await Budget.find({ userId, ...(monthYear && { monthYear }) }).sort({ monthYear: -1, category: 1 });

  if (budgets.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No budgets found for the specified criteria'
    });
  }

  // Create CSV file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `budgets-${timestamp}.csv`;
  const filepath = path.join(__dirname, '../exports', filename);

  // Ensure exports directory exists
  await fs.mkdir(path.dirname(filepath), { recursive: true });

  const csvWriter = createCsvWriter({
    path: filepath,
    header: [
      { id: 'monthYear', title: 'Month-Year' },
      { id: 'category', title: 'Category' },
      { id: 'amountLimit', title: 'Budget Limit' },
      { id: 'isActive', title: 'Active' },
      { id: 'notificationsEnabled', title: 'Notifications Enabled' },
      { id: 'notificationThreshold', title: 'Notification Threshold' },
      { id: 'createdAt', title: 'Created At' }
    ]
  });

  // Format data for CSV
  const csvData = budgets.map(budget => ({
    monthYear: budget.monthYear,
    category: budget.category,
    amountLimit: budget.amountLimit,
    isActive: budget.isActive,
    notificationsEnabled: budget.notifications.enabled,
    notificationThreshold: budget.notifications.threshold,
    createdAt: budget.createdAt.toISOString()
  }));

  await csvWriter.writeRecords(csvData);

  // Send file to client
  res.download(filepath, filename, (err) => {
    if (err) {
      console.error('Error sending file:', err);
    }
    // Clean up file after download
    fs.unlink(filepath).catch(console.error);
  });
});

/**
 * Export complete financial data
 * GET /api/export/complete
 */
const exportCompleteData = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { startDate, endDate } = req.query;

  // Build filter
  const expenseFilter = { userId };
  if (startDate || endDate) {
    expenseFilter.date = {};
    if (startDate) expenseFilter.date.$gte = new Date(startDate);
    if (endDate) expenseFilter.date.$lte = new Date(endDate);
  }

  // Get all data
  const [expenses, budgets] = await Promise.all([
    Expense.find(expenseFilter).sort({ date: -1 }),
    Budget.find({ userId }).sort({ monthYear: -1, category: 1 })
  ]);

  // Get summary statistics
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categoryBreakdown = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  // Format export data
  const exportData = {
    exportInfo: {
      exportedAt: new Date().toISOString(),
      user: {
        id: userId.toString(),
        username: req.user.username,
        email: req.user.email
      },
      filters: { startDate, endDate },
      summary: {
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        expenseCount: expenses.length,
        budgetCount: budgets.length,
        categoryBreakdown: Object.entries(categoryBreakdown).map(([category, amount]) => ({
          category,
          amount: Math.round(amount * 100) / 100
        })).sort((a, b) => b.amount - a.amount)
      }
    },
    expenses: expenses.map(expense => ({
      id: expense._id,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      paymentMethod: expense.paymentMethod,
      description: expense.description,
      tags: expense.tags,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt
    })),
    budgets: budgets.map(budget => ({
      id: budget._id,
      category: budget.category,
      amountLimit: budget.amountLimit,
      monthYear: budget.monthYear,
      isActive: budget.isActive,
      notifications: budget.notifications,
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt
    }))
  };

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `complete-export-${timestamp}.json`;

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.json(exportData);
});

module.exports = {
  exportExpensesToCSV,
  exportExpensesToJSON,
  exportBudgetsToCSV,
  exportCompleteData
};
