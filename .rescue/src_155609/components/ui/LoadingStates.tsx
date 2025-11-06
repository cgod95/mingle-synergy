import React from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from './skeleton';
import { Card, CardContent, CardHeader } from './card';
import { cn } from '@/lib/utils';

// Skeleton animation
const SkeletonPulse: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ 
  className = '', 
  style 
}) => (
  <motion.div
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 1.5, repeat: Infinity }}
    className={`bg-gray-200 rounded ${className}`}
    style={style}
  />
);

// User card skeleton
export const UserCardSkeleton: React.FC = () => (
  <Card className="overflow-hidden">
    <CardContent className="p-4">
      <div className="flex items-start space-x-3">
        <SkeletonPulse className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonPulse className="h-4 w-3/4" />
          <SkeletonPulse className="h-3 w-1/2" />
          <SkeletonPulse className="h-3 w-2/3" />
          <div className="flex space-x-2">
            <SkeletonPulse className="h-6 w-16 rounded-full" />
            <SkeletonPulse className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Venue card skeleton
export const VenueCardSkeleton: React.FC<{ index?: number }> = ({ index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
    className="w-full"
  >
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <SkeletonPulse className="h-5 w-32" />
              <SkeletonPulse className="h-4 w-8" />
            </div>
            <SkeletonPulse className="h-3 w-40" />
            <div className="flex space-x-4">
              <SkeletonPulse className="h-3 w-16" />
              <SkeletonPulse className="h-3 w-20" />
            </div>
          </div>
          <SkeletonPulse className="h-5 w-16" />
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <SkeletonPulse className="h-3 w-full" />
        <SkeletonPulse className="h-3 w-3/4" />
        <div className="flex space-x-2">
          <SkeletonPulse className="h-9 flex-1" />
          <SkeletonPulse className="h-9 flex-1" />
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Match card skeleton
export const MatchCardSkeleton: React.FC<{ index?: number }> = ({ index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
    className="w-full"
  >
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <SkeletonPulse className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonPulse className="h-4 w-24" />
            <SkeletonPulse className="h-3 w-32" />
          </div>
          <div className="flex flex-col items-end space-y-2">
            <SkeletonPulse className="h-4 w-16" />
            <SkeletonPulse className="h-3 w-20" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <SkeletonPulse className="h-3 w-full" />
        <div className="flex space-x-1">
          <SkeletonPulse className="h-5 w-16" />
          <SkeletonPulse className="h-5 w-20" />
          <SkeletonPulse className="h-5 w-14" />
        </div>
        <div className="flex space-x-2">
          <SkeletonPulse className="h-9 flex-1" />
          <SkeletonPulse className="h-9 flex-1" />
        </div>
      </CardContent>
    </Card>
  </motion.div>
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

// User grid skeleton
export const UserGridSkeleton: React.FC<{ 
  columns?: number; 
  rows?: number; 
  className?: string 
}> = ({ columns = 2, rows = 3, className }) => (
  <div className={cn('grid gap-4', className)} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
    {Array.from({ length: columns * rows }).map((_, i) => (
      <UserCardSkeleton key={i} />
    ))}
  </div>
);

// Match list skeleton
export const MatchListSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4].map((i) => (
      <MatchCardSkeleton key={i} index={i} />
    ))}
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
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="text-right space-y-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="w-5 h-5 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

// Profile skeleton
export const ProfileSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="text-center space-y-4">
      <SkeletonPulse className="w-24 h-24 rounded-full mx-auto" />
      <div className="space-y-2">
        <SkeletonPulse className="h-6 w-48 mx-auto" />
        <SkeletonPulse className="h-4 w-32 mx-auto" />
      </div>
    </div>
    <div className="space-y-4">
      <SkeletonPulse className="h-4 w-full" />
      <SkeletonPulse className="h-4 w-3/4" />
      <SkeletonPulse className="h-4 w-5/6" />
    </div>
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonPulse key={i} className="h-6 w-20 rounded-full" />
      ))}
    </div>
  </div>
);

// Settings skeleton
export const SettingsSkeleton: React.FC = () => (
  <div className="space-y-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
        <div className="space-y-2">
          <SkeletonPulse className="h-4 w-32" />
          <SkeletonPulse className="h-3 w-48" />
        </div>
        <SkeletonPulse className="h-6 w-12 rounded-full" />
      </div>
    ))}
  </div>
);

// Progressive loading wrapper
export const ProgressiveLoader: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  skeleton: React.ReactNode;
  delay?: number;
}> = ({ isLoading, children, skeleton, delay = 300 }) => {
  const [showSkeleton, setShowSkeleton] = React.useState(true);

  React.useEffect(() => {
    if (isLoading) {
      setShowSkeleton(true);
    } else {
      const timer = setTimeout(() => setShowSkeleton(false), delay);
      return () => clearTimeout(timer);
    }
  }, [isLoading, delay]);

  if (isLoading || showSkeleton) {
    return <>{skeleton}</>;
  }

  return <>{children}</>;
};

// Infinite scroll loading
export const InfiniteScrollLoader: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="flex justify-center items-center py-8">
      <div className="flex items-center space-x-2">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full"
        />
        <span className="text-gray-500 text-sm">Loading more...</span>
      </div>
    </div>
  );
};

// Full page loading
export const FullPageLoader: React.FC<{ message?: string }> = ({ 
  message = "Loading..." 
}) => (
  <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
    <div className="text-center space-y-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full mx-auto"
      />
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

// Button loading state
export const LoadingButton: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}> = ({ 
  isLoading, 
  children, 
  loadingText = "Loading...", 
  className = "",
  onClick,
  disabled = false
}) => (
  <button
    onClick={onClick}
    disabled={isLoading || disabled}
    className={`relative ${className}`}
  >
    {isLoading && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
        />
      </motion.div>
    )}
    <span className={isLoading ? 'opacity-0' : ''}>
      {isLoading ? loadingText : children}
    </span>
  </button>
);

// Image loading skeleton
export const ImageSkeleton: React.FC<{
  width: number;
  height: number;
  className?: string;
}> = ({ width, height, className = '' }) => (
  <SkeletonPulse 
    className={`${className}`}
    style={{ width: `${width}px`, height: `${height}px` }}
  />
);

// Content loading skeleton
export const ContentSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonPulse 
        key={i} 
        className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} 
      />
    ))}
  </div>
);

// Skeleton for ChatPreview
export const ChatPreviewSkeleton: React.FC<{ index?: number }> = ({ index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    className="w-full"
  >
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <SkeletonPulse className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <SkeletonPulse className="h-4 w-20" />
              <SkeletonPulse className="h-3 w-16" />
            </div>
            <SkeletonPulse className="h-3 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// User profile skeleton
export const UserProfileSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-4', className)}>
    <div className="flex items-center space-x-4">
      <Skeleton className="w-16 h-16 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-2/3" />
    <div className="flex space-x-2">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-6 w-14 rounded-full" />
    </div>
  </div>
);

// Skeleton for MessageList
export const MessageListSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, x: i % 2 === 0 ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: i * 0.1 }}
        className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
      >
        <div className={`max-w-xs ${i % 2 === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3`}>
          <SkeletonPulse className={`h-4 w-32 ${i % 2 === 0 ? 'bg-primary-foreground/20' : ''}`} />
          <SkeletonPulse className={`h-3 w-24 mt-2 ${i % 2 === 0 ? 'bg-primary-foreground/20' : ''}`} />
        </div>
      </motion.div>
    ))}
  </div>
);

// Loading spinner with text
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

// Pulse loading animation
export const PulseLoader: React.FC = () => (
  <div className="flex space-x-1">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="w-2 h-2 bg-primary rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: i * 0.2
        }}
      />
    ))}
  </div>
);

// Loading overlay
export const LoadingOverlay: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
  className?: string;
}> = ({ isLoading, children, message = 'Loading...', className }) => (
  <div className={cn('relative', className)}>
    {children}
    {isLoading && (
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-50">
        <div className="text-center space-y-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
        </div>
      </div>
    )}
  </div>
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

export default Skeleton; 