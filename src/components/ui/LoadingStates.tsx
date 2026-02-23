import React from 'react';
import { Skeleton } from './skeleton';
import { Card, CardContent, CardHeader } from './card';
import { LoadingSpinner } from './LoadingSpinner';

const SkeletonPulse: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ 
  className = '', 
  style 
}) => (
  <div
    className={`bg-neutral-800 rounded skeleton-shimmer ${className}`}
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
  <div
    className="w-full opacity-0 animate-fade-in"
    style={{ animationDelay: `${index * 100}ms` }}
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
  </div>
);

// Match card skeleton
export const MatchCardSkeleton: React.FC<{ index?: number }> = ({ index = 0 }) => (
  <div
    className="w-full opacity-0 animate-fade-in"
    style={{ animationDelay: `${index * 100}ms` }}
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
  </div>
);

// Message skeleton
export const MessageSkeleton: React.FC = () => (
  <div className="flex items-start space-x-3 mb-4">
    <SkeletonPulse className="w-8 h-8 rounded-full" />
    <div className="flex-1 space-y-2">
      <SkeletonPulse className="h-4 w-20" />
      <div className="space-y-1">
        <SkeletonPulse className="h-3 w-3/4" />
        <SkeletonPulse className="h-3 w-1/2" />
      </div>
    </div>
  </div>
);

// Venue list skeleton
export const VenueListSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4].map((i) => (
      <VenueCardSkeleton key={i} index={i} />
    ))}
  </div>
);

// User grid skeleton
export const UserGridSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: 9 }).map((_, i) => (
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
export const ChatListSkeleton: React.FC = () => (
  <div className="space-y-2">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <ChatPreviewSkeleton key={i} index={i} />
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
      return undefined;
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
        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-neutral-500 text-sm">Loading more...</span>
      </div>
    </div>
  );
};

// Full page loading
export const FullPageLoader: React.FC<{ message?: string }> = ({ 
  message = "Loading..." 
}) => (
  <div className="fixed inset-0 bg-neutral-900/95 flex items-center justify-center z-50">
    <div className="text-center space-y-4">
      <div className="w-12 h-12 border-4 border-neutral-700 border-t-indigo-500 rounded-full mx-auto animate-spin" />
      <p className="text-neutral-400">{message}</p>
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
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
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
  <div
    className="w-full opacity-0 animate-fade-in"
    style={{ animationDelay: `${index * 50}ms` }}
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
  </div>
);

// Skeleton for UserProfile
export const UserProfileSkeleton: React.FC = () => (
  <div className="space-y-6 opacity-0 animate-fade-in">
    <div className="text-center space-y-4">
      <SkeletonPulse className="h-24 w-24 rounded-full mx-auto" />
      <div className="space-y-2">
        <SkeletonPulse className="h-6 w-32 mx-auto" />
        <SkeletonPulse className="h-4 w-24 mx-auto" />
      </div>
    </div>
    
    <div className="space-y-4">
      <SkeletonPulse className="h-4 w-full" />
      <SkeletonPulse className="h-4 w-3/4" />
      <SkeletonPulse className="h-4 w-5/6" />
    </div>
    
    <div className="space-y-3">
      <SkeletonPulse className="h-5 w-20" />
      <div className="flex flex-wrap gap-2">
        <SkeletonPulse className="h-6 w-16" />
        <SkeletonPulse className="h-6 w-20" />
        <SkeletonPulse className="h-6 w-14" />
        <SkeletonPulse className="h-6 w-18" />
      </div>
    </div>
  </div>
);

// Skeleton for MessageList
export const MessageListSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div
        key={i}
        className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'} opacity-0 animate-fade-in`}
        style={{ animationDelay: `${i * 100}ms` }}
      >
        <div className={`max-w-xs ${i % 2 === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3`}>
          <SkeletonPulse className={`h-4 w-32 ${i % 2 === 0 ? 'bg-primary-foreground/20' : ''}`} />
          <SkeletonPulse className={`h-3 w-24 mt-2 ${i % 2 === 0 ? 'bg-primary-foreground/20' : ''}`} />
        </div>
      </div>
    ))}
  </div>
);

// Loading spinner with text - re-export from standardized component
export { LoadingSpinner } from './LoadingSpinner';

// Pulse loading animation - CSS-based for performance
export const PulseLoader: React.FC = () => (
  <div className="flex space-x-1">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"
        style={{
          animationDelay: `${i * 0.2}s`,
          animationDuration: '0.8s',
        }}
      />
    ))}
  </div>
); 