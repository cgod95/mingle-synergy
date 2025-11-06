
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
      ? `${hours}h ${minutes.toString().padStart(2, '0')}m`
      : `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Format expiry time as local time (eg. "Expires at 3:45 PM")
  const formatExpiryTime = () => {
    return `Expires at ${expiryTime.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })}`;
  };

  // Calculate remaining percentage for progress indicator
  const getExpiryPercentage = () => {
    // This is a simple example - would need actual check-in start time for accuracy
    // Assuming 3-hour expiry time (10800 seconds) for this example
    const totalDuration = 10800;
    return Math.min(100, Math.max(0, (timeRemaining / totalDuration) * 100));
  };

  return (
    <div className={cn("flex flex-col items-end gap-1", className)}>
      <div className="relative flex items-center space-x-2 bg-gradient-to-r from-[#EBF2FF] to-[#F9FAFB] px-4 py-2 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <Clock className="text-[#3A86FF]" size={18} />
        <span className="text-[#3A86FF] font-medium text-caption">
          {formatTimeRemaining()}
        </span>
        
        {/* Progress indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#EBF2FF] rounded-b-xl overflow-hidden">
          <div 
            className="h-full bg-[#3A86FF] rounded-b-xl transition-all duration-1000 ease-linear"
            style={{ width: `${getExpiryPercentage()}%` }}
          />
        </div>
      </div>
      <span className="text-[11px] text-[#6B7280]">
        {formatExpiryTime()}
      </span>
    </div>
  );
};

export default CheckInTimer;
