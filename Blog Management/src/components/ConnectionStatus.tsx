import { useRealtime } from '../contexts/RealtimeContext';

/**
 * ConnectionStatus Component
 * Shows real-time connection status indicator
 */
function ConnectionStatus() {
  const { isConnected } = useRealtime();

  return (
    <div className="flex items-center space-x-2">
      <div 
        className={`w-2 h-2 rounded-full ${
          isConnected 
            ? 'bg-green-500 animate-pulse' 
            : 'bg-red-500'
        }`}
        title={isConnected ? 'Connected to real-time server' : 'Disconnected from real-time server'}
      />
      <span className={`text-xs font-medium ${
        isConnected ? 'text-green-600' : 'text-red-600'
      }`}>
        {isConnected ? 'Live' : 'Offline'}
      </span>
    </div>
  );
}

export default ConnectionStatus;
