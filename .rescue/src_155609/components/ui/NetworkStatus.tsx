import React, { useState, useEffect } from 'react';
import { NETWORK_STATUS_EVENT, NetworkStatusEvent, NetworkStatus as StatusType } from '@/utils/networkMonitor.ts';
import { AlertTriangle, WifiOff } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import usePerformance from '@/hooks/usePerformance';

const NetworkStatus: React.FC = () => {
  // Track component performance
  usePerformance('NetworkStatus');
  
  // Keep track of online status with a simple boolean
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  
  // Listen for both network events from the browser and our custom events
  useEffect(() => {
    // Basic event handlers
    const handleOnline = () => {
      setIsOnline(true);
      // Show the banner briefly when connection is restored
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };
    
    // Custom event handler for our network monitor
    const handleNetworkEvent = (event: Event) => {
      const customEvent = event as NetworkStatusEvent;
      setIsOnline(customEvent.detail.status === 'online');
      setShowBanner(customEvent.detail.status === 'offline');
    };
    
    // Add standard browser events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Add our custom event
    document.addEventListener(NETWORK_STATUS_EVENT, handleNetworkEvent);
    
    // Clean up
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener(NETWORK_STATUS_EVENT, handleNetworkEvent);
    };
  }, []);
  
  // Show offline warning banner when offline
  if (!isOnline) {
    return (
      <div className="fixed bottom-0 inset-x-0 p-4 bg-red-600 text-white text-center z-50 shadow-lg">
        <div className="flex items-center justify-center space-x-2">
          <WifiOff size={20} />
          <p className="font-medium">You're offline. Some features may not work properly.</p>
        </div>
      </div>
    );
  }
  
  // Show temporary "back online" notification
  if (isOnline && showBanner) {
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top duration-300">
        <Alert variant="default" className="bg-green-600 text-white border-none">
          <AlertTitle className="flex items-center space-x-2">
            <span>Connected</span>
          </AlertTitle>
          <AlertDescription>
            You're back online.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // No UI when online and banner not showing
  return null;
};

export default NetworkStatus;
