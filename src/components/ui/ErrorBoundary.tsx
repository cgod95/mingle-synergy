import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { LoadingSpinner } from './EnhancedLoadingStates';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  retryCount?: number;
  retryDelay?: number;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  isRetrying: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console in development
    if (import.meta.env.MODE === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Send to error reporting service (e.g., Sentry)
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real app, you'd send this to your error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
    
    // For now, just log to console
    console.error('Error reported:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });
  };

  handleRetry = async () => {
    const { retryCount: maxRetries = 3, retryDelay = 1000 } = this.props;
    
    if (this.state.retryCount >= maxRetries) {
      return;
    }

    this.setState({ isRetrying: true });

    // Wait for retry delay
    await new Promise(resolve => setTimeout(resolve, retryDelay));

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
      isRetrying: false
    }));
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleGoBack = () => {
    window.history.back();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          retryCount={this.state.retryCount}
          maxRetries={this.props.retryCount || 3}
          isRetrying={this.state.isRetrying}
          onRetry={this.handleRetry}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

// Error fallback component
interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  maxRetries: number;
  isRetrying: boolean;
  onRetry: () => void;
  onReset: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  retryCount,
  maxRetries,
  isRetrying,
  onRetry,
  onReset
}) => {
  const canRetry = retryCount < maxRetries;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-foreground">
              Something went wrong
            </h1>
            <p className="text-muted-foreground">
              We're sorry, but something unexpected happened. Please try again.
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          <Button onClick={onRetry} className="w-full">
            Try Again
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()} 
            className="w-full"
          >
            Reload Page
          </Button>
        </div>

        {import.meta.env.MODE === 'development' && error && (
          <details className="text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Error Details (Development)
            </summary>
            <div className="mt-2 p-3 bg-muted rounded text-xs font-mono overflow-auto">
              <div className="space-y-2">
                <div>
                  <strong>Error:</strong> {error.message}
                </div>
                <div>
                  <strong>Stack:</strong>
                  <pre className="whitespace-pre-wrap">{error.stack}</pre>
                </div>
                {errorInfo && (
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="whitespace-pre-wrap">{errorInfo.componentStack}</pre>
                  </div>
                )}
              </div>
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

// Network error component
export const NetworkError: React.FC<{
  message?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
}> = ({ 
  message = "Network connection error", 
  onRetry, 
  onGoBack 
}) => (
  <Card className="w-full max-w-md mx-auto">
    <CardHeader className="text-center">
      <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-yellow-600" />
      </div>
      <CardTitle className="text-lg text-gray-900">
        Connection Error
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <p className="text-gray-600 text-center">
        {message}
      </p>
      <p className="text-sm text-gray-500 text-center">
        Please check your internet connection and try again.
      </p>
      
      <div className="flex space-x-2">
        {onRetry && (
          <Button onClick={onRetry} className="flex-1">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        )}
        {onGoBack && (
          <Button variant="outline" onClick={onGoBack} className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

// Data loading error component
export const DataError: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRefresh?: boolean;
}> = ({ 
  title = "Failed to load data", 
  message = "We couldn't load the information you requested.", 
  onRetry, 
  showRefresh = true 
}) => (
  <div className="text-center py-8">
    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <AlertTriangle className="w-8 h-8 text-gray-600" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      {title}
    </h3>
    <p className="text-gray-600 mb-4">
      {message}
    </p>
    {showRefresh && onRetry && (
      <Button onClick={onRetry} variant="outline">
        <RefreshCw className="w-4 h-4 mr-2" />
        Refresh
      </Button>
    )}
  </div>
);

// Empty state component
export const EmptyState: React.FC<{
  icon?: ReactNode;
  title: string;
  message: string;
  action?: ReactNode;
}> = ({ icon, title, message, action }) => (
  <div className="text-center py-12 px-4 sm:px-6 lg:px-8" aria-live="polite">
    {icon && (
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
    )}
    <h3 className="text-xl font-semibold text-foreground mb-2">
      {title}
    </h3>
    <p className="text-muted-foreground mb-4">
      {message}
    </p>
    {action && action}
  </div>
);

// Offline indicator
export const OfflineIndicator: React.FC<{ isOnline: boolean }> = ({ isOnline }) => {
  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 z-50">
      <div className="flex items-center justify-center space-x-2">
        <AlertTriangle className="w-4 h-4" />
        <span className="text-sm font-medium">
          You're offline. Some features may not work.
        </span>
      </div>
    </div>
  );
};

// Error toast component
export const ErrorToast: React.FC<{
  title: string;
  message: string;
  onRetry?: () => void;
}> = ({ title, message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <div className="flex items-start space-x-3">
      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-sm font-medium text-red-800">{title}</h4>
        <p className="text-sm text-red-700 mt-1">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm text-red-600 hover:text-red-800 font-medium mt-2"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  </div>
);

// Hook for functional components
export const useErrorBoundary = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
    
    // Log error
    console.error('useErrorBoundary caught an error:', error);
    
    // In a real app, you'd send this to your error reporting service
  }, []);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, resetError };
};

// Async error boundary for promises
export const AsyncErrorBoundary: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}> = ({ children, fallback, onError }) => {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setError(event.reason);
      onError?.(event.reason);
    };

    const handleError = (event: ErrorEvent) => {
      setError(event.error);
      onError?.(event.error);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, [onError]);

  if (error) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <ErrorFallback
        error={error}
        errorInfo={null}
        retryCount={0}
        maxRetries={3}
        isRetrying={false}
        onRetry={() => setError(null)}
        onReset={() => setError(null)}
      />
    );
  }

  return <>{children}</>;
};

// Network error boundary
export const NetworkErrorBoundary: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback }) => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-yellow-600 dark:text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"
                />
              </svg>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Internet Connection
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please check your internet connection and try again.
            </p>
            
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Boundary for specific error types
export const createErrorBoundary = (errorType: string) => {
  return class SpecificErrorBoundary extends ErrorBoundary {
    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
      // Only catch specific error types
      if (error.name === errorType || error.message.includes(errorType)) {
        super.componentDidCatch(error, errorInfo);
      } else {
        // Re-throw other errors
        throw error;
      }
    }
  };
};

export default ErrorBoundary; 