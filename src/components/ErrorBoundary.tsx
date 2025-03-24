
import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import { logError } from '@/utils/errorHandler';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to Sentry and Firebase Analytics
    logError(error, {
      componentStack: errorInfo.componentStack,
      source: 'ErrorBoundary'
    });
    
    // Also log to console in development
    console.error('Error caught by boundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Higher order component for wrapping components with error boundary
export const withErrorBoundary = (
  Component: React.ComponentType<any>,
  fallback: ReactNode
) => {
  const WithErrorBoundary = (props: any) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  const displayName = Component.displayName || Component.name || 'Component';
  WithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;
  
  return WithErrorBoundary;
};
