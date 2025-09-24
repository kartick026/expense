/**
 * Export Routes
 * Handles data export functionality
 */

const express = require('express');
const router = express.Router();

// Import controllers and middleware
const {
  exportExpensesToCSV,
  exportExpensesToJSON,
  exportBudgetsToCSV,
  exportCompleteData
} = require('../controllers/exportController');

const { authenticateToken } = require('../middleware/auth');

/**
 * @route   GET /api/export/expenses/csv
 * @desc    Export expenses to CSV file
 * @access  Private
 * @query   startDate, endDate, category (optional filters)
 */
router.get('/expenses/csv', authenticateToken, exportExpensesToCSV);

/**
 * @route   GET /api/export/expenses/json
 * @desc    Export expenses to JSON file
 * @access  Private
 * @query   startDate, endDate, category (optional filters)
 */
router.get('/expenses/json', authenticateToken, exportExpensesToJSON);

/**
 * @route   GET /api/export/budgets/csv
 * @desc    Export budgets to CSV file
 * @access  Private
 * @query   monthYear (optional filter)
 */
router.get('/budgets/csv', authenticateToken, exportBudgetsToCSV);

/**
 * @route   GET /api/export/complete
 * @desc    Export complete financial data to JSON
 * @access  Private
 * @query   startDate, endDate (optional filters)
 */
router.get('/complete', authenticateToken, exportCompleteData);

module.exports = router;
