import { useState, useEffect } from 'react';
import { Check, X, Eye, User, Mail, CreditCard, Search } from 'lucide-react';
import { blogService, Blog } from '../../services/blogService';
import Button from '../Button';
import UserStatus from '../UserStatus';
import toast from 'react-hot-toast';

function AdminBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  
  // Blog search states
  const [showBlogSearch, setShowBlogSearch] = useState(true); // Default to true
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'published'>('all');
  const [displayedBlogs, setDisplayedBlogs] = useState<Blog[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      const result = await blogService.getAllBlogs();
      setBlogs(result.blogs || []);
    } catch (error) {
      console.error('Failed to load blogs:', error);
      toast.error('Failed to load blogs');
      setBlogs([]); // Ensure blogs is always an array
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (blogId: string) => {
    try {
      const updatedBlog = await blogService.updateBlogStatus(blogId, 'published');
      setBlogs(blogs.map(blog => blog._id === blogId ? updatedBlog : blog));
      setDisplayedBlogs(displayedBlogs.map(blog => blog._id === blogId ? updatedBlog : blog));
      toast.success('Blog approved and published successfully');
    } catch (error) {
      console.error('Failed to approve blog:', error);
      toast.error('Failed to approve blog');
    }
  };

  const handleReject = async (blogId: string) => {
    try {
      const updatedBlog = await blogService.updateBlogStatus(blogId, 'draft');
      setBlogs(blogs.map(blog => blog._id === blogId ? updatedBlog : blog));
      setDisplayedBlogs(displayedBlogs.map(blog => blog._id === blogId ? updatedBlog : blog));
      toast.success('Blog rejected and moved to draft');
    } catch (error) {
      console.error('Failed to reject blog:', error);
      toast.error('Failed to reject blog');
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
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleBlogSearch = async () => {
    setIsSearching(true);
    try {
      const filters: any = {};
      
      if (searchTerm.trim()) {
        // Search in content, author name, and email
        filters.search = searchTerm.trim();
      }
      if (activeTab !== 'all') {
        filters.status = activeTab;
      }
      
      const result = await blogService.searchBlogs(filters);
      setDisplayedBlogs(result.blogs);
    } catch (error) {
      console.error('Blog search error:', error);
      toast.error('Failed to search blogs');
    } finally {
      setIsSearching(false);
    }
  };

  // Auto-search when search term or tab changes
  useEffect(() => {
    if (showBlogSearch) {
      const timeoutId = setTimeout(() => {
        handleBlogSearch();
      }, 300); // Debounce search by 300ms
      
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, activeTab, showBlogSearch]);

  // Load all blogs when component mounts and search is visible
  useEffect(() => {
    if (showBlogSearch && !searchTerm && activeTab === 'all') {
      setDisplayedBlogs(blogs);
    }
  }, [blogs, showBlogSearch, searchTerm, activeTab]);

  // Show all blogs by default when search is visible and no filters are applied
  useEffect(() => {
    if (showBlogSearch && !searchTerm && activeTab === 'all' && blogs.length > 0) {
      setDisplayedBlogs(blogs);
    }
  }, [showBlogSearch, searchTerm, activeTab, blogs]);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
            <p className="mt-2 text-gray-600">Review and moderate customer blog posts.</p>
          </div>
          <Button
            onClick={() => setShowBlogSearch(!showBlogSearch)}
            icon={Search}
            variant="secondary"
          >
            {showBlogSearch ? 'Hide Search' : 'Search Blogs'}
          </Button>
        </div>
      </div>

      {/* Blog Search Section */}
      {showBlogSearch && (
        <div className="mb-6 card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Search Blogs</h3>
          
          {/* Single Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search blogs by title, content, author name, or email..."
                className="input w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-600"></div>
                </div>
              )}
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                activeTab === 'all'
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All Blogs
            </button>
            <button
              onClick={() => setActiveTab('draft')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                activeTab === 'draft'
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Draft (Pending)
            </button>
            <button
              onClick={() => setActiveTab('published')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                activeTab === 'published'
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Published (Accepted)
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Blog Results */}
      {showBlogSearch && displayedBlogs.length > 0 && (
        <div className="mb-6 card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {searchTerm || activeTab !== 'all' 
                  ? `Search Results (${displayedBlogs.length} blogs found)`
                  : `All Blogs (${displayedBlogs.length} total)`
                }
              </h3>
              <div className="text-sm text-gray-500">
                {searchTerm && `Searching for: "${searchTerm}"`}
                {activeTab !== 'all' && ` • Status: ${activeTab === 'draft' ? 'Draft' : 'Published'}`}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blog Post
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
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
                {displayedBlogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{blog.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {blog.excerpt || blog.content.substring(0, 100)}...
                        </div>
                        {blog.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {blog.categories.slice(0, 2).map((category, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {category}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-900">
                          <User className="w-4 h-4 mr-1" />
                          {blog.author.name}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="w-4 h-4 mr-1" />
                          {blog.author.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <CreditCard className="w-4 h-4 mr-1" />
                          {blog.author.subscriptionPlan || 'Basic'}
                        </div>
                        <div className="mt-1">
                          <UserStatus 
                            user={{
                              _id: blog.author._id,
                              name: blog.author.name,
                              email: blog.author.email,
                              role: 'customer'
                            }}
                            size="sm"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${getStatusColor(blog.status)}`}>
                        {blog.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(blog.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedBlog(blog)}
                          className="text-brand-600 hover:text-brand-900 transition-colors duration-200"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {blog.status === 'draft' && (
                          <>
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleApprove(blog._id)}
                              icon={Check}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleReject(blog._id)}
                              icon={X}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Search Results */}
      {showBlogSearch && displayedBlogs.length === 0 && (searchTerm || activeTab !== 'all') && !isSearching && (
        <div className="mb-6 card">
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No blogs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? `No blogs match your search for "${searchTerm}"`
                : `No blogs found with status "${activeTab}"`
              }
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setActiveTab('all');
                }}
                className="text-brand-600 hover:text-brand-500 text-sm font-medium"
              >
                Clear search and show all blogs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Blogs Available */}
      {showBlogSearch && displayedBlogs.length === 0 && !searchTerm && activeTab === 'all' && !isSearching && blogs.length === 0 && (
        <div className="mb-6 card">
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No blogs available</h3>
            <p className="mt-1 text-sm text-gray-500">
              There are no blogs in the system yet. Blogs will appear here once customers start creating them.
            </p>
          </div>
        </div>
      )}


      {/* Blog Preview Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-hover rounded-2xl bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Blog Preview</h3>
              <button
                onClick={() => setSelectedBlog(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Blog Header */}
              <div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">{selectedBlog.title}</h4>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>By {selectedBlog.author.name}</span>
                    <span>•</span>
                    <span>{formatDate(selectedBlog.createdAt)}</span>
                  </div>
                  <span className={`badge ${getStatusColor(selectedBlog.status)}`}>
                    {selectedBlog.status}
                  </span>
                </div>
              </div>

              {/* Author Details Card */}
              <div className="card">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h5 className="text-lg font-medium text-gray-900">Author Information</h5>
                </div>
                    <div className="px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center">
                          <User className="w-5 h-5 mr-2 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{selectedBlog.author.name}</p>
                            <p className="text-xs text-gray-500">Name</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Mail className="w-5 h-5 mr-2 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{selectedBlog.author.email}</p>
                            <p className="text-xs text-gray-500">Email</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <CreditCard className="w-5 h-5 mr-2 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{selectedBlog.author.subscriptionPlan || 'Basic'}</p>
                            <p className="text-xs text-gray-500">Subscription Plan</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Current Status:</span>
                          <UserStatus 
                            user={{
                              _id: selectedBlog.author._id,
                              name: selectedBlog.author.name,
                              email: selectedBlog.author.email,
                              role: 'customer'
                            }}
                            size="sm"
                          />
                        </div>
                      </div>
                    </div>
              </div>

              {/* Blog Content */}
              <div className="card">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h5 className="text-lg font-medium text-gray-900">Blog Content</h5>
                </div>
                <div className="px-6 py-4">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedBlog.content}</p>
                  </div>
                  
                  {/* Categories and Tags */}
                  {(selectedBlog.categories.length > 0 || selectedBlog.tags.length > 0) && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      {selectedBlog.categories.length > 0 && (
                        <div className="mb-4">
                          <h6 className="text-sm font-medium text-gray-900 mb-2">Categories</h6>
                          <div className="flex flex-wrap gap-2">
                            {selectedBlog.categories.map((category, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                              >
                                {category}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedBlog.tags.length > 0 && (
                        <div>
                          <h6 className="text-sm font-medium text-gray-900 mb-2">Tags</h6>
                          <div className="flex flex-wrap gap-2">
                            {selectedBlog.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons for Draft Blogs */}
              {selectedBlog.status === 'draft' && (
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    variant="danger"
                    onClick={() => {
                      handleReject(selectedBlog._id);
                      setSelectedBlog(null);
                    }}
                    icon={X}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => {
                      handleApprove(selectedBlog._id);
                      setSelectedBlog(null);
                    }}
                    icon={Check}
                  >
                    Publish
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBlogs;