/**
 * Expense Routes
 * Handles all expense-related API endpoints
 */

const express = require('express');
const router = express.Router();

// Import controllers and middleware
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  searchExpenses
} = require('../controllers/expenseController');

const { authenticateToken } = require('../middleware/auth');
const { validateExpense } = require('../middleware/validation');

/**
 * @route   GET /api/expenses
 * @desc    Get all expenses for authenticated user with optional filtering
 * @access  Private
 * @query   page, limit, category, startDate, endDate, sortBy, sortOrder
 */
router.get('/', authenticateToken, getExpenses);

/**
 * @route   GET /api/expenses/stats
 * @desc    Get expense statistics
 * @access  Private
 * @query   period (week/month/year)
 */
router.get('/stats', authenticateToken, getExpenseStats);

/**
 * @route   GET /api/expenses/search
 * @desc    Search expenses by description, category, or tags
 * @access  Private
 * @query   q (search query), page, limit
 */
router.get('/search', authenticateToken, searchExpenses);

/**
 * @route   GET /api/expenses/:id
 * @desc    Get a single expense by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, getExpense);

/**
 * @route   POST /api/expenses
 * @desc    Create a new expense
 * @access  Private
 */
router.post('/', authenticateToken, validateExpense, createExpense);

/**
 * @route   PUT /api/expenses/:id
 * @desc    Update an expense
 * @access  Private
 */
router.put('/:id', authenticateToken, validateExpense, updateExpense);

/**
 * @route   DELETE /api/expenses/:id
 * @desc    Delete an expense
 * @access  Private
 */
router.delete('/:id', authenticateToken, deleteExpense);

module.exports = router;
