/**
 * Validation Middleware
 * Contains validation rules for request bodies using express-validator
 */

const { body } = require('express-validator');

/**
 * Validation rules for user registration
 */
const validateSignup = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

/**
 * Validation rules for user login
 */
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Validation rules for expense creation and updates
 */
const validateExpense = [
  body('amount')
    .isFloat({ min: 0.01, max: 999999.99 })
    .withMessage('Amount must be between 0.01 and 999,999.99'),
  
  body('category')
    .isIn([
      'Food & Dining',
      'Transportation',
      'Shopping',
      'Entertainment',
      'Healthcare',
      'Education',
      'Bills & Utilities',
      'Travel',
      'Personal Care',
      'Subscriptions',
      'Gifts & Donations',
      'Other'
    ])
    .withMessage('Please select a valid category'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  
  body('paymentMethod')
    .isIn([
      'Cash',
      'Credit Card',
      'Debit Card',
      'Bank Transfer',
      'Digital Wallet',
      'Check',
      'Other'
    ])
    .withMessage('Please select a valid payment method'),
  
  body('description')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each tag must be a string with maximum 50 characters')
];

/**
 * Validation rules for budget creation and updates
 */
const validateBudget = [
  body('category')
    .isIn([
      'Food & Dining',
      'Transportation',
      'Shopping',
      'Entertainment',
      'Healthcare',
      'Education',
      'Bills & Utilities',
      'Travel',
      'Personal Care',
      'Subscriptions',
      'Gifts & Donations',
      'Other'
    ])
    .withMessage('Please select a valid category'),
  
  body('amountLimit')
    .isFloat({ min: 0.01, max: 999999.99 })
    .withMessage('Budget limit must be between 0.01 and 999,999.99'),
  
  body('monthYear')
    .optional()
    .matches(/^\d{4}-\d{2}$/)
    .withMessage('Month-year must be in YYYY-MM format'),
  
  body('notifications.enabled')
    .optional()
    .isBoolean()
    .withMessage('Notification enabled must be a boolean'),
  
  body('notifications.threshold')
    .optional()
    .isFloat({ min: 0.1, max: 1.0 })
    .withMessage('Notification threshold must be between 0.1 and 1.0')
];

/**
 * Validation rules for profile updates
 */
const validateProfileUpdate = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
];

/**
 * Validation rules for password change
 */
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

module.exports = {
  validateSignup,
  validateLogin,
  validateExpense,
  validateBudget,
  validateProfileUpdate,
  validatePasswordChange
};
