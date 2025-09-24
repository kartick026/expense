/**
 * Summary Routes
 * Handles analytics and summary data endpoints
 */

const express = require('express');
const router = express.Router();

// Import controllers and middleware
const {
  getMonthlySummary,
  getCategorySummary,
  getSpendingTrends,
  getPaymentMethodSummary,
  getDashboardSummary
} = require('../controllers/summaryController');

const { authenticateToken } = require('../middleware/auth');

/**
 * @route   GET /api/summary/dashboard
 * @desc    Get dashboard overview data
 * @access  Private
 */
router.get('/dashboard', authenticateToken, getDashboardSummary);

/**
 * @route   GET /api/summary/monthly
 * @desc    Get monthly expense summary
 * @access  Private
 * @query   year, month
 */
router.get('/monthly', authenticateToken, getMonthlySummary);

/**
 * @route   GET /api/summary/category
 * @desc    Get category-wise spending summary
 * @access  Private
 * @query   period, startDate, endDate
 */
router.get('/category', authenticateToken, getCategorySummary);

/**
 * @route   GET /api/summary/trends
 * @desc    Get spending trends over time
 * @access  Private
 * @query   period (year/month), year
 */
router.get('/trends', authenticateToken, getSpendingTrends);

/**
 * @route   GET /api/summary/payment-methods
 * @desc    Get payment method summary
 * @access  Private
 * @query   period, startDate, endDate
 */
router.get('/payment-methods', authenticateToken, getPaymentMethodSummary);

module.exports = router;
