import { User } from './authService';

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

interface UserFilters {
  role?: 'customer' | 'admin';
  isOnline?: boolean;
  page?: number;
  limit?: number;
}

// Backend API base URL
const API_BASE_URL = 'http://localhost:5000/api';

class UserService {
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const token = localStorage.getItem('token');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || response.statusText || 'Request failed';
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  /**
   * Get all users with their online status
   * @param filters - Optional filters for role, online status, pagination
   */
  async getAllUsers(filters: UserFilters = {}): Promise<{ users: User[]; total: number; page: number; pages: number }> {
    const queryParams = new URLSearchParams();
    
    if (filters.role) queryParams.append('role', filters.role);
    if (filters.isOnline !== undefined) queryParams.append('isOnline', filters.isOnline.toString());
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    
    const response = await this.makeRequest<User[]>(`/users?${queryParams}`);
    
    return {
      users: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      pages: response.pages || 1
    };
  }

  /**
   * Get all users with their online status (alternative endpoint)
   */
  async getAllUsersStatus(): Promise<User[]> {
    const response = await this.makeRequest<User[]>('/users/status');
    return response.data || [];
  }

  /**
   * Get user status by ID
   * @param userId - User ID
   */
  async getUserStatus(userId: string): Promise<User> {
    const response = await this.makeRequest<User>(`/users/status/${userId}`);
    if (!response.data) {
      throw new Error('User not found');
    }
    return response.data;
  }

  /**
   * Update user activity (heartbeat)
   * @param userId - User ID
   */
  async updateUserActivity(userId: string): Promise<User> {
    const response = await this.makeRequest<User>(`/users/activity/${userId}`, {
      method: 'PUT',
    });
    if (!response.data) {
      throw new Error('Failed to update user activity');
    }
    return response.data;
  }

  /**
   * Set user offline status (for logout fallback)
   * @param userId - User ID
   */
  async setUserOffline(userId: string): Promise<void> {
    try {
      await this.makeRequest(`/users/${userId}/offline`, {
        method: 'PUT',
      });
    } catch (error) {
      console.error('Failed to set user offline:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
export default userService;
