
import React, { useState, useEffect } from 'react';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      
      // Show banner briefly then hide it
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  if (!showBanner) return null;
  
  return (
    <div className={`fixed bottom-0 inset-x-0 p-4 text-white text-center z-50 transition-transform duration-300 ${isOnline ? 'bg-green-500 translate-y-0 animate-fade-out' : 'bg-red-500'}`}>
      <p className="font-medium">
        {isOnline 
          ? "You're back online." 
          : "You're offline. Some features may not work properly."}
      </p>
    </div>
  );
};

export default NetworkStatus;
