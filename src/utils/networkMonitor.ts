
/**
 * Network monitoring utility
 * Handles network status events without UI manipulation
 */

export type NetworkStatus = 'online' | 'offline';

// Custom event for network status changes with type safety
export interface NetworkStatusEvent extends CustomEvent {
  detail: {
    status: NetworkStatus;
  };
}

// Event name constant
export const NETWORK_STATUS_EVENT = 'app:networkStatusChange';

// Network monitoring utility that dispatches events only - no UI
export function setupNetworkMonitoring(): () => void {
  // Handler for network changes
  const handleNetworkChange = (): void => {
    const status: NetworkStatus = navigator.onLine ? 'online' : 'offline';
    
    // Dispatch custom event with status
    document.dispatchEvent(new CustomEvent(NETWORK_STATUS_EVENT, { 
      detail: { status }
    }));
  };
  
  // Add event listeners
  window.addEventListener('online', handleNetworkChange);
  window.addEventListener('offline', handleNetworkChange);
  
  // Initial status check
  handleNetworkChange();
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleNetworkChange);
    window.removeEventListener('offline', handleNetworkChange);
  };
}

// Helper to check current status
export function isOnline(): boolean {
  return navigator.onLine;
}
