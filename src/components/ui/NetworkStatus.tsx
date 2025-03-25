
import React, { useState, useEffect } from 'react';
import { NetworkStatus, NetworkStatusEvent, NETWORK_STATUS_EVENT } from '../../utils/networkMonitor';

const NetworkStatusBanner: React.FC = () => {
  const [status, setStatus] = useState<NetworkStatus>(
    navigator.onLine ? 'online' : 'offline'
  );
  const [showBanner, setShowBanner] = useState<boolean>(!navigator.onLine);
  
  useEffect(() => {
    // Handle network status events
    const handleNetworkEvent = (event: Event): void => {
      const customEvent = event as NetworkStatusEvent;
      setStatus(customEvent.detail.status);
      
      if (customEvent.detail.status === 'offline') {
        setShowBanner(true);
      } else {
        // When coming back online, show briefly then hide
        setShowBanner(true);
        const timer = setTimeout(() => setShowBanner(false), 3000);
        return () => clearTimeout(timer);
      }
    };
    
    // Add event listener
    document.addEventListener(NETWORK_STATUS_EVENT, handleNetworkEvent);
    
    // Cleanup on unmount
    return () => {
      document.removeEventListener(NETWORK_STATUS_EVENT, handleNetworkEvent);
    };
  }, []);
  
  // Don't render if banner shouldn't be shown
  if (!showBanner) return null;
  
  return (
    <div className={`fixed bottom-0 inset-x-0 p-4 text-white text-center z-50 ${
      status === 'online' ? 'bg-green-500' : 'bg-red-500'
    }`}>
      <p className="font-medium">
        {status === 'online' 
          ? "You're back online." 
          : "You're offline. Some features may not work properly."}
      </p>
    </div>
  );
};

export default NetworkStatusBanner;
