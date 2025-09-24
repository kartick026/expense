/**
 * Application Constants
 * Centralized constants used throughout the application
 */

// Expense Categories
exports.EXPENSE_CATEGORIES = [
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
];

// Payment Methods
exports.PAYMENT_METHODS = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Digital Wallet',
  'Check',
  'Other'
];

// Default Pagination
exports.DEFAULT_PAGE_SIZE = 10;
exports.MAX_PAGE_SIZE = 100;

// Date Formats
exports.DATE_FORMATS = {
  ISO: 'YYYY-MM-DD',
  DISPLAY: 'MMM DD, YYYY',
  MONTH_YEAR: 'YYYY-MM'
};

// Budget Defaults
exports.BUDGET_DEFAULTS = {
  NOTIFICATION_THRESHOLD: 0.8,
  NOTIFICATIONS_ENABLED: true
};

// Validation Limits
exports.VALIDATION_LIMITS = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  PASSWORD_MIN_LENGTH: 6,
  DESCRIPTION_MAX_LENGTH: 500,
  TAG_MAX_LENGTH: 50,
  AMOUNT_MAX_VALUE: 999999.99
};

// HTTP Status Codes
exports.HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

// JWT Configuration
exports.JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '7d',
  REFRESH_TOKEN_EXPIRY: '30d',
  ISSUER: 'expense-tracker-api',
  AUDIENCE: 'expense-tracker-client'
};

// Rate Limiting
exports.RATE_LIMITS = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100
};

// File Upload
exports.FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif']
};

// Export Configuration
exports.EXPORT_CONFIG = {
  CSV_DELIMITER: ',',
  MAX_RECORDS_PER_EXPORT: 10000
};
