/**
 * JWT Utility Functions
 * Handles token generation, verification, and management
 */

const jwt = require('jsonwebtoken');

/**
 * Generate JWT access token for user
 * @param {Object} user - User object with id and other details
 * @param {string} expiresIn - Token expiration time (default: 7 days)
 * @returns {string} - JWT token
 */
const generateAccessToken = (user, expiresIn = '7d') => {
  const payload = {
    userId: user._id,
    username: user.username,
    email: user.email
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
    issuer: 'expense-tracker-api',
    audience: 'expense-tracker-client'
  });
};

/**
 * Generate JWT refresh token for user
 * @param {Object} user - User object with id
 * @param {string} expiresIn - Token expiration time (default: 30 days)
 * @returns {string} - JWT refresh token
 */
const generateRefreshToken = (user, expiresIn = '30d') => {
  const payload = {
    userId: user._id,
    type: 'refresh'
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
    issuer: 'expense-tracker-api',
    audience: 'expense-tracker-client'
  });
};

/**
 * Verify JWT token and return decoded payload
 * @param {string} token - JWT token to verify
 * @returns {Object} - Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Decode JWT token without verification (for inspection)
 * @param {string} token - JWT token to decode
 * @returns {Object} - Decoded token payload (not verified)
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

/**
 * Get token expiration date
 * @param {string} token - JWT token
 * @returns {Date} - Token expiration date
 */
const getTokenExpiration = (token) => {
  const decoded = decodeToken(token);
  return new Date(decoded.exp * 1000);
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if token is expired
 */
const isTokenExpired = (token) => {
  try {
    const expiration = getTokenExpiration(token);
    return new Date() > expiration;
  } catch (error) {
    return true; // Consider invalid tokens as expired
  }
};

/**
 * Generate token pair (access + refresh tokens)
 * @param {Object} user - User object
 * @returns {Object} - Object containing access and refresh tokens
 */
const generateTokenPair = (user) => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
    tokenType: 'Bearer'
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
  getTokenExpiration,
  isTokenExpired,
  generateTokenPair
};
