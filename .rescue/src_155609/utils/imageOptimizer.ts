/**
 * Image optimization utilities for improving loading performance
 * especially on weak network connections
 */

// Set up lazy loading for images with data-src attribute
export const setupLazyLoading = () => {
  // Check if IntersectionObserver is available
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const dataSrc = img.getAttribute('data-src');
          
          if (dataSrc) {
            img.src = dataSrc;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '100px 0px', // Start loading 100px before the image enters viewport (increased from 50px)
      threshold: 0.01
    });
    
    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
    
    return imageObserver;
  }
  
  // Fallback for browsers that don't support IntersectionObserver
  const loadImagesImmediately = () => {
    document.querySelectorAll('img[data-src]').forEach(img => {
      const dataSrc = (img as HTMLImageElement).getAttribute('data-src');
      if (dataSrc) {
        (img as HTMLImageElement).src = dataSrc;
        img.removeAttribute('data-src');
      }
    });
  };
  
  loadImagesImmediately();
  return null;
};

// Optimize image URL based on network conditions
export const getOptimizedImageUrl = (url: string, width: number = 400): string => {
  // If URL is empty or invalid, return a placeholder
  if (!url || url.trim() === '') {
    return '/placeholder.svg';
  }

  // For unsplash images
  if (url.includes('unsplash.com')) {
    const separator = url.includes('?') ? '&' : '?';
    
    // Get connection type or default to 4g
    let connectionType = '4g';
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      connectionType = (navigator as unknown as { connection?: { effectiveType?: string } }).connection?.effectiveType || '4g';
    }
    
    // Lower quality for slower connections
    const quality = connectionType === '3g' ? 60 : 
                    connectionType === '2g' ? 40 : 80;
                    
    return `${url}${separator}w=${width}&q=${quality}&auto=format`;
  }
  
  // Handle other image hosts if needed
  
  // For other sources, return the original URL
  return url;
};

// Reset image loading for new components
export const resetImageLoading = () => {
  const observer = setupLazyLoading();
  return () => {
    if (observer) {
      observer.disconnect();
    }
  };
};

// Initialize image optimization
export const initImageOptimization = () => {
  // Set up lazy loading on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setupLazyLoading());
  } else {
    setupLazyLoading();
  }
  
  // Re-check images when network changes
  if ('connection' in navigator) {
    (navigator as unknown as { connection?: { addEventListener?: (type: string, listener: () => void) => void } }).connection?.addEventListener?.('change', () => {
      // Reload visible images with optimized quality
      document.querySelectorAll('img.loaded').forEach(img => {
        const originalSrc = (img as HTMLImageElement).getAttribute('data-original-src');
        if (originalSrc) {
          (img as HTMLImageElement).src = getOptimizedImageUrl(originalSrc);
        }
      });
    });
  }
};

export default {
  setupLazyLoading,
  getOptimizedImageUrl,
  initImageOptimization,
  resetImageLoading
};
