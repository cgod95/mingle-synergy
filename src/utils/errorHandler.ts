
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { trackError } from '@/services/appAnalytics';

// Initialize error tracking (use your own DSN in production)
export const initErrorTracking = () => {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN || '', // Replace with your Sentry DSN
      integrations: [new BrowserTracing()],
      tracesSampleRate: 0.5,
      environment: import.meta.env.VITE_ENVIRONMENT || 'development',
      enabled: import.meta.env.PROD,
    });
  }
};

// Log errors with context
export const logError = (error: Error, context: Record<string, any> = {}) => {
  console.error(error);
  
  // Log to Firebase Analytics
  trackError(
    error.name || 'unknown_error',
    error.message,
    {
      stack: error.stack,
      ...context
    }
  );
  
  // Log to Sentry in production
  if (import.meta.env.PROD) {
    Sentry.captureException(error, {
      extra: context
    });
  }
};

// Log user actions for analytics
export const logUserAction = (action: string, data: Record<string, any> = {}) => {
  if (import.meta.env.PROD) {
    Sentry.addBreadcrumb({
      category: 'user-action',
      message: action,
      data,
      level: 'info',
    });
  }
};

// Create Error Boundary component
export const withErrorBoundary = (Component: React.ComponentType, fallback: React.ReactNode) => {
  return Sentry.withErrorBoundary(Component, {
    fallback: () => <>{fallback}</>
  });
};
