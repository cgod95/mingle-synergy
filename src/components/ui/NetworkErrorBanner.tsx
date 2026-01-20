import { AlertCircle, Wifi, WifiOff, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NetworkErrorBannerProps {
  error?: Error | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}

// User-friendly error message mapping
function getErrorMessage(error: Error | null, isOnline: boolean): { title: string; description: string } {
  if (!isOnline) {
    return {
      title: "You're offline",
      description: "Check your internet connection and try again"
    };
  }
  
  const message = error?.message?.toLowerCase() || '';
  
  if (message.includes('permission') || message.includes('denied')) {
    return {
      title: "Permission needed",
      description: "Please grant the required permissions to continue"
    };
  }
  
  if (message.includes('timeout') || message.includes('timed out')) {
    return {
      title: "Request timed out",
      description: "The server is taking too long. Try again in a moment"
    };
  }
  
  if (message.includes('not found') || message.includes('404')) {
    return {
      title: "Not found",
      description: "We couldn't find what you're looking for"
    };
  }
  
  if (message.includes('server') || message.includes('500')) {
    return {
      title: "Server hiccup",
      description: "Our servers are having a moment. We're on it!"
    };
  }
  
  return {
    title: "Something went wrong",
    description: "Don't worry, try again and it should work"
  };
}

export function NetworkErrorBanner({ error, onRetry, onDismiss }: NetworkErrorBannerProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isRetrying, setIsRetrying] = useState(false);
  
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

  const { title, description } = getErrorMessage(error || null, isOnline);

  const handleRetry = async () => {
    if (!onRetry) return;
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed top-0 left-0 right-0 z-50 bg-red-900/95 backdrop-blur-sm border-b border-red-700/50 px-4 py-3 shadow-lg"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-800/50 flex items-center justify-center flex-shrink-0">
              {isOnline ? (
                <AlertCircle className="w-5 h-5 text-red-300" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">
                {title}
              </p>
              <p className="text-xs text-red-200/80 mt-0.5">
                {description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {onRetry && isOnline && (
              <Button
                onClick={handleRetry}
                size="sm"
                disabled={isRetrying}
                className="bg-white/10 hover:bg-white/20 text-white border-0 transition-all"
              >
                <RefreshCw className={`w-4 h-4 mr-1.5 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying...' : 'Retry'}
              </Button>
            )}
            {onDismiss && (
              <Button
                onClick={onDismiss}
                size="icon"
                variant="ghost"
                className="text-red-200 hover:text-white hover:bg-white/10 h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}




