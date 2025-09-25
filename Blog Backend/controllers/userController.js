const User = require('../models/User');

/**
 * @desc    Get user status (online/offline and last active time)
 * @route   GET /api/users/status/:id
 * @access  Public
 */
const getUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('name email isOnline lastActive role');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        isOnline: user.isOnline,
        lastActive: user.lastActive,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Get user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user status'
    });
  }
};

/**
 * @desc    Get all users with their online status
 * @route   GET /api/users/status
 * @access  Private (Admin only)
 */
const getAllUsersStatus = async (req, res) => {
  try {
    const users = await User.find({})
      .select('name email isOnline lastActive role subscriptionPlan createdAt updatedAt')
      .sort({ lastActive: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users.map(user => ({
        userId: user._id,
        id: user._id, // For frontend compatibility
        name: user.name,
        email: user.email,
        isOnline: user.isOnline,
        lastActive: user.lastActive,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }))
    });
  } catch (error) {
    console.error('Get all users status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users status'
    });
  }
};

/**
 * @desc    Get all users (customers and admins)
 * @route   GET /api/users
 * @access  Private (Admin only)
 */
const getAllUsers = async (req, res) => {
  try {
    const { role, isOnline, page = 1, limit = 50 } = req.query;
    
    // Build filter object
    const filter = {};
    if (role) filter.role = role;
    if (isOnline !== undefined) filter.isOnline = isOnline === 'true';

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
      .select('name email isOnline lastActive role subscriptionPlan createdAt updatedAt')
      .sort({ lastActive: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: users.map(user => ({
        userId: user._id,
        id: user._id, // For frontend compatibility
        name: user.name,
        email: user.email,
        isOnline: user.isOnline,
        lastActive: user.lastActive,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }))
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
};

/**
 * @desc    Update user's last active time (heartbeat)
 * @route   PUT /api/users/activity/:id
 * @access  Private
 */
const updateUserActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { lastActive: new Date() },
      { new: true }
    ).select('name email isOnline lastActive role');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User activity updated',
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        isOnline: user.isOnline,
        lastActive: user.lastActive,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user activity'
    });
  }
};

/**
 * @desc    Set user offline status (for logout fallback)
 * @route   PUT /api/users/:id/offline
 * @access  Private (Authenticated user only)
 */
const setUserOffline = async (req, res) => {
  try {
    const userId = req.params.id;

    // Ensure the authenticated user is updating their own status
    if (req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user\'s status'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        isOnline: false,
        lastActive: new Date()
      },
      { new: true }
    ).select('isOnline lastActive name email role');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User status updated to offline',
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        isOnline: user.isOnline,
        lastActive: user.lastActive,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Set user offline error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while setting user offline'
    });
  }
};

module.exports = {
  getUserStatus,
  getAllUsersStatus,
  getAllUsers,
  updateUserActivity,
  setUserOffline
};
