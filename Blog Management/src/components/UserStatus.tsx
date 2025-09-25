import { useState, useEffect } from 'react';
import { UserStatusData } from '../services/socketService';

interface UserStatusProps {
  user: {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    isOnline?: boolean;
    lastActive?: string;
    role?: string;
  };
  showRole?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * UserStatus Component
 * Displays user's online/offline status with real-time updates
 */
function UserStatus({ user, showRole = false, size = 'md', className = '' }: UserStatusProps) {
  const [userStatus, setUserStatus] = useState<UserStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get user ID (handle both _id and id formats)
  const userId = user._id || user.id;

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    // Set initial status from props
    setUserStatus({
      userId,
      name: user.name,
      email: user.email,
      isOnline: user.isOnline || false,
      lastActive: user.lastActive || new Date().toISOString(),
      role: user.role || 'customer'
    });
    setIsLoading(false);

    // Listen for real-time status updates
    const handleStatusChange = (event: CustomEvent) => {
      const updatedUser = event.detail as UserStatusData;
      
      // Only update if it's the same user
      if (updatedUser.userId === userId) {
        setUserStatus(updatedUser);
      }
    };

    // Add event listener for real-time updates
    window.addEventListener('userStatusChange', handleStatusChange as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('userStatusChange', handleStatusChange as EventListener);
    };
  }, [userId, user.name, user.email, user.isOnline, user.lastActive, user.role]);

  /**
   * Format time for display
   */
  const formatTime = (timeString: string): string => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return 'Unknown';
    }
  };

  /**
   * Format relative time (e.g., "2 minutes ago")
   */
  const formatRelativeTime = (timeString: string): string => {
    try {
      const date = new Date(timeString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) {
        return 'Just now';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
      }
    } catch (error) {
      return 'Unknown';
    }
  };

  /**
   * Get size classes
   */
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'lg':
        return 'text-base';
      default:
        return 'text-sm';
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-pulse bg-gray-200 rounded-full w-2 h-2"></div>
        <span className="text-gray-400">Loading...</span>
      </div>
    );
  }

  if (!userStatus) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        <span className="text-gray-500">Offline</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${getSizeClasses()} ${className}`}>
      {/* Online/Offline Indicator */}
      <div className="flex items-center space-x-1">
        <div 
          className={`w-2 h-2 rounded-full ${
            userStatus.isOnline 
              ? 'bg-green-500 animate-pulse' 
              : 'bg-gray-400'
          }`}
          title={userStatus.isOnline ? 'Online' : 'Offline'}
        />
        
        {/* Status Text */}
        {userStatus.isOnline ? (
          <span className="text-green-600 font-medium">Online</span>
        ) : (
          <span className="text-gray-500">
            Last seen {formatRelativeTime(userStatus.lastActive)}
          </span>
        )}
      </div>

      {/* Role Badge (optional) */}
      {showRole && userStatus.role && (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          userStatus.role === 'admin' 
            ? 'bg-purple-100 text-purple-700' 
            : 'bg-blue-100 text-blue-700'
        }`}>
          {userStatus.role}
        </span>
      )}

      {/* Detailed Time (on hover) */}
      {!userStatus.isOnline && (
        <span 
          className="text-gray-400 cursor-help" 
          title={`Last active: ${formatTime(userStatus.lastActive)}`}
        >
          ({formatTime(userStatus.lastActive)})
        </span>
      )}
    </div>
  );
}

export default UserStatus;
