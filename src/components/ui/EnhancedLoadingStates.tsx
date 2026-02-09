// Comprehensive loading states and skeleton loaders

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton as SkeletonUI } from '@/components/ui/skeleton';

// Skeleton component for loading placeholders
export const Skeleton: React.FC<{
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}> = ({ className, width, height, rounded = 'md' }) => {
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-neutral-200',
        roundedClasses[rounded],
        className
      )}
      style={{
        width: width,
        height: height
      }}
    />
  );
};

// User profile skeleton
export const UserProfileSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-4', className)}>
    <div className="flex items-center space-x-4">
      <Skeleton className="w-16 h-16" rounded="full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-2/3" />
    <div className="flex space-x-2">
      <Skeleton className="h-6 w-16" rounded="full" />
      <Skeleton className="h-6 w-20" rounded="full" />
      <Skeleton className="h-6 w-14" rounded="full" />
    </div>
  </div>
);

// Match card skeleton
export const MatchCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-neutral-800 rounded-lg p-4 shadow-sm', className)}>
    <div className="flex items-center space-x-3">
      <Skeleton className="w-12 h-12" rounded="full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="w-8 h-8" rounded="full" />
    </div>
    <div className="mt-3 space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
    <div className="mt-4 flex space-x-2">
      <Skeleton className="h-8 w-20" rounded="md" />
      <Skeleton className="h-8 w-24" rounded="md" />
    </div>
  </div>
);

// Venue card skeleton
export const VenueCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-neutral-800 rounded-lg overflow-hidden shadow-sm', className)}>
    <Skeleton className="w-full h-32" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex items-center space-x-2">
        <Skeleton className="w-4 h-4" rounded="full" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-6 w-16" rounded="full" />
        <Skeleton className="h-6 w-20" rounded="full" />
      </div>
    </div>
  </div>
);

// Message skeleton
export const MessageSkeleton: React.FC<{ isOwn?: boolean; className?: string }> = ({ 
  isOwn = false, 
  className 
}) => (
  <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start', className)}>
    <div className={cn(
      'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
      isOwn 
        ? 'bg-blue-500 text-white rounded-br-none' 
        : 'bg-gray-200 dark:bg-gray-700 rounded-bl-none'
    )}>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-24 mt-1" />
    </div>
  </div>
);

// Chat list skeleton
export const ChatListSkeleton: React.FC<{ count?: number; className?: string }> = ({ 
  count = 5, 
  className 
}) => (
  <div className={cn('space-y-3', className)}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
        <Skeleton className="w-12 h-12" rounded="full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="text-right space-y-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="w-5 h-5" rounded="full" />
        </div>
      </div>
    ))}
  </div>
);

// User grid skeleton
export const UserGridSkeleton: React.FC<{ 
  columns?: number; 
  rows?: number; 
  className?: string 
}> = ({ columns = 2, rows = 3, className }) => (
  <div className={cn('grid gap-4', className)} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
    {Array.from({ length: columns * rows }).map((_, i) => (
      <UserProfileSkeleton key={i} />
    ))}
  </div>
);

// Venue list skeleton
export const VenueListSkeleton: React.FC<{ count?: number; className?: string }> = ({ 
  count = 6, 
  className 
}) => (
  <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className)}>
    {Array.from({ length: count }).map((_, i) => (
      <VenueCardSkeleton key={i} />
    ))}
  </div>
);

// Page loading skeleton
export const PageSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-6', className)}>
    {/* Header */}
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
    </div>
    
    {/* Content */}
    <div className="space-y-4">
      <Skeleton className="h-64 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
    
    {/* Footer */}
    <div className="flex justify-center space-x-4">
      <Skeleton className="h-10 w-24" rounded="md" />
      <Skeleton className="h-10 w-24" rounded="md" />
    </div>
  </div>
);

// Table skeleton
export const TableSkeleton: React.FC<{ 
  rows?: number; 
  columns?: number; 
  className?: string 
}> = ({ rows = 5, columns = 4, className }) => (
  <div className={cn('overflow-hidden rounded-lg border', className)}>
    {/* Header */}
    <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 border-b">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-20" />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    <div className="divide-y">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Form skeleton
export const FormSkeleton: React.FC<{ fields?: number; className?: string }> = ({ 
  fields = 4, 
  className 
}) => (
  <div className={cn('space-y-6', className)}>
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" rounded="md" />
      </div>
    ))}
    <div className="flex space-x-4 pt-4">
      <Skeleton className="h-10 w-24" rounded="md" />
      <Skeleton className="h-10 w-24" rounded="md" />
    </div>
  </div>
);

// Loading spinner
export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}> = ({ size = 'md', color = 'primary', className }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-600'
  };

  return (
    <div className={cn('animate-spin', sizeClasses[size], colorClasses[color], className)}>
      <svg fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = "Loading...",
  children,
  className
}) => {
  if (!isLoading) return <>{children}</>;

  return (
    <div className={cn("relative", className)}>
      {children}
      <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
      </div>
    </div>
  );
};

// Loading button
export const LoadingButton: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}> = ({ 
  isLoading, 
  children, 
  loadingText = 'Loading...', 
  disabled = false,
  className,
  onClick 
}) => (
  <button
    className={cn(
      'inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm',
      'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      className
    )}
    disabled={isLoading || disabled}
    onClick={onClick}
  >
    {isLoading && <LoadingSpinner size="sm" color="white" className="mr-2" />}
    {isLoading ? loadingText : children}
  </button>
);

// Progress bar
export const ProgressBar: React.FC<{
  progress: number; // 0-100
  className?: string;
  showLabel?: boolean;
}> = ({ progress, className, showLabel = false }) => (
  <div className={cn('w-full', className)}>
    {showLabel && (
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
        <span>Progress</span>
        <span>{Math.round(progress)}%</span>
      </div>
    )}
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  </div>
);

// Pulse loading
export const PulseLoading: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex space-x-1', className)}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
        style={{ animationDelay: `${i * 0.2}s` }}
      />
    ))}
  </div>
);

// Shimmer effect
export const Shimmer: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('relative overflow-hidden', className)}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  </div>
);

interface SkeletonCardProps {
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className }) => {
  return (
    <Card className={cn("p-4", className)}>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <SkeletonUI className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <SkeletonUI className="h-4 w-3/4" />
            <SkeletonUI className="h-3 w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          <SkeletonUI className="h-3 w-full" />
          <SkeletonUI className="h-3 w-2/3" />
        </div>
        <div className="flex justify-between">
          <SkeletonUI className="h-8 w-20" />
          <SkeletonUI className="h-8 w-24" />
        </div>
      </CardContent>
    </Card>
  );
};

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  refreshing: boolean;
  children: React.ReactNode;
  threshold?: number;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  refreshing,
  children,
  threshold = 80
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);

  const handleTouchStart = (e: TouchEvent) => {
    if (refreshing) return;
    
    const touch = e.touches[0];
    startY.current = touch.clientY;
    currentY.current = touch.clientY;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (refreshing) return;
    
    const touch = e.touches[0];
    currentY.current = touch.clientY;
    
    const scrollTop = containerRef.current?.scrollTop || 0;
    
    // Only allow pull to refresh when at the top
    if (scrollTop <= 0) {
      const pullDistance = Math.max(0, currentY.current - startY.current);
      setPullDistance(pullDistance);
      setIsPulling(pullDistance > 0);
      
      if (pullDistance > 0) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (refreshing || !isPulling) return;
    
    if (pullDistance >= threshold) {
      await onRefresh();
    }
    
    setPullDistance(0);
    setIsPulling(false);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [refreshing, pullDistance, threshold]);

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Pull indicator */}
      {isPulling && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center bg-gray-50 transition-transform duration-200"
          style={{ 
            transform: `translateY(${Math.min(pullDistance, threshold)}px)`,
            height: `${threshold}px`
          }}
        >
          <div className="text-center space-y-2">
            <div className={cn(
              "animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto",
              pullDistance >= threshold && "animate-spin"
            )}></div>
            <p className="text-sm text-gray-600">
              {pullDistance >= threshold ? "Release to refresh" : "Pull to refresh"}
            </p>
          </div>
        </div>
      )}
      
      {/* Content */}
      <div 
        className="transition-transform duration-200"
        style={{ 
          transform: `translateY(${isPulling ? Math.min(pullDistance, threshold) : 0}px)`
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default Skeleton; 