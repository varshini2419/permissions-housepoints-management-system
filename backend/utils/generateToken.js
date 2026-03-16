// backend/utils/generateToken.js
const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for authenticated users
 * @param {string} userId - User's unique ID
 * @param {string} role - User's role (student, faculty, hod, admin)
 * @param {object} additionalData - Any additional data to include in token (optional)
 * @returns {string} JWT token
 */
const generateToken = (userId, role, additionalData = {}) => {
  // Validate required parameters
  if (!userId) {
    throw new Error('User ID is required to generate token');
  }

  if (!role) {
    throw new Error('User role is required to generate token');
  }

  // Check if JWT secret is configured
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  // Prepare token payload
  const payload = {
    id: userId,
    role,
    ...additionalData,
    iat: Math.floor(Date.now() / 1000) // Issued at time
  };

  // Set token expiration (default: 7 days)
  const expiresIn = process.env.JWT_EXPIRE || '7d';

  try {
    // Generate token
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn }
    );

    return token;
  } catch (error) {
    console.error('Token generation error:', error);
    throw new Error(`Failed to generate token: ${error.message}`);
  }
};

/**
 * Generate refresh token for extended sessions
 * @param {string} userId - User's unique ID
 * @returns {string} Refresh token
 */
const generateRefreshToken = (userId) => {
  if (!userId) {
    throw new Error('User ID is required to generate refresh token');
  }

  if (!process.env.JWT_REFRESH_SECRET) {
    // Fallback to main secret if refresh secret not defined
    console.warn('JWT_REFRESH_SECRET not defined, using JWT_SECRET');
  }

  const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  const refreshExpire = process.env.JWT_REFRESH_EXPIRE || '30d';

  try {
    const refreshToken = jwt.sign(
      { id: userId },
      refreshSecret,
      { expiresIn: refreshExpire }
    );

    return refreshToken;
  } catch (error) {
    console.error('Refresh token generation error:', error);
    throw new Error(`Failed to generate refresh token: ${error.message}`);
  }
};

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload
 */
const verifyToken = (token) => {
  if (!token) {
    throw new Error('Token is required for verification');
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }
};

/**
 * Generate multiple tokens for authentication
 * @param {string} userId - User's unique ID
 * @param {string} role - User's role
 * @returns {object} Object containing access token and refresh token
 */
const generateAuthTokens = (userId, role) => {
  const accessToken = generateToken(userId, role);
  const refreshToken = generateRefreshToken(userId);

  return {
    accessToken,
    refreshToken,
    expiresIn: process.env.JWT_EXPIRE || '7d'
  };
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  generateAuthTokens
};

// For backward compatibility, also export the main function as default
module.exports.default = generateToken;