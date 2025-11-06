import { useEffect, useState } from 'react';
import { isMatchExpired, getMatchTimeRemaining, formatTimeRemaining } from '@/utils/matchUtils';

export const useMatchExpiration = (createdAt: Date) => {
  const [expired, setExpired] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    const check = () => {
      const isExpired = isMatchExpired(createdAt);
      setExpired(isExpired);
      
      if (!isExpired) {
        const remaining = getMatchTimeRemaining(createdAt);
        setTimeRemaining(formatTimeRemaining(remaining));
      } else {
        setTimeRemaining('');
      }
    };
    
    const interval = setInterval(check, 60000); // Check every minute
    check(); // Initial check
    
    return () => clearInterval(interval);
  }, [createdAt]);

  return { expired, timeRemaining };
}; 