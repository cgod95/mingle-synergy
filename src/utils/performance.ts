
import { memo } from 'react';

// Helper to memoize components with proper displayName
export function memoWithName<T extends React.ComponentType<any>>(
  component: T,
  propsAreEqual?: (prevProps: React.ComponentProps<T>, nextProps: React.ComponentProps<T>) => boolean
): T {
  const memoized = memo(component, propsAreEqual);
  memoized.displayName = `Memo(${component.displayName || component.name || 'Component'})`;
  return memoized as T;
}

// Simple hook to measure component render time
export function useRenderTiming(componentName: string) {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    if (renderTime > 50) {
      console.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms to render`);
    }
  };
}

// Export the usePerformance hook that was already defined in the project
export { usePerformance } from '@/hooks/usePerformance';
