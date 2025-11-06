
import React, { useState, useEffect } from 'react';
import services from '../../services';

interface MatchTimerProps {
  expiresAt: number;
  onExpire?: () => void;
}

const MatchTimer: React.FC<MatchTimerProps> = ({ expiresAt, onExpire }) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isExpired, setIsExpired] = useState<boolean>(false);
  
  useEffect(() => {
    // Verify the expiresAt timestamp is valid
    if (!expiresAt || typeof expiresAt !== 'number') {
      setTimeRemaining('Unknown');
      return;
    }
    
    // Calculate initial time remaining using our service utility function
    const updateTimer = () => {
      const remaining = services.match.getTimeRemaining(expiresAt);
      setTimeRemaining(remaining);
      
      if (remaining === 'Expired') {
        setIsExpired(true);
        onExpire?.();
        return;
      }
    };
    
    // Initial update
    updateTimer();
    
    // Set up interval for updates
    const interval = setInterval(updateTimer, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);
  
  return (
    <span className={`font-medium ${isExpired ? 'text-red-500' : 'text-brand-primary'}`}>
      {timeRemaining}
    </span>
  );
};

export default MatchTimer;
