// Unified Expenses API Handler for Vercel
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

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker');

// Import all expense-related routes
const expenseRoutes = require('./routes/expenses');

// Use expense routes
app.use('/', expenseRoutes);

module.exports = app;