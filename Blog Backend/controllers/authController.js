const User = require('../models/User');
const { validationResult } = require('express-validator');

/**
 * @desc    Register new user (Customer or Admin)
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, role = 'customer' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    // Generate JWT token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email and include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update user's lastActive timestamp and set online status
    user.lastActive = new Date();
    user.isOnline = true;
    await user.save();

    // Generate JWT token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
        isOnline: user.isOnline,
        lastActive: user.lastActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
        isOnline: user.isOnline,
        lastActive: user.lastActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Customer only route example
 * @route   GET /api/auth/customer
 * @access  Private (Customer only)
 */
const customerRoute = async (req, res) => {
  res.status(200).json({
    success: true,
    message: `Welcome, Customer ${req.user.name}!`,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
};

/**
 * @desc    Admin only route example
 * @route   GET /api/auth/admin
 * @access  Private (Admin only)
 */
const adminRoute = async (req, res) => {
  res.status(200).json({
    success: true,
    message: `Welcome, Admin ${req.user.name}!`,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
};

/**
 * @desc    Logout user (set offline status)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res) => {
  try {
    console.log(`Logout request for user: ${req.user.id}`);
    
    // Update user's online status to false and update lastActive
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, 
      {
        isOnline: false,
        lastActive: new Date()
      },
      { new: true }
    );

    if (!updatedUser) {
      console.error(`User not found for logout: ${req.user.id}`);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log(`User ${req.user.id} logged out successfully. isOnline: ${updatedUser.isOnline}`);

    res.status(200).json({
      success: true,
      message: 'Logout successful',
      data: {
        userId: updatedUser._id,
        isOnline: updatedUser.isOnline,
        lastActive: updatedUser.lastActive
      }
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

/**
 * @desc    Any authenticated user route example
 * @route   GET /api/auth/protected
 * @access  Private (Any authenticated user)
 */
const protectedRoute = async (req, res) => {
  res.status(200).json({
    success: true,
    message: `Welcome, ${req.user.name}! You are a ${req.user.role}.`,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
};

module.exports = {
  signup,
  login,
  logout,
  getMe,
  customerRoute,
  adminRoute,
  protectedRoute
};
