import { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, FileText, Eye, Check, X } from 'lucide-react';
import { blogService, Blog } from '../../services/blogService';
import { userService } from '../../services/userService';
import { User } from '../../services/authService';
import UserStatus from '../UserStatus';
import Button from '../Button';
import toast from 'react-hot-toast';
import { useRealtime } from '../../contexts/RealtimeContext';

function AdminCustomers() {
  // Real-time context for Socket.IO updates
  const { isConnected, getUserStatus, userStatuses } = useRealtime();
  
  // Real user data from API
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'admin'>('all');
  
  // Blog search states
  const [showBlogSearch, setShowBlogSearch] = useState(false);
  const [blogSearchTerm, setBlogSearchTerm] = useState('');
  const [blogAuthorName, setBlogAuthorName] = useState('');
  const [blogAuthorEmail, setBlogAuthorEmail] = useState('');
  const [blogStatusFilter, setBlogStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [searchResults, setSearchResults] = useState<Blog[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  // Load users from API
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const result = await userService.getAllUsers({ limit: 100 });
      console.log('📋 Loaded users from API:', result.users?.map(u => ({ id: u.id, _id: u._id, name: u.name, isOnline: u.isOnline })));
      setUsers(result.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
      
      // Check if it's a connection error
      if (error instanceof Error && error.message.includes('fetch')) {
        toast.error('Cannot connect to server. Please make sure the backend is running.');
      } else {
        toast.error('Failed to load users');
      }
      
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users based on search and filters with real-time status
  const filteredUsers = users.filter(user => {
    // Add null/undefined checks for user properties
    if (!user || !user.name || !user.email) {
      return false;
    }

    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Get real-time status from Socket.IO context
    const userId = user.id || user._id || '';
    const realtimeStatus = getUserStatus(userId);
    const isOnline = realtimeStatus ? realtimeStatus.isOnline : user.isOnline;
    
    // Debug logging
    if (realtimeStatus) {
      console.log(`👤 User ${user.name} real-time status:`, realtimeStatus);
    } else {
      console.log(`👤 User ${user.name} no real-time status, using fallback:`, user.isOnline);
    }
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'online' && isOnline) ||
                         (statusFilter === 'offline' && !isOnline);

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const formatLastActive = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch (error) {
      return 'Unknown';
    }
  };

  const getSubscriptionColor = (plan: string) => {
    switch (plan) {
      case 'Enterprise':
        return 'bg-purple-50 text-purple-700';
      case 'Premium':
        return 'bg-brand-50 text-brand-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleBlogSearch = async () => {
    setIsSearching(true);
    try {
      const filters: any = {};
      
      if (blogSearchTerm.trim()) filters.search = blogSearchTerm.trim();
      if (blogAuthorName.trim()) filters.authorName = blogAuthorName.trim();
      if (blogAuthorEmail.trim()) filters.authorEmail = blogAuthorEmail.trim();
      if (blogStatusFilter !== 'all') filters.status = blogStatusFilter;
      
      const result = await blogService.searchBlogs(filters);
      setSearchResults(result.blogs);
    } catch (error) {
      console.error('Blog search error:', error);
      toast.error('Failed to search blogs');
    } finally {
      setIsSearching(false);
    }
  };

  const handleApproveBlog = async (blogId: string) => {
    try {
      const updatedBlog = await blogService.updateBlogStatus(blogId, 'published');
      setSearchResults(searchResults.map(blog => blog._id === blogId ? updatedBlog : blog));
      toast.success('Blog approved and published successfully');
    } catch (error) {
      console.error('Failed to approve blog:', error);
      toast.error('Failed to approve blog');
    }
  };

  const handleRejectBlog = async (blogId: string) => {
    try {
      const updatedBlog = await blogService.updateBlogStatus(blogId, 'draft');
      setSearchResults(searchResults.map(blog => blog._id === blogId ? updatedBlog : blog));
      toast.success('Blog rejected and moved to draft');
    } catch (error) {
      console.error('Failed to reject blog:', error);
      toast.error('Failed to reject blog');
    }
  };

  const getBlogStatusColor = (status: Blog['status']) => {
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
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <div className="mt-2 text-gray-600">
              Monitor user activity and manage accounts.
              <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                isConnected 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <span className={`w-2 h-2 rounded-full mr-1 ${
                  isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}></span>
                {isConnected ? 'Real-time Connected' : 'Real-time Disconnected'}
              </span>
              <span className="ml-2 text-xs text-gray-500">
                (Real-time statuses: {Array.from(userStatuses.values()).filter(u => u.isOnline).length} online)
              </span>
            </div>
          </div>
          <Button
            onClick={() => setShowBlogSearch(!showBlogSearch)}
            icon={FileText}
            variant="secondary"
          >
            {showBlogSearch ? 'Hide Blog Search' : 'Search Blogs'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                className="input w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              className="input"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
            >
              <option value="all">All Roles</option>
              <option value="customer">Customers</option>
              <option value="admin">Admins</option>
            </select>
            <select
              className="input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Blog Search Section */}
      {showBlogSearch && (
        <div className="mb-6 card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Search Blogs</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Content
              </label>
              <input
                type="text"
                placeholder="Search in title or content..."
                className="input w-full"
                value={blogSearchTerm}
                onChange={(e) => setBlogSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author Name
              </label>
              <input
                type="text"
                placeholder="Filter by author name..."
                className="input w-full"
                value={blogAuthorName}
                onChange={(e) => setBlogAuthorName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author Email
              </label>
              <input
                type="email"
                placeholder="Filter by author email..."
                className="input w-full"
                value={blogAuthorEmail}
                onChange={(e) => setBlogAuthorEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="input w-full"
                value={blogStatusFilter}
                onChange={(e) => setBlogStatusFilter(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              onClick={handleBlogSearch}
              isLoading={isSearching}
              icon={Search}
            >
              Search Blogs
            </Button>
          </div>
        </div>
      )}

      {/* Blog Search Results */}
      {showBlogSearch && searchResults.length > 0 && (
        <div className="mb-6 card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Search Results ({searchResults.length} blogs found)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blog Post
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
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
                {searchResults.map((blog) => (
                  <tr key={blog._id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{blog.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {blog.excerpt || blog.content.substring(0, 100)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{blog.author.name}</div>
                        <div className="text-sm text-gray-500">{blog.author.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${getBlogStatusColor(blog.status)}`}>
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
                              onClick={() => handleApproveBlog(blog._id)}
                              icon={Check}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleRejectBlog(blog._id)}
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

      {/* User Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                // Additional safety check for user object
                if (!user || !user.id) {
                  return null;
                }
                
                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            user.role === 'admin' ? 'bg-purple-600' : 'bg-brand-600'
                          }`}>
                            <span className="text-sm font-medium text-white">
                              {(user.name || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{user.email || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${
                        user.role === 'admin' 
                          ? 'bg-purple-50 text-purple-700' 
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {user.role || 'customer'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <UserStatus 
                        user={{
                          id: user.id,
                          name: user.name || 'Unknown',
                          email: user.email || 'No email',
                          isOnline: user.isOnline || false,
                          lastActive: user.lastActive,
                          role: user.role || 'customer'
                        }}
                        size="sm"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(() => {
                        const realtimeStatus = getUserStatus(user.id || user._id || '');
                        const isOnline = realtimeStatus ? realtimeStatus.isOnline : user.isOnline;
                        const lastActive = realtimeStatus ? realtimeStatus.lastActive : user.lastActive;
                        return isOnline ? 'Active now' : formatLastActive(lastActive || '');
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${getSubscriptionColor(user.subscriptionPlan || 'Basic')}`}>
                        {user.subscriptionPlan || 'Basic'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && !isLoading && (
          <div className="text-center py-12">
            {users.length === 0 ? (
              <div>
                <p className="text-gray-500 mb-2">No users found.</p>
                <p className="text-sm text-gray-400">
                  Make sure the backend server is running and try refreshing the page.
                </p>
              </div>
            ) : (
              <p className="text-gray-500">No users found matching your criteria.</p>
            )}
          </div>
        )}
      </div>

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
                  <span className={`badge ${getBlogStatusColor(selectedBlog.status)}`}>
                    {selectedBlog.status}
                  </span>
                </div>
              </div>

              {/* Author Details */}
              <div className="card">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h5 className="text-lg font-medium text-gray-900">Author Information</h5>
                </div>
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedBlog.author.name}</p>
                      <p className="text-xs text-gray-500">Name</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedBlog.author.email}</p>
                      <p className="text-xs text-gray-500">Email</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedBlog.author.subscriptionPlan || 'Basic'}</p>
                      <p className="text-xs text-gray-500">Subscription Plan</p>
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
                </div>
              </div>
              
              {/* Action Buttons for Draft Blogs */}
              {selectedBlog.status === 'draft' && (
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    variant="danger"
                    onClick={() => {
                      handleRejectBlog(selectedBlog._id);
                      setSelectedBlog(null);
                    }}
                    icon={X}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => {
                      handleApproveBlog(selectedBlog._id);
                      setSelectedBlog(null);
                    }}
                    icon={Check}
                  >
                    Approve
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

export default AdminCustomers;