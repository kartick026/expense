// Export API route for Vercel
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

// Import export routes
const exportRoutes = require('./routes/export');

// Use export routes
app.use('/', exportRoutes);

module.exports = app;
