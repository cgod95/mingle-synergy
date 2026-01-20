/**
 * iOS-style Pull to Refresh Hook
 * Provides native-feel pull-to-refresh behavior
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { hapticMedium } from '@/lib/haptics';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number; // Pull distance to trigger refresh (default 80px)
}

export function usePullToRefresh({ onRefresh, threshold = 80 }: UsePullToRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isRefreshing) return;
    if (containerRef.current?.scrollTop !== 0) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    
    if (diff > 0) {
      // Apply resistance to pull (feels more native)
      const resistance = 0.5;
      setPullDistance(Math.min(diff * resistance, threshold * 1.5));
    }
  }, [isRefreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      hapticMedium();
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
    startY.current = 0;
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  return {
    containerRef,
    isRefreshing,
    pullDistance,
    pullProgress: Math.min(pullDistance / threshold, 1),
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}

/**
 * Pull to Refresh Indicator Component
 */
export function PullToRefreshIndicator({ 
  pullProgress, 
  isRefreshing 
}: { 
  pullProgress: number; 
  isRefreshing: boolean;
}) {
  if (pullProgress === 0 && !isRefreshing) return null;

  return (
    <div 
      className="flex justify-center items-center py-4 transition-opacity"
      style={{ 
        opacity: isRefreshing ? 1 : pullProgress,
        transform: `translateY(${isRefreshing ? 0 : (pullProgress - 1) * 40}px)`
      }}
    >
      <div 
        className={`w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full ${
          isRefreshing ? 'animate-spin' : ''
        }`}
        style={{
          transform: isRefreshing ? 'none' : `rotate(${pullProgress * 360}deg)`
        }}
      />
    </div>
  );
}
