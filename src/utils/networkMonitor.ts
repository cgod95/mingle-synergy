
/**
 * Simple network status monitoring utility
 * No React, no JSX, just plain TypeScript
 */

// Function to set up network monitoring
export function setupNetworkMonitoring(): void {
  // Reference to any banner we create
  let offlineBanner: HTMLDivElement | null = null;
  
  // Handler for when connection status changes
  function handleNetworkChange(): void {
    const isOnline = navigator.onLine;
    
    if (!isOnline) {
      // We're offline - show banner if not already shown
      if (!offlineBanner) {
        offlineBanner = document.createElement('div');
        offlineBanner.style.position = 'fixed';
        offlineBanner.style.bottom = '0';
        offlineBanner.style.left = '0';
        offlineBanner.style.right = '0';
        offlineBanner.style.backgroundColor = '#EF4444'; // red-500
        offlineBanner.style.color = 'white';
        offlineBanner.style.padding = '1rem';
        offlineBanner.style.textAlign = 'center';
        offlineBanner.style.zIndex = '50';
        offlineBanner.textContent = 'You are offline. Some features may not work properly.';
        document.body.appendChild(offlineBanner);
      }
      
      // Notify application about connection change
      document.dispatchEvent(new CustomEvent('app:offline'));
    } else {
      // We're online - remove banner if it exists
      if (offlineBanner && offlineBanner.parentNode) {
        offlineBanner.parentNode.removeChild(offlineBanner);
        offlineBanner = null;
      }
      
      // Notify application about connection change
      document.dispatchEvent(new CustomEvent('app:online'));
    }
  }
  
  // Add event listeners
  window.addEventListener('online', handleNetworkChange);
  window.addEventListener('offline', handleNetworkChange);
  
  // Initial check
  handleNetworkChange();
}

// Export a function to manually check network status
export function isOnline(): boolean {
  return navigator.onLine;
}
