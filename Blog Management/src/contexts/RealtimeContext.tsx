import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { socketService, UserStatusData } from '../services/socketService';
import { useAuth } from './AuthContext';

interface RealtimeContextType {
  isConnected: boolean;
  userStatuses: Map<string, UserStatusData>;
  updateUserStatus: (userData: UserStatusData) => void;
  getUserStatus: (userId: string) => UserStatusData | null;
  sendActivity: () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

interface RealtimeProviderProps {
  children: ReactNode;
}

/**
 * RealtimeProvider Component
 * Manages real-time user activity tracking and Socket.IO connections
 */
export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [userStatuses, setUserStatuses] = useState<Map<string, UserStatusData>>(new Map());

  /**
   * Update user status in the context
   */
  const updateUserStatus = (userData: UserStatusData) => {
    console.log('🔄 Updating user status:', userData);
    setUserStatuses(prev => {
      const newMap = new Map(prev);
      newMap.set(userData.userId, userData);
      console.log('📊 User statuses updated:', Array.from(newMap.entries()));
      return newMap;
    });
  };

  /**
   * Get user status by ID
   */
  const getUserStatus = (userId: string): UserStatusData | null => {
    return userStatuses.get(userId) || null;
  };

  /**
   * Send user activity heartbeat
   */
  const sendActivity = () => {
    if (socketService.isConnected()) {
      socketService.sendActivity();
    }
  };

  useEffect(() => {
    if (user?.id) {
      try {
        // Use _id if available (MongoDB ObjectId), otherwise use id
        const userId = user._id || user.id;
        console.log('Connecting to Socket.IO with userId:', userId);
        
        // Test backend connectivity first
        const testBackendConnection = async () => {
          try {
            const response = await fetch('http://localhost:5000/api/health');
            const data = await response.json();
            console.log('Backend health check:', data);
            
            if (data.success) {
              // Backend is running, connect to Socket.IO
              socketService.connect(userId);
            } else {
              console.error('Backend health check failed');
              setIsConnected(false);
            }
          } catch (error) {
            console.error('Backend connection test failed:', error);
            setIsConnected(false);
          }
        };
      
      testBackendConnection();

      // Listen for connection status changes
      const checkConnection = () => {
        const connected = socketService.isConnected();
        setIsConnected(connected);
        console.log('Socket connection status:', connected);
      };

      // Initial connection check
      checkConnection();

      // Check connection status periodically
      const connectionInterval = setInterval(checkConnection, 2000);

      // Listen for user status changes
      const handleStatusChange = (event: CustomEvent) => {
        const userData = event.detail as UserStatusData;
        console.log('📡 Received user status change event:', userData);
        updateUserStatus(userData);
      };

      // Listen for bulk user updates
      const handleBulkUpdate = (event: CustomEvent) => {
        const usersData = event.detail as UserStatusData[];
        console.log('📡 Received bulk user update event:', usersData.length, 'users');
        if (Array.isArray(usersData)) {
          usersData.forEach(userData => {
            console.log('📡 Processing bulk update for user:', userData);
            updateUserStatus(userData);
          });
        }
      };

      window.addEventListener('userStatusChange', handleStatusChange as EventListener);
      window.addEventListener('bulkUserUpdate', handleBulkUpdate as EventListener);

      // Send periodic activity heartbeat
      const activityInterval = setInterval(() => {
        if (socketService.isConnected()) {
          socketService.sendActivity();
        }
      }, 30000); // Send activity every 30 seconds

      // Cleanup
        return () => {
          clearInterval(connectionInterval);
          clearInterval(activityInterval);
          window.removeEventListener('userStatusChange', handleStatusChange as EventListener);
          window.removeEventListener('bulkUserUpdate', handleBulkUpdate as EventListener);
          socketService.disconnect();
          setIsConnected(false);
        };
      } catch (error) {
        console.error('RealtimeProvider error:', error);
        setIsConnected(false);
      }
    } else {
      // Disconnect if user is not authenticated
      socketService.disconnect();
      setIsConnected(false);
    }
  }, [user?.id]);

  const value: RealtimeContextType = {
    isConnected,
    userStatuses,
    updateUserStatus,
    getUserStatus,
    sendActivity
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

/**
 * Hook to use real-time context
 */
export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}

export default RealtimeContext;
