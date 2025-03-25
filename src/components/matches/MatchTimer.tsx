
import React, { useState, useEffect } from 'react';

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
    
    // Calculate initial time remaining to sync with server
    const serverNow = Date.now(); // Ideally would be from server
    const initialDiff = expiresAt - serverNow;
    
    if (initialDiff <= 0) {
      setTimeRemaining('Expired');
      setIsExpired(true);
      onExpire?.();
      return;
    }
    
    // Update timer every 30 seconds
    const updateTimer = () => {
      const now = Date.now();
      const diff = expiresAt - now;
      
      if (diff <= 0) {
        setTimeRemaining('Expired');
        setIsExpired(true);
        onExpire?.();
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeRemaining(`${hours}h ${minutes}m`);
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
