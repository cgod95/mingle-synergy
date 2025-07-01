import { memo, ComponentType } from 'react';

// Helper to memoize components with proper displayName
export function memoWithName<T extends ComponentType<unknown>>(
  component: T,
  propsAreEqual?: (prevProps: React.ComponentProps<T>, nextProps: React.ComponentProps<T>) => boolean
): typeof component {
  // Use type assertion to handle the complex typing
  const memoized = memo(component, propsAreEqual) as unknown as T;
  
  // Preserve the original display name
  const displayName = component.displayName || component.name || 'Component';
  memoized.displayName = `Memo(${displayName})`;
  
  return memoized;
}

// Simple hook to measure component render time
export function useRenderTiming(componentName: string) {
  if (process.env.NODE_ENV !== 'development') {
    return () => {};
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
