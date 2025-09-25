const express = require('express');
const {
  getUserStatus,
  getAllUsersStatus,
  getAllUsers,
  updateUserActivity,
  setUserOffline
} = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route   GET /api/users/status/:id
 * @desc    Get user status (online/offline and last active time)
 * @access  Public
 */
router.get('/status/:id', getUserStatus);

/**
 * @route   GET /api/users
 * @desc    Get all users (customers and admins)
 * @access  Private (Admin only)
 */
router.get('/', verifyToken, isAdmin, getAllUsers);

/**
 * @route   GET /api/users/status
 * @desc    Get all users with their online status
 * @access  Private (Admin only)
 */
router.get('/status', verifyToken, isAdmin, getAllUsersStatus);

/**
 * @route   PUT /api/users/activity/:id
 * @desc    Update user's last active time (heartbeat)
 * @access  Private
 */
router.put('/activity/:id', verifyToken, updateUserActivity);

/**
 * @route   PUT /api/users/:id/offline
 * @desc    Set user offline status (for logout fallback)
 * @access  Private (Authenticated user only)
 */
router.put('/:id/offline', verifyToken, setUserOffline);

module.exports = router;
