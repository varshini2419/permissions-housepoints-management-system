// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes - verifies JWT token and attaches user to request
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies (optional, based on your setup)
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // If no token found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. No token provided.'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired. Please login again.'
        });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. Please login again.'
        });
      }
      throw error;
    }

    // Check if decoded has required fields
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload.'
      });
    }

    // Get user from database (exclude password)
    const user = await User.findById(decoded.id)
      .select('-password')
      .populate('department', 'name code');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.'
      });
    }

    // Check if user account is active
    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact admin.'
      });
    }

    // Check if password was changed after token was issued
    if (user.passwordChangedAt) {
      const passwordChangedTimestamp = parseInt(
        user.passwordChangedAt.getTime() / 1000,
        10
      );
      
      // If password changed after token was issued
      if (decoded.iat && passwordChangedTimestamp > decoded.iat) {
        return res.status(401).json({
          success: false,
          message: 'User recently changed password. Please login again.'
        });
      }
    }

    // Attach user to request object
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      ...(user.role === 'student' && {
        enrollmentNo: user.enrollmentNo,
        house: user.house,
        year: user.year,
        semester: user.semester
      }),
      ...((user.role === 'faculty' || user.role === 'hod') && {
        employeeId: user.employeeId
      })
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Optional authentication middleware - attaches user if token exists, but doesn't block if not
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (user && user.isActive) {
          req.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department
          };
        }
      } catch (error) {
        // Silently fail for optional auth
      }
    }
    next();
  } catch (error) {
    // Continue even if optional auth fails
    next();
  }
};

/**
 * Middleware to check if user is logged in (for public routes that need user status)
 */
const isLoggedIn = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      req.isAuthenticated = false;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.isAuthenticated = true;
        req.user = {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department
        };
      } else {
        req.isAuthenticated = false;
      }
    } catch (error) {
      req.isAuthenticated = false;
    }
    
    next();
  } catch (error) {
    req.isAuthenticated = false;
    next();
  }
};

module.exports = {
  protect,
  optionalAuth,
  isLoggedIn
};