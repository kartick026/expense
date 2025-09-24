// Single Unified API Handler for Vercel - All Routes in One Function
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// MongoDB connection with better options
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker', {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
  console.log('📊 Database: expense-tracker');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  console.error('💡 Make sure MongoDB is running on your system');
});

// Import all routes
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const budgetRoutes = require('./routes/budgets');
const summaryRoutes = require('./routes/summary');
const exportRoutes = require('./routes/export');

// Use all routes
app.use('/auth', authRoutes);
app.use('/expenses', expenseRoutes);
app.use('/budgets', budgetRoutes);
app.use('/summary', summaryRoutes);
app.use('/export', exportRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

module.exports = app;