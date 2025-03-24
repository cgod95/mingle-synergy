
import * as Sentry from '@sentry/react';

// Log errors with context
export const logError = (error: Error, context: Record<string, any> = {}): void => {
  console.error('Application error:', error);
  console.error('Error context:', context);
  
  if (import.meta.env.PROD) {
    try {
      console.error(
        `[ERROR] ${new Date().toISOString()} - ${error.message}`,
        { stack: error.stack, ...context }
      );
      
      // Also log to Sentry in production
      Sentry.captureException(error, {
        extra: context
      });
    } catch (loggingError) {
      console.error('Error during error logging:', loggingError);
    }
  }
};

// Log user actions for debugging
export const logUserAction = (action: string, data: Record<string, any> = {}): void => {
  if (import.meta.env.DEV) {
    console.log(`[USER ACTION] ${action}`, data);
  }
  
  // Add breadcrumb in production for Sentry
  if (import.meta.env.PROD) {
    Sentry.addBreadcrumb({
      category: 'user-action',
      message: action,
      data,
      level: 'info',
    });
  }
};

// Initialize error tracking with Sentry
export const initErrorTracking = (): void => {
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
