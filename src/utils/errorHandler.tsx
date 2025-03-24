
import React from 'react';

// Simple error logging function
export const logError = (error: Error, context: Record<string, any> = {}) => {
  console.error('Application error:', error);
  console.error('Error context:', context);
  
  // In production, you would send this to a logging service
  if (process.env.NODE_ENV === 'production') {
    // Placeholder for production error logging
    try {
      // Example: send to console in a formatted way
      console.error(
        `[ERROR] ${new Date().toISOString()} - ${error.message}`,
        { stack: error.stack, ...context }
      );
    } catch (loggingError) {
      console.error('Error during error logging:', loggingError);
    }
  }
};

// User action tracking for debugging
export const logUserAction = (action: string, data: Record<string, any> = {}) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[USER ACTION] ${action}`, data);
  }
};

// Error boundary fallback UI component
export const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary?: () => void }) => {
  return (
    <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
      <h2 className="text-lg font-medium text-red-800 mb-2">Something went wrong</h2>
      <p className="text-red-600 mb-4">{error.message || "An unexpected error occurred"}</p>
      {resetErrorBoundary && (
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Try again
        </button>
      )}
    </div>
  );
};

// Higher-order component for error boundaries
export const withErrorHandling = (Component: React.ComponentType<any>, fallback?: React.ReactNode) => {
  return function WithErrorHandling(props: any) {
    try {
      return <Component {...props} />;
    } catch (error) {
      logError(error as Error, { componentProps: props });
      return fallback || <ErrorFallback error={error as Error} />;
    }
  };
};
