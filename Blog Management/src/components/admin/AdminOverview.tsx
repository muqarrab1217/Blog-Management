import { useState, useEffect } from 'react';
import { FileText, CheckCircle, TrendingUp, Calendar, Users, BarChart3 } from 'lucide-react';
import { blogService } from '../../services/blogService';
import { userService } from '../../services/userService';

interface BlogAnalytics {
  overview: {
    totalBlogs: number;
    draftBlogs: number;
    publishedBlogs: number;
    recentBlogs: number;
    todayBlogs: number;
  };
  monthlyStats: Array<{
    _id: { year: number; month: number };
    total: number;
    published: number;
    draft: number;
  }>;
  dailyStats: Array<{
    _id: { year: number; month: number; day: number };
    total: number;
    published: number;
  }>;
  topAuthors: Array<{
    authorId: string;
    authorName: string;
    authorEmail: string;
    blogCount: number;
    publishedCount: number;
  }>;
}

function AdminOverview() {
  const [analytics, setAnalytics] = useState<BlogAnalytics | null>(null);
  const [userStats, setUserStats] = useState<{ total: number; online: number }>({ total: 0, online: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        
        // Load blog analytics
        const blogAnalytics = await blogService.getBlogAnalytics();
        setAnalytics(blogAnalytics);
        
        // Load user statistics
        const userResult = await userService.getAllUsers({ limit: 1000 });
        const totalUsers = userResult.users.length;
        const onlineUsers = userResult.users.filter(user => user.isOnline).length;
        setUserStats({ total: totalUsers, online: onlineUsers });
        
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAnalytics();
  }, []);


  const getMonthName = (month: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || 'Unknown';
  };

  const getDayName = (day: number) => {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - (7 - day));
    return targetDate.toLocaleDateString('en-US', { weekday: 'short' });
  };

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Users',
      value: userStats.total,
      icon: Users,
      color: 'bg-brand-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: 'Online Users',
      value: userStats.online,
      icon: Users,
      color: 'bg-emerald-500',
      change: '+5%',
      changeType: 'positive'
    },
    {
      name: 'Total Blogs',
      value: analytics.overview.totalBlogs,
      icon: FileText,
      color: 'bg-blue-500',
      change: '+18%',
      changeType: 'positive'
    },
    {
      name: 'Published Blogs',
      value: analytics.overview.publishedBlogs,
      icon: CheckCircle,
      color: 'bg-purple-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      name: 'Pending Blogs',
      value: analytics.overview.draftBlogs,
      icon: FileText,
      color: 'bg-amber-500',
      change: '+3%',
      changeType: 'positive'
    }
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Monitor platform analytics and blog performance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
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
                      <dd className="text-xs text-emerald-600 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {item.change}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Blog Trends */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Blog Trends (Last 6 Months)
            </h3>
          </div>
          <div className="px-6 py-4">
            {analytics.monthlyStats.length > 0 ? (
              <div className="space-y-4">
                {analytics.monthlyStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {getMonthName(stat._id.month)} {stat._id.year}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                          <span className="text-xs text-gray-500">Total: {stat.total}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                          <span className="text-xs text-gray-500">Published: {stat.published}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                          <span className="text-xs text-gray-500">Draft: {stat.draft}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{stat.total}</div>
                      <div className="text-xs text-gray-500">
                        {stat.total > 0 ? Math.round((stat.published / stat.total) * 100) : 0}% published
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No monthly data available</p>
            )}
          </div>
        </div>

        {/* Daily Blog Activity */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Daily Activity (Last 7 Days)
            </h3>
          </div>
          <div className="px-6 py-4">
            {analytics.dailyStats.length > 0 ? (
              <div className="space-y-3">
                {analytics.dailyStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {getDayName(index)} {stat._id.day}/{stat._id.month}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                          <span className="text-xs text-gray-500">Total: {stat.total}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                          <span className="text-xs text-gray-500">Published: {stat.published}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{stat.total}</div>
                      <div className="text-xs text-gray-500">
                        {stat.total > 0 ? Math.round((stat.published / stat.total) * 100) : 0}% published
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No daily data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Authors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Top Authors
            </h3>
          </div>
          <div className="px-6 py-4">
            {analytics.topAuthors.length > 0 ? (
              <div className="space-y-4">
                {analytics.topAuthors.map((author) => (
                  <div key={author.authorId} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {author.authorName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{author.authorName}</p>
                        <p className="text-xs text-gray-500">{author.authorEmail}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{author.blogCount} blogs</div>
                      <div className="text-xs text-gray-500">{author.publishedCount} published</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No author data available</p>
            )}
          </div>
        </div>

        {/* Blog Status Overview */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Blog Status Overview
            </h3>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">Published</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-medium text-gray-900">{analytics.overview.publishedBlogs}</div>
                  <div className="text-xs text-gray-500">
                    {analytics.overview.totalBlogs > 0 
                      ? Math.round((analytics.overview.publishedBlogs / analytics.overview.totalBlogs) * 100) 
                      : 0}% of total
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-amber-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">Draft</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-medium text-gray-900">{analytics.overview.draftBlogs}</div>
                  <div className="text-xs text-gray-500">
                    {analytics.overview.totalBlogs > 0 
                      ? Math.round((analytics.overview.draftBlogs / analytics.overview.totalBlogs) * 100) 
                      : 0}% of total
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">Total Blogs</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-medium text-gray-900">{analytics.overview.totalBlogs}</div>
                  <div className="text-xs text-gray-500">All time</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-indigo-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">Today's Blogs</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-medium text-gray-900">{analytics.overview.todayBlogs}</div>
                  <div className="text-xs text-gray-500">Created today</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOverview;