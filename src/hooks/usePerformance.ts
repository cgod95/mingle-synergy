
import { useEffect } from 'react';
import { trackError } from '../services/appAnalytics';

export const usePerformance = (componentName: string): void => {
  useEffect(() => {
    // Skip in development mode if requested
    if (process.env.NODE_ENV === 'development' && 
        localStorage.getItem('disable_performance_tracking') === 'true') {
      return;
    }
    
    const startTime = performance.now();
    
    // Register performance observer to detect long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // Report long tasks (>50ms) to analytics
            if (entry.duration > 50) {
              trackError(
                'long_task', 
                `Long task detected in ${componentName}`, 
                { duration: entry.duration }
              );
            }
          }
        });
        
        observer.observe({ entryTypes: ['longtask'] });
        
        return () => observer.disconnect();
      } catch (error) {
        console.warn('PerformanceObserver error:', error);
      }
    }
    
    return () => {
      // Report component mount duration if unusually long
      const duration = performance.now() - startTime;
      if (duration > 300) {
        trackError(
          'slow_component', 
          `Slow component mount: ${componentName}`, 
          { duration }
        );
      }
    };
  }, [componentName]);
};

export default usePerformance;
