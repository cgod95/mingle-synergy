import { AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState, useMemo } from 'react';

interface NetworkErrorBannerProps {
  error?: Error | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function NetworkErrorBanner({ error, onRetry, onDismiss }: NetworkErrorBannerProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Memoize showBanner to prevent unnecessary re-renders
  const showBanner = useMemo(() => {
    return !isOnline || !!error;
  }, [isOnline, error]);

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-50 border-b border-red-200 px-4 py-3 shadow-md">
      {/* Removed AnimatePresence and motion.div to prevent flickering */}
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isOnline ? (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">
              {!isOnline
                ? 'You\'re offline. Some features may not work.'
                : error?.message || 'Network error. Please check your connection.'}
            </p>
            {isOnline && error && (
              <p className="text-xs text-red-600 mt-0.5">
                {onRetry ? 'Click retry to try again.' : 'Please refresh the page.'}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onRetry && isOnline && (
            <Button
              onClick={onRetry}
              size="sm"
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button
              onClick={onDismiss}
              size="sm"
              variant="ghost"
              className="text-red-600 hover:bg-red-100"
            >
              Dismiss
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}




