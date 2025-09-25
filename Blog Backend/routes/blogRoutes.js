const express = require('express');
const { body } = require('express-validator');
const {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  getBlogsByAuthor,
  searchBlogs,
  getBlogAnalytics
} = require('../controllers/blogController');
const { verifyToken, isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Validation rules for blog creation and updates
 */
const blogValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters'),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Excerpt cannot be more than 300 characters'),
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be either draft or published'),
  body('featuredImage')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') return true; // Allow empty strings
      return /^https?:\/\/.+/.test(value); // Check if it's a valid URL
    })
    .withMessage('Featured image must be a valid URL'),
  body('isFeatured')
    .optional()
    .custom((value) => {
      if (typeof value === 'boolean') return true;
      if (typeof value === 'string') {
        return value === 'true' || value === 'false';
      }
      return false;
    })
    .withMessage('isFeatured must be a boolean value')
];

/**
 * Validation rules for status-only updates
 */
const statusValidation = [
  body('status')
    .isIn(['draft', 'published'])
    .withMessage('Status must be either draft or published')
];

// Public routes
router.get('/', getBlogs);
router.get('/search', searchBlogs);
router.get('/analytics', verifyToken, isAdmin, getBlogAnalytics);
router.get('/:id', getBlogById);
router.get('/author/:authorId', getBlogsByAuthor);

// Protected routes (require authentication)
router.post('/', verifyToken, isAuthenticated, blogValidation, createBlog);
router.put('/:id', verifyToken, isAuthenticated, blogValidation, updateBlog);
router.put('/:id/status', verifyToken, isAuthenticated, statusValidation, updateBlog);
router.delete('/:id', verifyToken, isAuthenticated, deleteBlog);

module.exports = router;
