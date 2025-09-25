export interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author: {
    _id: string;
    name: string;
    email: string;
    subscriptionPlan?: string;
  };
  status: 'draft' | 'published';
  categories: string[];
  tags: string[];
  featuredImage?: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
  errors?: Array<{ msg: string; param: string }>;
}

interface BlogFilters {
  status?: string;
  category?: string;
  tag?: string;
  author?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}

// Backend API base URL
const API_BASE_URL = 'http://localhost:5000/api';

class BlogService {
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async getBlogsByAuthor(authorId: string, filters: BlogFilters = {}): Promise<Blog[]> {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    
    const response = await this.makeRequest<Blog[]>(`/blogs/author/${authorId}?${queryParams}`);
    return response.data || [];
  }

  async getAllBlogs(filters: BlogFilters = {}): Promise<{ blogs: Blog[]; total: number; page: number; pages: number }> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    const response = await this.makeRequest<Blog[]>(`/blogs?${queryParams}`);
    return {
      blogs: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      pages: response.pages || 1
    };
  }

  async getBlogById(id: string): Promise<Blog> {
    const response = await this.makeRequest<Blog>(`/blogs/${id}`);
    if (!response.data) {
      throw new Error('Blog not found');
    }
    return response.data;
  }

  async createBlog(blogData: {
    title: string;
    content: string;
    excerpt?: string;
    categories?: string;
    tags?: string;
    featuredImage?: string;
    isFeatured?: boolean;
    status?: 'draft' | 'published';
  }): Promise<Blog> {
    const response = await this.makeRequest<Blog>('/blogs', {
      method: 'POST',
      body: JSON.stringify(blogData),
    });

    if (!response.data) {
      throw new Error('Failed to create blog');
    }
    return response.data;
  }

  async updateBlog(id: string, updates: {
    title?: string;
    content?: string;
    excerpt?: string;
    categories?: string;
    tags?: string;
    featuredImage?: string;
    isFeatured?: boolean;
    status?: 'draft' | 'published';
  }): Promise<Blog> {
    const response = await this.makeRequest<Blog>(`/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    if (!response.data) {
      throw new Error('Failed to update blog');
    }
    return response.data;
  }

  async deleteBlog(id: string): Promise<void> {
    await this.makeRequest(`/blogs/${id}`, {
      method: 'DELETE',
    });
  }

  async updateBlogStatus(id: string, status: 'draft' | 'published'): Promise<Blog> {
    const response = await this.makeRequest<Blog>(`/blogs/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    if (!response.data) {
      throw new Error('Failed to update blog status');
    }
    return response.data;
  }

  async searchBlogs(filters: {
    search?: string;
    authorName?: string;
    authorEmail?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ blogs: Blog[]; total: number; page: number; pages: number }> {
    const queryParams = new URLSearchParams();
    
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.authorName) queryParams.append('authorName', filters.authorName);
    if (filters.authorEmail) queryParams.append('authorEmail', filters.authorEmail);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    
    const response = await this.makeRequest<Blog[]>(`/blogs/search?${queryParams}`);
    return {
      blogs: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      pages: response.pages || 1
    };
  }

  async getBlogAnalytics(): Promise<{
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
  }> {
    const response = await this.makeRequest<{
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
    }>('/blogs/analytics', {
      method: 'GET',
    });

    if (!response.data) {
      throw new Error('Failed to fetch blog analytics');
    }
    return response.data;
  }

}

export const blogService = new BlogService();