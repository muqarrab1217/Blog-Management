import { useState, useEffect } from 'react';
import { FileText, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { blogService, Blog } from '../../services/blogService';

function CustomerOverview() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBlogs = async () => {
      if (user?.id) {
        try {
          setIsLoading(true);
          const userBlogs = await blogService.getBlogsByAuthor(user.id);
          setBlogs(userBlogs);
        } catch (error) {
          console.error('Failed to load blogs:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadBlogs();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="px-4 pt-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      </div>
    );
  }

  const publishedBlogs = blogs.filter(blog => blog.status === 'published');
  const draftBlogs = blogs.filter(blog => blog.status === 'draft');
  const recentBlogs = blogs.slice(0, 5);

  const stats = [
    {
      name: 'Total Blogs',
      value: blogs.length,
      icon: FileText,
      color: 'bg-brand-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: 'Published',
      value: publishedBlogs.length,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      name: 'Drafts',
      value: draftBlogs.length,
      icon: FileText,
      color: 'bg-amber-500',
      change: '+3%',
      changeType: 'positive'
    },
    {
      name: 'This Month',
      value: blogs.filter(blog => {
        const blogDate = new Date(blog.createdAt);
        const now = new Date();
        return blogDate.getMonth() === now.getMonth() && blogDate.getFullYear() === now.getFullYear();
      }).length,
      icon: Calendar,
      color: 'bg-purple-500',
      change: '+25%',
      changeType: 'positive'
    }
  ];

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

  return (
    <div className="px-4 pt-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="mt-2 text-gray-600">Here's what's happening with your account today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.name} className="card">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${item.color} p-3 rounded-xl`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                      <dd className="text-lg font-medium text-gray-900">{item.value}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Blogs */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Blogs</h3>
          </div>
          <div className="px-6 py-4">
            {recentBlogs.length > 0 ? (
              <div className="space-y-4">
                {recentBlogs.map((blog) => (
                  <div key={blog._id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{blog.title}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(blog.createdAt)} • {blog.status}
                      </p>
                    </div>
                    <span className={`badge ${
                      blog.status === 'published' 
                        ? 'bg-emerald-50 text-emerald-700'
                        : blog.status === 'draft'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {blog.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No blogs yet. Create your first blog!</p>
            )}
          </div>
        </div>

        {/* Account Info */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-sm text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Subscription Plan</label>
              <p className="text-sm text-gray-900">{user?.subscriptionPlan || 'Basic'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Member Since</label>
              <p className="text-sm text-gray-900">
                {user?.createdAt ? formatDate(user.createdAt) : 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerOverview;