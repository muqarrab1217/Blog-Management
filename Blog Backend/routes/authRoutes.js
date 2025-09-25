const express = require('express');
const { body } = require('express-validator');
const {
  signup,
  login,
  logout,
  getMe,
  customerRoute,
  adminRoute,
  protectedRoute
} = require('../controllers/authController');
const { verifyToken, isAdmin, isCustomer, isAuthenticated } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Validation rules for signup
 */
const signupValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['customer', 'admin'])
    .withMessage('Role must be either customer or admin')
];

/**
 * Validation rules for login
 */
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Public routes
router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);

// Protected routes
router.get('/me', verifyToken, getMe);
router.post('/logout', verifyToken, logout);
router.get('/protected', verifyToken, isAuthenticated, protectedRoute);

// Role-specific routes
router.get('/customer', verifyToken, isCustomer, customerRoute);
router.get('/admin', verifyToken, isAdmin, adminRoute);

module.exports = router;
