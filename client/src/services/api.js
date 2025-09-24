import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  setToken: (token) => {
    if (token) {
      api.defaults.headers.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.Authorization;
    }
  },

  signup: (username, email, password) =>
    api.post('/auth/signup', { username, email, password }),

  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  getProfile: () =>
    api.get('/auth/me'),

  updateProfile: (profileData) =>
    api.put('/auth/profile', profileData),

  changePassword: (currentPassword, newPassword) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),
};

// Expenses API
export const expensesAPI = {
  getExpenses: (params = {}) =>
    api.get('/expenses', { params }),

  getExpense: (id) =>
    api.get(`/expenses/${id}`),

  createExpense: (expenseData) =>
    api.post('/expenses', expenseData),

  updateExpense: (id, expenseData) =>
    api.put(`/expenses/${id}`, expenseData),

  deleteExpense: (id) =>
    api.delete(`/expenses/${id}`),

  getExpenseStats: (period = 'month') =>
    api.get('/expenses/stats', { params: { period } }),

  searchExpenses: (query, params = {}) =>
    api.get('/expenses/search', { params: { q: query, ...params } }),
};

// Budgets API
export const budgetsAPI = {
  getBudgets: (monthYear = null) =>
    api.get('/budgets', { params: monthYear ? { monthYear } : {} }),

  getBudgetStatus: (monthYear = null) =>
    api.get('/budgets/status', { params: monthYear ? { monthYear } : {} }),

  getBudget: (id) =>
    api.get(`/budgets/${id}`),

  createBudget: (budgetData) =>
    api.post('/budgets', budgetData),

  updateBudget: (id, budgetData) =>
    api.put(`/budgets/${id}`, budgetData),

  deleteBudget: (id) =>
    api.delete(`/budgets/${id}`),

  getBudgetAlerts: (monthYear = null) =>
    api.get('/budgets/alerts', { params: monthYear ? { monthYear } : {} }),

  getBudgetRecommendations: (months = 3) =>
    api.get('/budgets/recommendations', { params: { months } }),

  copyPreviousMonthBudget: (category) =>
    api.post('/budgets/copy-previous', { category }),
};

// Summary API
export const summaryAPI = {
  getDashboardSummary: () =>
    api.get('/summary/dashboard'),

  getMonthlySummary: (year, month) =>
    api.get('/summary/monthly', { params: { year, month } }),

  getCategorySummary: (params = {}) =>
    api.get('/summary/category', { params }),

  getSpendingTrends: (period = 'year', year = null) =>
    api.get('/summary/trends', { params: { period, year } }),

  getPaymentMethodSummary: (params = {}) =>
    api.get('/summary/payment-methods', { params }),
};

// Export API
export const exportAPI = {
  exportExpensesCSV: (params = {}) =>
    api.get('/export/expenses/csv', { params, responseType: 'blob' }),

  exportExpensesJSON: (params = {}) =>
    api.get('/export/expenses/json', { params, responseType: 'blob' }),

  exportBudgetsCSV: (monthYear = null) =>
    api.get('/export/budgets/csv', { 
      params: monthYear ? { monthYear } : {},
      responseType: 'blob'
    }),

  exportCompleteData: (params = {}) =>
    api.get('/export/complete', { params, responseType: 'blob' }),
};

// Utility function to download blob files
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export default api;
