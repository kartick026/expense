# Expensifyr 💰✨ Web Application

A comprehensive, full-stack expense tracking application built with Node.js, Express, MongoDB, React, and Tailwind CSS. This application provides secure user authentication, expense management, budget tracking, and detailed analytics with beautiful data visualizations.

## 🚀 Features

### User Management
- ✅ Secure user registration and login
- ✅ JWT-based authentication and authorization
- ✅ Password hashing with bcrypt
- ✅ Profile management and password change
- ✅ Input validation and error handling

### Expense Management
- ✅ Add, edit, delete, and view expenses
- ✅ Comprehensive expense fields (amount, category, date, payment method, description, tags)
- ✅ Advanced filtering and search functionality
- ✅ Pagination for large datasets
- ✅ Expense statistics and summaries

### Budget Management
- ✅ Set monthly budgets per category
- ✅ Real-time budget tracking and alerts
- ✅ Budget status monitoring with visual indicators
- ✅ Automatic notifications when approaching limits
- ✅ Budget recommendations based on spending history

### Data Visualization & Analytics
- ✅ Interactive pie charts for category-wise expenses
- ✅ Line charts for spending trends over time
- ✅ Bar charts for payment method analysis
- ✅ Monthly and yearly spending summaries
- ✅ Dashboard with key metrics and insights

### Export Functionality
- ✅ Export expenses to CSV format
- ✅ Export expenses to JSON format
- ✅ Export budgets to CSV format
- ✅ Complete data backup export
- ✅ Downloadable reports with filtering

### UI/UX Features
- ✅ Fully responsive design (mobile-first)
- ✅ Modern, clean interface with Tailwind CSS
- ✅ Dark/light theme support
- ✅ Loading states and error handling
- ✅ Toast notifications for user feedback
- ✅ Accessible components with proper ARIA labels

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Chart library
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Heroicons** - Icon library
- **React DatePicker** - Date selection

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn** package manager

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd expense-tracker
```

### 2. Install Dependencies

Install both backend and frontend dependencies:

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp env.example .env
```

Update the `.env` file with your configuration:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/expense-tracker

# JWT Secret Key (generate a strong secret key)
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000
```

**Important:** Generate a strong JWT secret key for production use.

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# On Windows
net start MongoDB
```

### 5. Run the Application

Start both the backend server and frontend development server:

```bash
# Start both servers concurrently
npm run dev
```

Or start them separately:

```bash
# Terminal 1 - Backend server
npm run server

# Terminal 2 - Frontend development server
npm run client
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 📁 Project Structure

```
expense-tracker/
├── server/                 # Backend code
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   └── index.js           # Server entry point
├── client/                # Frontend code
│   ├── public/            # Static files
│   └── src/               # React source code
│       ├── components/    # React components
│       ├── contexts/      # React contexts
│       ├── services/      # API services
│       └── index.js       # React entry point
├── package.json           # Root package.json
└── README.md             # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Expenses
- `GET /api/expenses` - Get all expenses (with filtering)
- `POST /api/expenses` - Create expense
- `GET /api/expenses/:id` - Get single expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/stats` - Get expense statistics
- `GET /api/expenses/search` - Search expenses

### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create budget
- `GET /api/budgets/:id` - Get single budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/status` - Get budget status
- `GET /api/budgets/alerts` - Get budget alerts
- `GET /api/budgets/recommendations` - Get budget recommendations

### Analytics & Summary
- `GET /api/summary/dashboard` - Dashboard overview
- `GET /api/summary/monthly` - Monthly summary
- `GET /api/summary/category` - Category breakdown
- `GET /api/summary/trends` - Spending trends
- `GET /api/summary/payment-methods` - Payment method analysis

### Export
- `GET /api/export/expenses/csv` - Export expenses to CSV
- `GET /api/export/expenses/json` - Export expenses to JSON
- `GET /api/export/budgets/csv` - Export budgets to CSV
- `GET /api/export/complete` - Export complete data

## 🗄️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Expenses Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  amount: Number,
  category: String,
  date: Date,
  paymentMethod: String,
  description: String,
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Budgets Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  category: String,
  amountLimit: Number,
  monthYear: String (YYYY-MM),
  isActive: Boolean,
  notifications: {
    enabled: Boolean,
    threshold: Number (0.1-1.0)
  },
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Comprehensive validation on both client and server
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Configured CORS policies
- **Helmet.js**: Security headers
- **SQL Injection Protection**: MongoDB with Mongoose ODM
- **XSS Protection**: Input sanitization and output encoding

## 🎨 UI Components

The application uses a comprehensive set of reusable components:

- **Layout**: Responsive layout with sidebar navigation
- **Forms**: Input, Select, Button components with validation
- **Cards**: Flexible card components for content display
- **Modals**: Modal dialogs for forms and confirmations
- **Charts**: Interactive charts using Recharts
- **Loading States**: Spinner and skeleton loading components
- **Notifications**: Toast notifications for user feedback

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:

- **Desktop** (1024px and above)
- **Tablet** (768px - 1023px)
- **Mobile** (320px - 767px)

Key responsive features:
- Collapsible sidebar navigation
- Responsive grid layouts
- Touch-friendly mobile interface
- Optimized mobile forms and tables

## 🚀 Deployment

### Production Build

```bash
# Build the frontend
cd client
npm run build
cd ..

# Start production server
npm start
```

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-production-jwt-secret
PORT=5000
CLIENT_URL=https://your-domain.com
```

### Docker Deployment (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY server/ ./server/
COPY client/build/ ./client/build/

EXPOSE 5000

CMD ["node", "server/index.js"]
```

## 🧪 Testing

Run the test suite:

```bash
# Backend tests
npm test

# Frontend tests
cd client
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Provide steps to reproduce the problem
4. Include error messages and system information

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
  - User authentication and authorization
  - Expense management (CRUD operations)
  - Budget management and tracking
  - Data visualization and analytics
  - Export functionality
  - Responsive design

## 🎯 Future Enhancements

- [ ] Dark mode theme
- [ ] Multi-currency support
- [ ] Recurring expenses
- [ ] Expense categories customization
- [ ] Advanced reporting
- [ ] Mobile app (React Native)
- [ ] Social features (sharing budgets)
- [ ] Integration with banking APIs
- [ ] AI-powered spending insights
- [ ] Goal tracking and savings plans

---

**Built with ❤️ using modern web technologies**
