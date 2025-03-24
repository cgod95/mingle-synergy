
import React from 'react';
import * as Sentry from '@sentry/react';

// Log errors with context
export const logError = (error: Error, context: Record<string, any> = {}) => {
 console.error('Application error:', error);
 console.error('Error context:', context);
 
 // In production, you would send this to a logging service
 if (import.meta.env.PROD) {
   try {
     console.error(
       `[ERROR] ${new Date().toISOString()} - ${error.message}`,
       { stack: error.stack, ...context }
     );
   } catch (loggingError) {
     console.error('Error during error logging:', loggingError);
   }
 }
};

// Log user actions for debugging
export const logUserAction = (action: string, data: Record<string, any> = {}) => {
 if (import.meta.env.DEV) {
   console.log(`[USER ACTION] ${action}`, data);
 }
};

// Initialize error tracking with Sentry
export const initErrorTracking = () => {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN || '', // Replace with your Sentry DSN
      integrations: [new Sentry.BrowserTracing()],
      tracesSampleRate: 0.5,
      environment: import.meta.env.VITE_ENVIRONMENT || 'development',
      enabled: import.meta.env.PROD,
    });
  }
};

// Simple error fallback component
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

// Custom error boundary HOC
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
