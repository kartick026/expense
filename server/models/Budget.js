/**
 * Budget Model
 * Defines the schema for budget management with category-based limits
 */

const mongoose = require('mongoose');

// Import expense categories from Expense model
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

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: expenseCategories,
      message: 'Category must be one of the predefined categories'
    },
    index: true
  },
  amountLimit: {
    type: Number,
    required: [true, 'Budget limit is required'],
    min: [0.01, 'Budget limit must be greater than 0'],
    max: [999999.99, 'Budget limit cannot exceed 999,999.99']
  },
  monthYear: {
    type: String,
    required: [true, 'Month and year are required'],
    match: [/^\d{4}-\d{2}$/, 'Month-year must be in YYYY-MM format'],
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notifications: {
    enabled: {
      type: Boolean,
      default: true
    },
    threshold: {
      type: Number,
      default: 0.8, // Alert when 80% of budget is used
      min: 0.1,
      max: 1.0
    }
  }
}, {
  timestamps: true
});

/**
 * Compound index to ensure unique budget per user, category, and month
 * This prevents duplicate budgets for the same category in the same month
 */
budgetSchema.index({ userId: 1, category: 1, monthYear: 1 }, { unique: true });

/**
 * Virtual field to get the current month-year string
 * Returns current month in YYYY-MM format
 */
budgetSchema.virtual('currentMonthYear').get(function() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
});

/**
 * Virtual field to check if budget is for current month
 * Returns true if the budget is for the current month
 */
budgetSchema.virtual('isCurrentMonth').get(function() {
  return this.monthYear === this.currentMonthYear;
});

// Ensure virtual fields are included in JSON output
budgetSchema.set('toJSON', { virtuals: true });

/**
 * Static method to get budgets for a specific user and month
 * @param {ObjectId} userId - User's ID
 * @param {string} monthYear - Month-year in YYYY-MM format
 * @returns {Promise<Array>} - Array of budgets
 */
budgetSchema.statics.findByUserAndMonth = function(userId, monthYear) {
  return this.find({ userId, monthYear, isActive: true }).sort({ category: 1 });
};

/**
 * Static method to get current month budgets for a user
 * @param {ObjectId} userId - User's ID
 * @returns {Promise<Array>} - Array of current month budgets
 */
budgetSchema.statics.findCurrentMonthBudgets = function(userId) {
  const currentMonthYear = new Date().toISOString().substring(0, 7);
  return this.find({ userId, monthYear: currentMonthYear, isActive: true }).sort({ category: 1 });
};

/**
 * Static method to get budget status with spending information
 * @param {ObjectId} userId - User's ID
 * @param {string} monthYear - Month-year in YYYY-MM format
 * @returns {Promise<Array>} - Array of budgets with spending data
 */
budgetSchema.statics.getBudgetStatus = async function(userId, monthYear) {
  const Expense = mongoose.model('Expense');
  
  // Get all budgets for the month
  const budgets = await this.find({ userId, monthYear, isActive: true });
  
  // Get spending data for each category
  const budgetStatus = await Promise.all(budgets.map(async (budget) => {
    const [year, month] = monthYear.split('-');
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    const spending = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          category: budget.category,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' },
          expenseCount: { $sum: 1 }
        }
      }
    ]);
    
    const totalSpent = spending.length > 0 ? spending[0].totalSpent : 0;
    const remaining = budget.amountLimit - totalSpent;
    const percentageUsed = (totalSpent / budget.amountLimit) * 100;
    
    return {
      ...budget.toObject(),
      totalSpent,
      remaining,
      percentageUsed: Math.round(percentageUsed * 100) / 100,
      isOverBudget: totalSpent > budget.amountLimit,
      shouldAlert: percentageUsed >= (budget.notifications.threshold * 100)
    };
  }));
  
  return budgetStatus.sort((a, b) => a.category.localeCompare(b.category));
};

/**
 * Instance method to check if budget is exceeded
 * @returns {Promise<boolean>} - True if budget is exceeded
 */
budgetSchema.methods.isExceeded = async function() {
  const Expense = mongoose.model('Expense');
  const [year, month] = this.monthYear.split('-');
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  const spending = await Expense.aggregate([
    {
      $match: {
        userId: this.userId,
        category: this.category,
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalSpent: { $sum: '$amount' }
      }
    }
  ]);
  
  const totalSpent = spending.length > 0 ? spending[0].totalSpent : 0;
  return totalSpent > this.amountLimit;
};

/**
 * Instance method to get current spending amount
 * @returns {Promise<number>} - Current spending amount for this budget
 */
budgetSchema.methods.getCurrentSpending = async function() {
  const Expense = mongoose.model('Expense');
  const [year, month] = this.monthYear.split('-');
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  const spending = await Expense.aggregate([
    {
      $match: {
        userId: this.userId,
        category: this.category,
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalSpent: { $sum: '$amount' }
      }
    }
  ]);
  
  return spending.length > 0 ? spending[0].totalSpent : 0;
};

module.exports = mongoose.model('Budget', budgetSchema);
