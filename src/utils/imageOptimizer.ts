
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
      rootMargin: '50px 0px', // Start loading 50px before the image enters viewport
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
  // For unsplash images
  if (url.includes('unsplash.com')) {
    const separator = url.includes('?') ? '&' : '?';
    const connectionType = (navigator as any).connection?.effectiveType || '4g';
    
    // Lower quality for slower connections
    const quality = connectionType === '3g' ? 60 : 
                    connectionType === '2g' ? 40 : 80;
                    
    return `${url}${separator}w=${width}&q=${quality}&auto=format`;
  }
  
  // For other sources, try to use native browser optimizations
  return url;
};

// New function for optimized image loading
export const optimizeImageLoading = () => {
  document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Use proper type assertion for HTMLImageElement
          const img = entry.target as HTMLImageElement;
          // Now TypeScript knows this is an HTMLImageElement with src property
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          img.onload = () => img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  });
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
    (navigator as any).connection.addEventListener('change', () => {
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
  optimizeImageLoading
};
