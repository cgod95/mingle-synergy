import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { logError } from './errorHandler';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  stepName?: string; // For onboarding-specific error handling
  onRetry?: () => void;
  onGoBack?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    logError(error, { 
      componentStack: errorInfo.componentStack || '',
      stepName: this.props.stepName || 'unknown',
      errorBoundary: true
    });
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleGoBack = () => {
    if (this.props.onGoBack) {
      this.props.onGoBack();
    } else {
      // Default: go back to previous onboarding step
      const stepName = this.props.stepName;
      if (stepName === 'photo') {
        window.location.href = '/create-profile';
      } else if (stepName === 'preferences') {
        window.location.href = '/photo-upload';
      } else {
        window.location.href = '/signin';
      }
    }
  };

  getErrorMessage = (): string => {
    const error = this.state.error;
    if (!error) return 'An unexpected error occurred';
    
    const errorMessage = error.message || '';
    const errorStack = error.stack || '';
    
    // Classify error type
    if (errorMessage.includes('permission-denied') || errorMessage.includes('Permission denied')) {
      return 'Permission denied. Please ensure you are signed in and try again.';
    }
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')) {
      return 'Network error. Please check your connection and try again.';
    }
    if (errorMessage.includes('Firebase') || errorStack.includes('firebase')) {
      return 'Firebase error. Please refresh the page and try again.';
    }
    if (errorMessage.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    
    return errorMessage || 'An unexpected error occurred';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      const errorMessage = this.getErrorMessage();
      const stepName = this.props.stepName;
      
      return (
        <div className="min-h-screen min-h-[100dvh] bg-neutral-900 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-800 rounded-lg shadow-xl border-2 border-red-700/50 p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-red-400 mb-2">
                {stepName ? `Error in ${stepName} step` : 'Something went wrong'}
              </h2>
              <p className="text-red-300 mb-4">{errorMessage}</p>
            </div>
            
            <div className="flex flex-col space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
              {stepName && (
                <button
                  onClick={this.handleGoBack}
                  className="w-full px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded-lg font-medium transition-colors"
                >
                  Go Back
                </button>
              )}
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded-lg font-medium transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher Order Component for wrapping components with error boundary
export const withErrorBoundary = (
  Component: React.ComponentType<unknown>,
  fallback?: React.ReactNode
) => {
  const WithErrorBoundary = (props: Record<string, unknown>) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  const displayName = Component.displayName || Component.name || 'Component';
  WithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;
  
  return WithErrorBoundary;
};
