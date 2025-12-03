
import { useEffect } from 'react';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>;
  pullDistance?: number;
  containerSelector?: string;
}

export const usePullToRefresh = ({ 
  onRefresh, 
  pullDistance = 100,
  containerSelector = '#app-container' 
}: PullToRefreshOptions) => {
  useEffect(() => {
    let startY = 0;
    let pullStarted = false;
    const container = document.querySelector(containerSelector);
    
    if (!container) return;
    
    const handleTouchStart = (e: TouchEvent) => {
      // Only allow pull to refresh at the top of the page
      if (window.scrollY > 5) return;
      
      startY = e.touches[0].clientY;
      pullStarted = true;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!pullStarted) return;
      
      const currentY = e.touches[0].clientY;
      const pullLength = currentY - startY;
      
      if (pullLength > 10) {
        // Prevent default scrolling behavior
        e.preventDefault();
      }
      
      if (pullLength > pullDistance) {
        showRefreshIndicator();
      }
    };
    
    const handleTouchEnd = async (e: TouchEvent) => {
      if (!pullStarted) return;
      
      const currentY = e.changedTouches[0].clientY;
      const pullLength = currentY - startY;
      
      if (pullLength > pullDistance) {
        try {
          showRefreshingIndicator();
          await onRefresh();
        } catch (error) {
          console.error('Refresh failed:', error);
        } finally {
          hideRefreshIndicator();
        }
      }
      
      pullStarted = false;
    };
    
    // Add refresh indicator element
    const indicatorEl = document.createElement('div');
    indicatorEl.id = 'pull-to-refresh-indicator';
    indicatorEl.style.position = 'fixed';
    indicatorEl.style.top = '0';
    indicatorEl.style.left = '0';
    indicatorEl.style.right = '0';
    indicatorEl.style.height = '0';
    indicatorEl.style.backgroundColor = '#F0957D';
    indicatorEl.style.zIndex = '9999';
    indicatorEl.style.transition = 'height 0.2s ease-out';
    indicatorEl.style.textAlign = 'center';
    indicatorEl.style.color = 'white';
    indicatorEl.style.overflow = 'hidden';
    indicatorEl.style.display = 'flex';
    indicatorEl.style.alignItems = 'center';
    indicatorEl.style.justifyContent = 'center';
    document.body.appendChild(indicatorEl);
    
    function showRefreshIndicator() {
      indicatorEl.style.height = '60px';
      indicatorEl.innerHTML = '<div>Release to refresh</div>';
    }
    
    function showRefreshingIndicator() {
      indicatorEl.innerHTML = '<div>Refreshing...</div>';
    }
    
    function hideRefreshIndicator() {
      indicatorEl.style.height = '0';
    }
    
    container.addEventListener('touchstart', handleTouchStart as EventListener);
    container.addEventListener('touchmove', handleTouchMove as EventListener, { passive: false });
    container.addEventListener('touchend', handleTouchEnd as unknown as EventListener);
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStart as EventListener);
      container.removeEventListener('touchmove', handleTouchMove as EventListener);
      container.removeEventListener('touchend', handleTouchEnd as unknown as EventListener);
      
      if (document.body.contains(indicatorEl)) {
        document.body.removeChild(indicatorEl);
      }
    };
  }, [onRefresh, pullDistance, containerSelector]);
};

export default usePullToRefresh;
