const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verify JWT Token Middleware
 * Validates the token from Authorization header and attaches user info to req.user
 */
const verifyToken = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }


    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid. User not found.'
        });
      }

      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid.'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication.'
    });
  }
};

/**
 * Check if user is admin
 * Must be used after verifyToken middleware
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
};

/**
 * Check if user is customer
 * Must be used after verifyToken middleware
 */
const isCustomer = (req, res, next) => {
  if (req.user && req.user.role === 'customer') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Customer role required.'
    });
  }
};

/**
 * Check if user is either admin or customer (any authenticated user)
 * Must be used after verifyToken middleware
 */
const isAuthenticated = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'customer')) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Authentication required.'
    });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
  isCustomer,
  isAuthenticated
};
