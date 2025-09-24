# Setup Guide - Expense Tracker Application

This guide will walk you through setting up the Expense Tracker application on your local machine.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

### Required Software
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

### Verify Installation
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check MongoDB version
mongod --version

# Check Git version
git --version
```

## 🚀 Step-by-Step Setup

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone <your-repository-url>
cd expense-tracker

# Verify the project structure
ls -la
```

You should see:
- `server/` directory (backend code)
- `client/` directory (frontend code)
- `package.json` files
- `README.md` and other configuration files

### Step 2: Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

**Expected Output:**
- Backend dependencies installed in `node_modules/`
- Frontend dependencies installed in `client/node_modules/`

### Step 3: Configure Environment Variables

```bash
# Copy the example environment file
cp env.example .env

# Edit the .env file with your preferred editor
nano .env  # or use vim, code, etc.
```

**Required Environment Variables:**

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/expense-tracker

# JWT Secret Key (IMPORTANT: Change this in production!)
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000
```

**Security Note:** Generate a strong JWT secret key for production:
```bash
# Generate a random secret key
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 4: Start MongoDB

#### Option A: Using MongoDB Service (Recommended)
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# On Windows
net start MongoDB
```

#### Option B: Manual Start
```bash
# Start MongoDB manually
mongod --dbpath /path/to/your/data/directory
```

#### Option C: Using Docker
```bash
# Run MongoDB in Docker
docker run --name mongodb -p 27017:27017 -d mongo:latest
```

**Verify MongoDB is running:**
```bash
# Connect to MongoDB shell
mongosh

# In MongoDB shell, list databases
show dbs

# Exit MongoDB shell
exit
```

### Step 5: Run the Application

#### Option A: Run Both Servers Concurrently (Recommended)
```bash
# This will start both backend and frontend servers
npm run dev
```

#### Option B: Run Servers Separately
```bash
# Terminal 1: Start backend server
npm run server

# Terminal 2: Start frontend development server
npm run client
```

### Step 6: Verify Installation

1. **Backend Health Check:**
   - Open: http://localhost:5000/api/health
   - Expected: JSON response with status "OK"

2. **Frontend Application:**
   - Open: http://localhost:3000
   - Expected: Login page should load

3. **Database Connection:**
   - Check console logs for "Connected to MongoDB successfully"
   - No connection errors should appear

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Issue 1: MongoDB Connection Failed
```
Error: MongoDB connection error: MongoNetworkError
```

**Solutions:**
- Ensure MongoDB is running: `brew services list | grep mongodb` (macOS)
- Check MongoDB port: `netstat -an | grep 27017`
- Verify connection string in `.env` file
- Try connecting manually: `mongosh mongodb://localhost:27017`

#### Issue 2: Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**
- Kill existing process: `lsof -ti:5000 | xargs kill -9`
- Change port in `.env` file: `PORT=5001`
- Use different ports for backend and frontend

#### Issue 3: Node Modules Issues
```
Error: Cannot find module 'express'
```

**Solutions:**
- Delete `node_modules` and reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```
- Clear npm cache: `npm cache clean --force`
- Check Node.js version compatibility

#### Issue 4: Frontend Build Errors
```
Error: Module not found: Can't resolve 'react'
```

**Solutions:**
- Navigate to client directory: `cd client`
- Reinstall dependencies: `rm -rf node_modules package-lock.json && npm install`
- Check for version conflicts in `package.json`

#### Issue 5: CORS Errors
```
Error: Access to fetch at 'http://localhost:5000' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solutions:**
- Verify `CLIENT_URL` in `.env` file
- Restart the backend server after changing environment variables
- Check CORS configuration in `server/index.js`

### Debug Mode

Enable debug logging:
```bash
# Set debug environment variable
DEBUG=expense-tracker:* npm run dev
```

### Database Reset

If you need to reset the database:
```bash
# Connect to MongoDB
mongosh

# Switch to expense-tracker database
use expense-tracker

# Drop all collections
db.users.drop()
db.expenses.drop()
db.budgets.drop()

# Exit
exit
```

## 🧪 Testing the Application

### 1. Create a Test Account
1. Go to http://localhost:3000/signup
2. Fill in the registration form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `TestPass123!`
3. Click "Create account"

### 2. Test Core Features
1. **Dashboard**: Verify dashboard loads with empty state
2. **Add Expense**: Create a test expense
3. **View Expenses**: Check expense list and filtering
4. **Create Budget**: Set up a monthly budget
5. **Analytics**: View charts and summaries
6. **Export**: Test data export functionality

### 3. API Testing
Test API endpoints using curl or Postman:

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test login (replace with actual credentials)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'
```

## 📱 Mobile Testing

Test responsive design on different screen sizes:

1. **Browser DevTools**: Use responsive design mode
2. **Mobile Devices**: Access via local network IP
3. **Tablet Testing**: Test iPad/Android tablet layouts

## 🔄 Development Workflow

### Making Changes
1. **Backend Changes**: Edit files in `server/` directory
2. **Frontend Changes**: Edit files in `client/src/` directory
3. **Hot Reload**: Changes automatically reload in development

### Code Structure
```
server/
├── controllers/     # Business logic
├── models/         # Database models
├── routes/         # API routes
├── middleware/     # Custom middleware
└── utils/          # Utility functions

client/src/
├── components/     # React components
├── contexts/       # React contexts
├── services/       # API services
└── App.js         # Main app component
```

### Adding New Features
1. **Backend**: Create controller → route → model (if needed)
2. **Frontend**: Create component → add to routing → update API service
3. **Testing**: Test both API and UI functionality

## 🚀 Production Deployment

### Environment Setup
```env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-production-jwt-secret
PORT=5000
CLIENT_URL=https://your-domain.com
```

### Build for Production
```bash
# Build frontend
cd client
npm run build
cd ..

# Start production server
npm start
```

## 📞 Getting Help

If you encounter issues:

1. **Check Logs**: Look at console output for error messages
2. **Verify Prerequisites**: Ensure all required software is installed
3. **Check Environment**: Verify `.env` file configuration
4. **Database Connection**: Ensure MongoDB is running and accessible
5. **Port Conflicts**: Check if ports 3000 and 5000 are available

### Useful Commands
```bash
# Check running processes on ports
lsof -i :3000
lsof -i :5000

# Check MongoDB status
brew services list | grep mongodb

# View application logs
npm run dev 2>&1 | tee app.log

# Test database connection
mongosh mongodb://localhost:27017/expense-tracker
```

## ✅ Success Checklist

- [ ] Node.js and npm installed
- [ ] MongoDB installed and running
- [ ] Repository cloned successfully
- [ ] Dependencies installed (both backend and frontend)
- [ ] Environment variables configured
- [ ] Backend server starts without errors
- [ ] Frontend development server starts
- [ ] Can access http://localhost:3000
- [ ] Can access http://localhost:5000/api/health
- [ ] Can create a user account
- [ ] Can log in successfully
- [ ] Dashboard loads correctly
- [ ] Can add/view expenses
- [ ] Can create/view budgets
- [ ] Charts and analytics work
- [ ] Export functionality works

Once all items are checked, your Expense Tracker application is ready for development! 🎉
