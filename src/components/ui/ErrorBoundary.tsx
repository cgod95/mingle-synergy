import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isRetrying: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    isRetrying: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error, 
      errorInfo: null,
      isRetrying: false
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ isRetrying: true });
    
    // Reset error state
    setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRetrying: false
      });
    }, 100);
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">
                Oops! Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-center">
                We encountered an unexpected error. Don't worry, it's not your fault!
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-gray-100 p-3 rounded-lg">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                    Error Details (Development)
                  </summary>
                  <pre className="text-xs text-red-600 overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex flex-col space-y-2">
                <Button 
                  onClick={this.handleRetry}
                  disabled={this.state.isRetrying}
                  className="w-full"
                >
                  {this.state.isRetrying ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={this.handleGoBack}
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={this.handleGoHome}
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

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
  <div className="text-center py-8">
    {icon && (
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      {title}
    </h3>
    <p className="text-gray-600 mb-4">
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