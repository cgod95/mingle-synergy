
import React from 'react';
import { useToast } from '@/components/ui/use-toast';

/**
 * Network monitoring utilities to handle offline/online states
 * and improve user experience during network issues
 */

// Initialize network monitoring
export const setupNetworkMonitoring = () => {
  // Handle offline/online status
  const updateNetworkStatus = () => {
    const isOnline = navigator.onLine;
    
    if (!isOnline) {
      // Show offline banner
      const existingBanner = document.getElementById('offline-banner');
      if (!existingBanner) {
        const offlineBanner = document.createElement('div');
        offlineBanner.id = 'offline-banner';
        offlineBanner.className = 'fixed bottom-0 left-0 right-0 bg-red-500 text-white p-3 text-center z-50';
        offlineBanner.textContent = 'You are offline. Some features may not work properly.';
        document.body.appendChild(offlineBanner);
      }
      
      // Store unsaved changes in localStorage
      document.dispatchEvent(new CustomEvent('app:offline'));
    } else {
      // Remove offline banner if it exists
      const banner = document.getElementById('offline-banner');
      if (banner) {
        banner.remove();
      }
      
      // Try to sync any pending data
      document.dispatchEvent(new CustomEvent('app:online'));
    }
  };
  
  // Set up event listeners
  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);
  
  // Initial check
  updateNetworkStatus();
  
  // Set up fetch interceptor for network errors
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);
      return response;
    } catch (error) {
      // Handle network errors
      console.error('Network error during fetch:', error);
      document.dispatchEvent(new CustomEvent('app:networkError', { 
        detail: { url: args[0], error } 
      }));
      throw error;
    }
  };
};

// React hook for network status
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const { toast } = useToast();
  
  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "You're back online",
        description: "Your connection has been restored.",
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're offline",
        description: "Check your connection. Some features may not work properly.",
        variant: "destructive",
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);
  
  return isOnline;
};

// Simple React component for network status
export const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  if (isOnline) return null;
  
  return (
    <div className="fixed bottom-0 inset-x-0 p-4 bg-red-500 text-white text-center z-50">
      <p className="font-medium">You&apos;re offline. Some features may not work properly.</p>
    </div>
  );
};

export default {
  setupNetworkMonitoring,
  useNetworkStatus,
  NetworkStatus
};
