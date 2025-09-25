import { User } from './authService';

const API_BASE_URL = 'http://localhost:5000/api';

interface ProfileData {
  name?: string;
  email?: string;
  subscriptionPlan?: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
}

class ProfileService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await this.makeRequest<{ success: boolean; data: User }>('/profile');
    return response.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: ProfileData): Promise<User> {
    const response = await this.makeRequest<{ success: boolean; data: User; message: string }>('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    return response.data;
  }

  /**
   * Change user password
   */
  async changePassword(passwordData: PasswordData): Promise<void> {
    await this.makeRequest<{ success: boolean; message: string }>('/profile/password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }
}

export const profileService = new ProfileService();
export type { ProfileData, PasswordData, User };
