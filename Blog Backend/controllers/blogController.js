const Blog = require('../models/Blog');
const { validationResult } = require('express-validator');

/**
 * @desc    Create new blog
 * @route   POST /api/blogs
 * @access  Private (Customer only)
 */
const createBlog = async (req, res) => {
  try {
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      console.error('Request body:', req.body);
      console.error('Content length:', req.body.content ? req.body.content.length : 'No content');
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      content,
      excerpt,
      categories,
      tags,
      featuredImage,
      isFeatured,
      status = 'draft'
    } = req.body;


    // Create blog
    const blog = await Blog.create({
      title,
      content,
      excerpt,
      categories: categories ? categories.split(',').map(cat => cat.trim()).filter(cat => cat) : [],
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      featuredImage,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      status,
      author: req.user.id
    });

    // Populate author information
    await blog.populate('author', 'name email subscriptionPlan');

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: blog
    });
  } catch (error) {
    console.error('Create blog error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A blog with this title already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during blog creation'
    });
  }
};

/**
 * @desc    Get all blogs with filtering
 * @route   GET /api/blogs
 * @access  Public
 */
const getBlogs = async (req, res) => {
  try {
    const {
      status,
      category,
      tag,
      author,
      featured,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (category) {
      filter.categories = { $in: [category] };
    }
    
    if (tag) {
      filter.tags = { $in: [tag] };
    }
    
    if (author) {
      filter.author = author;
    }
    
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const blogs = await Blog.find(filter)
      .populate('author', 'name email subscriptionPlan')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Blog.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: blogs
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching blogs'
    });
  }
};

/**
 * @desc    Get single blog by ID
 * @route   GET /api/blogs/:id
 * @access  Public
 */
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'name email subscriptionPlan');
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Get blog by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching blog'
    });
  }
};

/**
 * @desc    Update blog
 * @route   PUT /api/blogs/:id
 * @access  Private (Author or Admin only)
 */
const updateBlog = async (req, res) => {
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

    const {
      title,
      content,
      excerpt,
      categories,
      tags,
      featuredImage,
      isFeatured,
      status
    } = req.body;

    // Find blog
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if user is author or admin
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this blog'
      });
    }

    // Check if this is a status-only update (from /status endpoint)
    const isStatusOnlyUpdate = req.path.includes('/status');
    
    // Update blog
    let updateData;
    
    if (isStatusOnlyUpdate) {
      // For status-only updates, only update status and timestamp
      updateData = {
        status: status,
        updatedAt: new Date()
      };
    } else {
      // For full updates, update all fields
      updateData = {
        title: title || blog.title,
        content: content || blog.content,
        excerpt: excerpt || blog.excerpt,
        categories: categories ? categories.split(',').map(cat => cat.trim()).filter(cat => cat) : blog.categories,
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : blog.tags,
        featuredImage: featuredImage !== undefined ? featuredImage : blog.featuredImage,
        isFeatured: isFeatured !== undefined ? (isFeatured === 'true' || isFeatured === true) : blog.isFeatured,
        status: status || blog.status,
        updatedAt: new Date()
      };
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name email subscriptionPlan');

    res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      data: updatedBlog
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during blog update'
    });
  }
};

/**
 * @desc    Delete blog
 * @route   DELETE /api/blogs/:id
 * @access  Private (Author or Admin only)
 */
const deleteBlog = async (req, res) => {
  try {
    // Find blog
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if user is author or admin
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this blog'
      });
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during blog deletion'
    });
  }
};

/**
 * @desc    Get blogs by author
 * @route   GET /api/blogs/author/:authorId
 * @access  Public
 */
const getBlogsByAuthor = async (req, res) => {
  try {
    const { authorId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { author: authorId };
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const blogs = await Blog.find(filter)
      .populate('author', 'name email subscriptionPlan')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: blogs
    });
  } catch (error) {
    console.error('Get blogs by author error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching author blogs'
    });
  }
};

/**
 * @desc    Search blogs with filters
 * @route   GET /api/blogs/search
 * @access  Public
 */
const searchBlogs = async (req, res) => {
  try {
    const {
      search,
      authorName,
      authorEmail,
      status,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filter = {};

    // Text search in title, content, author name, and author email
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status) {
      filter.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build aggregation pipeline for author filtering
    const pipeline = [
      // Lookup author information first
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'authorInfo'
        }
      },
      
      // Unwind author info
      { $unwind: '$authorInfo' },
      
      // Add author fields to root
      {
        $addFields: {
          'author.name': '$authorInfo.name',
          'author.email': '$authorInfo.email',
          'author.subscriptionPlan': '$authorInfo.subscriptionPlan'
        }
      },
      
      // Apply all filters including search in author fields
      {
        $match: {
          ...filter,
          // If search term is provided, also search in author name and email
          ...(search ? {
            $or: [
              ...(filter.$or || []),
              { 'author.name': { $regex: search, $options: 'i' } },
              { 'author.email': { $regex: search, $options: 'i' } }
            ]
          } : {}),
          // Filter by author name if provided
          ...(authorName ? { 'author.name': { $regex: authorName, $options: 'i' } } : {}),
          // Filter by author email if provided
          ...(authorEmail ? { 'author.email': { $regex: authorEmail, $options: 'i' } } : {})
        }
      },

      
      // Remove authorInfo field
      {
        $project: {
          authorInfo: 0
        }
      },
      
      // Sort by creation date
      { $sort: { createdAt: -1 } },
      
      // Pagination
      { $skip: skip },
      { $limit: parseInt(limit) }
    ];

    // Execute aggregation
    const blogs = await Blog.aggregate(pipeline);

    // Get total count for pagination
    const countPipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'authorInfo'
        }
      },
      { $unwind: '$authorInfo' },
      {
        $addFields: {
          'author.name': '$authorInfo.name',
          'author.email': '$authorInfo.email'
        }
      },
      {
        $match: {
          ...filter,
          // If search term is provided, also search in author name and email
          ...(search ? {
            $or: [
              ...(filter.$or || []),
              { 'author.name': { $regex: search, $options: 'i' } },
              { 'author.email': { $regex: search, $options: 'i' } }
            ]
          } : {}),
          // Filter by author name if provided
          ...(authorName ? { 'author.name': { $regex: authorName, $options: 'i' } } : {}),
          // Filter by author email if provided
          ...(authorEmail ? { 'author.email': { $regex: authorEmail, $options: 'i' } } : {})
        }
      },
      { $count: 'total' }
    ];

    const countResult = await Blog.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: blogs
    });
  } catch (error) {
    console.error('Search blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching blogs'
    });
  }
};

/**
 * @desc    Get blog analytics for admin dashboard
 * @route   GET /api/blogs/analytics
 * @access  Private (Admin only)
 */
const getBlogAnalytics = async (req, res) => {
  try {
    // Get total blogs count
    const totalBlogs = await Blog.countDocuments();
    
    // Get blogs by status
    const draftBlogs = await Blog.countDocuments({ status: 'draft' });
    const publishedBlogs = await Blog.countDocuments({ status: 'published' });
    
    // Get blogs created in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentBlogs = await Blog.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Get blogs created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayBlogs = await Blog.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });
    
    // Get blogs by month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyStats = await Blog.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: 1 },
          published: {
            $sum: {
              $cond: [{ $eq: ['$status', 'published'] }, 1, 0]
            }
          },
          draft: {
            $sum: {
              $cond: [{ $eq: ['$status', 'draft'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Get top authors by blog count
    const topAuthors = await Blog.aggregate([
      {
        $group: {
          _id: '$author',
          blogCount: { $sum: 1 },
          publishedCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'published'] }, 1, 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'authorInfo'
        }
      },
      {
        $unwind: '$authorInfo'
      },
      {
        $project: {
          authorId: '$_id',
          authorName: '$authorInfo.name',
          authorEmail: '$authorInfo.email',
          blogCount: 1,
          publishedCount: 1
        }
      },
      {
        $sort: { blogCount: -1 }
      },
      {
        $limit: 5
      }
    ]);
    
    // Get blogs by day for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyStats = await Blog.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          total: { $sum: 1 },
          published: {
            $sum: {
              $cond: [{ $eq: ['$status', 'published'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalBlogs,
          draftBlogs,
          publishedBlogs,
          recentBlogs,
          todayBlogs
        },
        monthlyStats,
        dailyStats,
        topAuthors
      }
    });
  } catch (error) {
    console.error('Get blog analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching blog analytics'
    });
  }
};

module.exports = {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  getBlogsByAuthor,
  searchBlogs,
  getBlogAnalytics
};
