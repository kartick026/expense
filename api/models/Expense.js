/**
 * Expense Model
 * Defines the schema for expense records with validation and categorization
 */

const mongoose = require('mongoose');

// Define expense categories for validation
const expenseCategories = [
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

// Define payment methods for validation
const paymentMethods = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Digital Wallet',
  'Check',
  'Other'
];

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true // Index for efficient queries by user
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0'],
    max: [999999.99, 'Amount cannot exceed 999,999.99']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: expenseCategories,
      message: 'Category must be one of the predefined categories'
    },
    index: true // Index for category-based queries
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
    index: true // Index for date-based queries
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: {
      values: paymentMethods,
      message: 'Payment method must be one of the predefined methods'
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }]
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

/**
 * Virtual field to get formatted date
 * Returns date in YYYY-MM-DD format for frontend consumption
 */
expenseSchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

/**
 * Virtual field to get month-year for grouping
 * Returns date in YYYY-MM format for monthly summaries
 */
expenseSchema.virtual('monthYear').get(function() {
  return this.date.toISOString().substring(0, 7);
});

// Ensure virtual fields are included in JSON output
expenseSchema.set('toJSON', { virtuals: true });

/**
 * Static method to get expenses by user and date range
 * @param {ObjectId} userId - User's ID
 * @param {Date} startDate - Start date for filtering
 * @param {Date} endDate - End date for filtering
 * @returns {Promise<Array>} - Array of expenses
 */
expenseSchema.statics.findByUserAndDateRange = function(userId, startDate, endDate) {
  return this.find({
    userId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: -1 });
};

/**
 * Static method to get expenses by user and category
 * @param {ObjectId} userId - User's ID
 * @param {string} category - Expense category
 * @returns {Promise<Array>} - Array of expenses
 */
expenseSchema.statics.findByUserAndCategory = function(userId, category) {
  return this.find({ userId, category }).sort({ date: -1 });
};

/**
 * Static method to get monthly summary for a user
 * @param {ObjectId} userId - User's ID
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {Promise<Array>} - Aggregated expense data by category
 */
expenseSchema.statics.getMonthlySummary = function(userId, year, month) {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);
  
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        averageAmount: { $avg: '$amount' }
      }
    },
    {
      $sort: { totalAmount: -1 }
    }
  ]);
};

/**
 * Static method to get yearly spending trends
 * @param {ObjectId} userId - User's ID
 * @param {number} year - Year
 * @returns {Promise<Array>} - Monthly spending data
 */
expenseSchema.statics.getYearlyTrends = function(userId, year) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);
  
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          month: { $month: '$date' },
          year: { $year: '$date' }
        },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.month': 1 }
    }
  ]);
};

// Create compound indexes for efficient queries
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });
expenseSchema.index({ userId: 1, date: 1, category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
