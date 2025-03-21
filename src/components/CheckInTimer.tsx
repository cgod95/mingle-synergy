
import React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckInTimerProps {
  timeRemaining: number;  // in seconds
  expiryTime: Date;
  className?: string;
}

const CheckInTimer: React.FC<CheckInTimerProps> = ({
  timeRemaining,
  expiryTime,
  className
}) => {
  // Format time remaining as HH:MM:SS
  const formatTimeRemaining = () => {
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;
    
    return hours > 0 
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      : `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Format expiry time as local time (eg. "Expires at 3:45 PM")
  const formatExpiryTime = () => {
    return `Expires at ${expiryTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  };

  return (
    <div className={cn("flex flex-col items-end gap-1", className)}>
      <div className="flex items-center space-x-2 bg-[#3A86FF]/10 px-3 py-2 rounded-lg">
        <Clock className="text-[#3A86FF]" size={18} />
        <span className="text-[#3A86FF] font-medium">
          {formatTimeRemaining()}
        </span>
      </div>
      <span className="text-xs text-muted-foreground">
        {formatExpiryTime()}
      </span>
    </div>
  );
};

export default CheckInTimer;
