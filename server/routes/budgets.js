/**
 * Budget Routes
 * Handles all budget-related API endpoints
 */

const express = require('express');
const router = express.Router();

// Import controllers and middleware
const {
  getBudgets,
  getBudgetStatus,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetAlerts,
  copyPreviousMonthBudget,
  getBudgetRecommendations
} = require('../controllers/budgetController');

const { authenticateToken } = require('../middleware/auth');
const { validateBudget } = require('../middleware/validation');

/**
 * @route   GET /api/budgets
 * @desc    Get all budgets for authenticated user
 * @access  Private
 * @query   monthYear (optional)
 */
router.get('/', authenticateToken, getBudgets);

/**
 * @route   GET /api/budgets/status
 * @desc    Get budget status with spending information
 * @access  Private
 * @query   monthYear (optional)
 */
router.get('/status', authenticateToken, getBudgetStatus);

/**
 * @route   GET /api/budgets/alerts
 * @desc    Get budget alerts (budgets close to or over limit)
 * @access  Private
 * @query   monthYear (optional)
 */
router.get('/alerts', authenticateToken, getBudgetAlerts);

/**
 * @route   GET /api/budgets/recommendations
 * @desc    Get budget recommendations based on spending history
 * @access  Private
 * @query   months (optional, default: 3)
 */
router.get('/recommendations', authenticateToken, getBudgetRecommendations);

/**
 * @route   POST /api/budgets/copy-previous
 * @desc    Copy budget from previous month
 * @access  Private
 * @body    category
 */
router.post('/copy-previous', authenticateToken, copyPreviousMonthBudget);

/**
 * @route   GET /api/budgets/:id
 * @desc    Get a single budget by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, getBudget);

/**
 * @route   POST /api/budgets
 * @desc    Create a new budget
 * @access  Private
 */
router.post('/', authenticateToken, validateBudget, createBudget);

/**
 * @route   PUT /api/budgets/:id
 * @desc    Update a budget
 * @access  Private
 */
router.put('/:id', authenticateToken, validateBudget, updateBudget);

/**
 * @route   DELETE /api/budgets/:id
 * @desc    Delete a budget
 * @access  Private
 */
router.delete('/:id', authenticateToken, deleteBudget);

module.exports = router;
