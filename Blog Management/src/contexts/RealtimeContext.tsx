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
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [userStatuses, setUserStatuses] = useState<Map<string, UserStatusData>>(new Map());

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // Connect to Socket.IO when user is authenticated
      socketService.connect(user.id);
      setIsConnected(true);

      // Listen for connection status changes
      const checkConnection = () => {
        setIsConnected(socketService.isConnected());
      };

      // Check connection status periodically
      const connectionInterval = setInterval(checkConnection, 5000);

      // Listen for user status changes
      const handleStatusChange = (event: CustomEvent) => {
        const userData = event.detail as UserStatusData;
        updateUserStatus(userData);
      };

      window.addEventListener('userStatusChange', handleStatusChange as EventListener);

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
        socketService.disconnect();
        setIsConnected(false);
      };
    } else {
      // Disconnect if user is not authenticated
      socketService.disconnect();
      setIsConnected(false);
    }
  }, [isAuthenticated, user?.id]);

  /**
   * Update user status in the context
   */
  const updateUserStatus = (userData: UserStatusData) => {
    setUserStatuses(prev => {
      const newMap = new Map(prev);
      newMap.set(userData.userId, userData);
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
