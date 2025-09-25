export interface User {
  id: string;
  _id?: string; // MongoDB ID
  name: string;
  email: string;
  role: 'admin' | 'customer';
  subscriptionPlan?: 'Basic' | 'Premium' | 'Enterprise';
  isOnline?: boolean;
  lastActive?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  token?: string;
  user?: T;
  errors?: Array<{ msg: string; param: string }>;
}

// Backend API base URL
const API_BASE_URL = 'http://localhost:5000/api';

class AuthService {
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

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async login(email: string, password: string): Promise<User> {
    const response = await this.makeRequest<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!response.success || !response.token || !response.user) {
      throw new Error(response.message || 'Login failed');
    }

    // Store token and user data
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));

    return response.user;
  }

  async signup(name: string, email: string, password: string): Promise<User> {
    const response = await this.makeRequest<User>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ 
        name, 
        email, 
        password, 
        role: 'customer' // All new registrations are customers
      }),
    });

    if (!response.success || !response.token || !response.user) {
      throw new Error(response.message || 'Signup failed');
    }

    // Store token and user data
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));

    return response.user;
  }

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    try {
      const response = await this.makeRequest<User>('/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.success && response.user) {
        // Update stored user data
        localStorage.setItem('user', JSON.stringify(response.user));
        return response.user;
      }

      return null;
    } catch (error) {
      // Token might be invalid, clear storage
      this.logout();
      return null;
    }
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  storeUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  async logout(): Promise<void> {
    try {
      console.log('Starting logout process...');
      
      // Call backend logout endpoint to update user status
      const response = await this.makeRequest('/auth/logout', {
        method: 'POST',
      });
      
      console.log('Logout API response:', response);
      
      if (response.success) {
        console.log('User status updated successfully in backend');
      } else {
        console.error('Logout API returned error:', response.message);
      }
    } catch (error) {
      // Even if backend call fails, we should still clear local storage
      console.error('Logout API call failed:', error);
      
      // Try to update user status directly via user service as fallback
      try {
        const user = this.getStoredUser();
        if (user?.id) {
          console.log('Attempting fallback user status update...');
          // Import userService dynamically to avoid circular dependency
          const { userService } = await import('./userService');
          await userService.setUserOffline(user.id);
          console.log('Fallback user status update successful');
        }
      } catch (fallbackError) {
        console.error('Fallback user status update failed:', fallbackError);
      }
    } finally {
      // Always clear local storage
      console.log('Clearing local storage...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}

export const authService = new AuthService();