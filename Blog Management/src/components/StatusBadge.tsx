
interface StatusBadgeProps {
  isOnline: boolean;
  size?: 'sm' | 'md' | 'lg';
}

function StatusBadge({ isOnline, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <span className={`badge ${isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
      <span className="relative flex items-center">
        <span className={`mr-1 inline-flex items-center justify-center rounded-full ${sizeClasses[size]} ${isOnline ? 'bg-status-online' : 'bg-status-offline'}`}></span>
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </span>
  );
}

export default StatusBadge;