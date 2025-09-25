const mongoose = require('mongoose');

/**
 * Blog Schema
 * Handles blog posts with comprehensive fields for content management
 */
const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [10, 'Content must be at least 10 characters']
  },
  excerpt: {
    type: String,
    maxlength: [300, 'Excerpt cannot be more than 300 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  categories: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  featuredImage: {
    type: String,
    trim: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Generate slug from title before saving
 */
blogSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim('-'); // Remove leading/trailing hyphens
  }
  
  // Auto-generate excerpt if not provided
  if (this.isModified('content') && !this.excerpt) {
    this.excerpt = this.content.substring(0, 150).trim();
    if (this.content.length > 150) {
      this.excerpt += '...';
    }
  }
  
  // Update updatedAt timestamp
  this.updatedAt = new Date();
  
  next();
});

/**
 * Ensure slug uniqueness by appending number if needed
 */
blogSchema.pre('save', async function(next) {
  if (this.isModified('slug') || this.isNew) {
    let slug = this.slug;
    let counter = 1;
    
    while (true) {
      const existingBlog = await this.constructor.findOne({ 
        slug: slug, 
        _id: { $ne: this._id } 
      });
      
      if (!existingBlog) {
        this.slug = slug;
        break;
      }
      
      slug = `${this.slug}-${counter}`;
      counter++;
    }
  }
  
  next();
});

/**
 * Virtual for author name (populated)
 */
blogSchema.virtual('authorName', {
  ref: 'User',
  localField: 'author',
  foreignField: '_id',
  justOne: true
});

/**
 * Ensure virtual fields are serialized
 */
blogSchema.set('toJSON', { virtuals: true });
blogSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Blog', blogSchema);
