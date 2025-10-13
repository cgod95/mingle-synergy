import { useEffect } from 'react';
import { trackError } from '../services/appAnalytics';
import logger from '@/utils/Logger';

export const usePerformance = (componentName: string): void => {
  useEffect(() => {
    // Skip in development mode if requested
    if (import.meta.env.MODE === 'development' && 
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
        
        // Try to observe, but don't crash if it fails
        try {
          observer.observe({ entryTypes: ['longtask'] });
        } catch (err) {
          logger.warn('Failed to observe longtask entries:', err);
        }
        
        return () => {
          try {
            observer.disconnect();
          } catch (err) {
            logger.warn('Failed to disconnect observer:', err);
          }
        };
      } catch (error) {
        logger.warn('PerformanceObserver error:', error);
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
