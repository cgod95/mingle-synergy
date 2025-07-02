import React from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from './skeleton';
import { Card, CardContent, CardHeader } from './card';

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

// Skeleton for UserProfile
export const UserProfileSkeleton: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    className="space-y-6"
  >
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
  </motion.div>
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
export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center p-8 space-y-4"
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
    />
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="text-sm text-muted-foreground"
    >
      {message}
    </motion.p>
  </motion.div>
);

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