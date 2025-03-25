import React, { useState, useEffect } from 'react';

const NetworkStatusBanner: React.FC = () => {
  // Keep track of online status with a simple boolean
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  
  // Simple effect with basic browser events
  useEffect(() => {
    // Basic event handlers
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    // Add standard browser events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Clean up
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Only render when offline
  if (isOnline) return null;
  
  // Simple JSX
  return (
    <div className="fixed bottom-0 inset-x-0 p-4 bg-red-500 text-white text-center z-50">
      <p className="font-medium">You&apos;re offline. Some features may not work properly.</p>
    </div>
  );
};

export default NetworkStatusBanner;
