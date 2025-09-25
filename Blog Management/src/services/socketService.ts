import { io, Socket } from 'socket.io-client';

/**
 * Socket Service for Real-time User Activity Tracking
 * Handles Socket.IO connections and real-time updates
 */
class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 1 second

  /**
   * Connect to Socket.IO server
   * @param userId - User ID for authentication
   */
  connect(userId: string): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    console.log('🔌 Attempting to connect to Socket.IO server with userId:', userId);
    this.userId = userId;
    
    // Initialize socket connection
    this.socket = io('http://localhost:5000', {
      query: { userId },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.setupEventListeners();
  }

  /**
   * Setup socket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection established
    this.socket.on('connect', () => {
      console.log('🔌 Connected to Socket.IO server');
      console.log('Socket ID:', this.socket?.id);
      console.log('User ID:', this.userId);
      this.reconnectAttempts = 0;
    });

    // Connection lost
    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from Socket.IO server:', reason);
      
      // Attempt to reconnect if not manually disconnected
      if (reason !== 'io client disconnect' && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.attemptReconnect();
      }
    });

    // Connection error
    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      this.attemptReconnect();
    });

    // User status change event
    this.socket.on('user_status_change', (userData) => {
      console.log('👤 User status changed from backend:', userData);
      this.handleUserStatusChange(userData);
    });

    // Periodic online users update
    this.socket.on('online_users_update', (usersData) => {
      console.log('👥 Online users update from backend:', usersData.length, 'users');
      console.log('👥 Users data:', usersData);
      // Emit bulk update event for better performance
      const event = new CustomEvent('bulkUserUpdate', { detail: usersData });
      window.dispatchEvent(event);
    });
  }

  /**
   * Attempt to reconnect to server
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);

    setTimeout(() => {
      if (this.userId) {
        this.connect(this.userId);
      }
    }, delay);
  }

  /**
   * Handle user status change events
   * @param userData - User data from server
   */
  private handleUserStatusChange(userData: any): void {
    // Emit custom event for components to listen to
    const event = new CustomEvent('userStatusChange', { detail: userData });
    window.dispatchEvent(event);
  }

  /**
   * Send user activity heartbeat
   */
  sendActivity(): void {
    if (this.socket?.connected) {
      this.socket.emit('user_activity');
    }
  }

  /**
   * Disconnect from Socket.IO server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      this.reconnectAttempts = 0;
      console.log('🔌 Disconnected from Socket.IO server');
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get current user ID
   */
  getUserId(): string | null {
    return this.userId;
  }
}

// Export singleton instance
export const socketService = new SocketService();

// Export types
export interface UserStatusData {
  userId: string;
  name: string;
  email: string;
  isOnline: boolean;
  lastActive: string;
  role: string;
}

export default socketService;
