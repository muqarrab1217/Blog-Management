import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FileText, Calendar, User, Tag, Star, Image as ImageIcon, Grid3X3, List, Table } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { blogService, Blog } from '../../services/blogService';
import Button from '../Button';
import BlogForm from './BlogForm';
import toast from 'react-hot-toast';

function CustomerBlogs() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewFormat, setViewFormat] = useState<'card' | 'list' | 'table'>('card');

  useEffect(() => {
    loadBlogs();
  }, [user?.id, statusFilter]);

  const loadBlogs = async () => {
    if (user?.id) {
      try {
        const filters = statusFilter !== 'all' ? { status: statusFilter } : {};
        const userBlogs = await blogService.getBlogsByAuthor(user.id, filters);
        setBlogs(userBlogs);
      } catch (error) {
        console.error('Failed to load blogs:', error);
        toast.error('Failed to load blogs');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCreateBlog = () => {
    setEditingBlog(null);
    setShowForm(true);
  };

  const handleEditBlog = (blog: Blog) => {
    setEditingBlog(blog);
    setShowForm(true);
  };

  const handleDeleteBlog = (blog: Blog) => {
    setBlogToDelete(blog);
    setShowDeleteModal(true);
  };

  const confirmDeleteBlog = async () => {
    if (!blogToDelete) return;
    
    try {
      await blogService.deleteBlog(blogToDelete._id);
      setBlogs(blogs.filter(blog => blog._id !== blogToDelete._id));
      toast.success('Blog deleted successfully');
      setShowDeleteModal(false);
      setBlogToDelete(null);
    } catch (error) {
      toast.error('Failed to delete blog');
    }
  };

  const handleFormSubmit = async (blogData: any) => {
    try {
      if (editingBlog) {
        const updatedBlog = await blogService.updateBlog(editingBlog._id, blogData);
        setBlogs(blogs.map(blog => blog._id === editingBlog._id ? updatedBlog : blog));
        toast.success('Blog updated successfully');
      } else {
        const newBlog = await blogService.createBlog({
          ...blogData,
          status: blogData.status || 'draft'
        });
        setBlogs([newBlog, ...blogs]);
        toast.success('Blog created successfully');
      }
      setShowForm(false);
      setEditingBlog(null);
    } catch (error) {
      toast.error('Failed to save blog');
    }
  };

  const getStatusColor = (status: Blog['status']) => {
    switch (status) {
      case 'published':
        return 'bg-emerald-50 text-emerald-700';
      case 'draft':
        return 'bg-amber-50 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // List View Component
  const renderListView = () => (
    <div className="space-y-4">
      {blogs.map((blog) => (
        <div key={blog._id} className="card">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{blog.title}</h3>
                  <span className={`badge ${getStatusColor(blog.status)}`}>
                    {blog.status}
                  </span>
                  {blog.isFeatured && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {blog.excerpt || blog.content.substring(0, 200) + '...'}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(blog.createdAt)}
                  </div>
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    {blog.author.name}
                  </div>
                  {blog.categories.length > 0 && (
                    <div className="flex items-center gap-1">
                      {blog.categories.slice(0, 2).map((category, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleEditBlog(blog)}
                  className="p-2 text-brand-600 hover:text-brand-900 hover:bg-brand-50 rounded-lg transition-colors duration-200"
                  title="Edit blog"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteBlog(blog)}
                  className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  title="Delete blog"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Table View Component
  const renderTableView = () => (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categories
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {blogs.map((blog) => (
              <tr key={blog._id} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        {blog.title}
                        {blog.isFeatured && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {blog.excerpt || blog.content.substring(0, 100)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`badge ${getStatusColor(blog.status)}`}>
                    {blog.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {blog.categories.slice(0, 2).map((category, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {category}
                      </span>
                    ))}
                    {blog.categories.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{blog.categories.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(blog.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditBlog(blog)}
                      className="text-brand-600 hover:text-brand-900 transition-colors duration-200"
                      title="Edit blog"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBlog(blog)}
                      className="text-red-600 hover:text-red-900 transition-colors duration-200"
                      title="Delete blog"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Blogs</h1>
          <p className="mt-2 text-gray-600">Create and manage your blog posts.</p>
        </div>
        <div className="flex items-center gap-4">
          {/* View Format Selector */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewFormat('card')}
              className={`p-2 rounded-md transition-colors duration-200 ${
                viewFormat === 'card' 
                  ? 'bg-white text-brand-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Card View"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewFormat('list')}
              className={`p-2 rounded-md transition-colors duration-200 ${
                viewFormat === 'list' 
                  ? 'bg-white text-brand-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewFormat('table')}
              className={`p-2 rounded-md transition-colors duration-200 ${
                viewFormat === 'table' 
                  ? 'bg-white text-brand-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Table View"
            >
              <Table className="h-4 w-4" />
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input text-sm"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <Button onClick={handleCreateBlog} icon={Plus} className='min-w-[250px]'>
            Create New Blog
          </Button>
        </div>
      </div>

      {showForm && (
        <BlogForm
          blog={editingBlog}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingBlog(null);
          }}
        />
      )}

      {blogs.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No blogs</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new blog post.</p>
          <div className="mt-6">
            <Button onClick={handleCreateBlog} icon={Plus}>
              Create New Blog
            </Button>
          </div>
        </div>
      ) : (
        <>
          {viewFormat === 'card' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <div key={blog._id} className="card group">
                  {/* Featured Image */}
                  <div className="aspect-video bg-gray-200 rounded-t-xl overflow-hidden">
                    {blog.featuredImage ? (
                      <img
                        src={blog.featuredImage}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    {blog.isFeatured && (
                      <div className="absolute top-3 right-3">
                        <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`badge ${getStatusColor(blog.status)}`}>
                        {blog.status}
                      </span>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(blog.createdAt)}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {blog.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {blog.excerpt || blog.content.substring(0, 150) + '...'}
                    </p>

                    {/* Categories and Tags */}
                    <div className="mb-4">
                      {blog.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {blog.categories.slice(0, 2).map((category, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {category}
                            </span>
                          ))}
                          {blog.categories.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{blog.categories.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                      {blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {blog.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                            >
                              <Tag className="h-2 w-2 mr-1" />
                              {tag}
                            </span>
                          ))}
                          {blog.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{blog.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-1" />
                        {blog.author.name}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditBlog(blog)}
                          className="p-2 text-brand-600 hover:text-brand-900 hover:bg-brand-50 rounded-lg transition-colors duration-200"
                          title="Edit blog"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(blog)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Delete blog"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewFormat === 'list' && renderListView()}
          {viewFormat === 'table' && renderTableView()}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && blogToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Blog</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{blogToDelete.title}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setBlogToDelete(null);
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteBlog}
                className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerBlogs;