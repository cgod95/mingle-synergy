import * as Sentry from '@sentry/react';
import React from 'react';

// Define error severity levels
export enum ErrorSeverity {
  INFO = 'info',      // For non-critical issues
  WARNING = 'warning', // For potential problems that don't break functionality
  ERROR = 'error',     // For issues that break specific features
  CRITICAL = 'critical' // For app-breaking issues
}

// Custom error type with additional metadata
interface AppError extends Error {
  code?: string;      // Error code (e.g., 'auth/user-not-found')
  context?: string;   // Context where error occurred
  severity?: ErrorSeverity; // How severe the error is
  timestamp?: number; // When the error occurred
  metadata?: Record<string, string | number | boolean>; // Additional error data
}

// Log errors with context
export const logError = (
  error: Error, 
  context: Record<string, string | number | boolean> = {},
  severity: ErrorSeverity = ErrorSeverity.ERROR
): void => {
  const appError = error as AppError;
  appError.context = context.source as string || 'unknown';
  appError.severity = severity;
  appError.timestamp = Date.now();
  appError.metadata = context;
  
  // Always log to console with formatted details
  console.error(
    `[${severity.toUpperCase()}] ${new Date().toISOString()} - ${error.message}`,
    { 
      stack: error.stack, 
      code: appError.code,
      context: appError.context,
      ...context
    }
  );
  
  // Log to analytics in both dev and prod for error tracking
  try {
    // Use dynamic import to avoid circular dependencies
    // import('../firebase/config').then(({ analytics }) => {
    //   if (analytics) {
    //     import('firebase/analytics').then((analyticsModule) => {
    //       const { logEvent } = analyticsModule;
    //       logEvent(analytics, 'app_error', {
    //         error_message: error.message,
    //         error_code: appError.code || 'unknown',
    //         error_severity: severity,
    //         error_context: JSON.stringify(context).substring(0, 500), // Limit context length
    //         error_stack: error.stack?.substring(0, 500) // Limit stack trace length
    //       });
    //     });
    //   }
    // }).catch(e => {
    //   // Silently fail if analytics import fails
    //   console.warn('Analytics import failed:', e);
    // });
  } catch (loggingError) {
    // Silently fail if analytics isn't ready yet
    console.warn('Unable to log to analytics:', loggingError);
  }
  
  // Send to Sentry in production
  if (import.meta.env.PROD) {
    try {
      Sentry.captureException(error, {
        level: severity === ErrorSeverity.CRITICAL ? 'fatal' :
               severity === ErrorSeverity.ERROR ? 'error' :
               severity === ErrorSeverity.WARNING ? 'warning' : 'info',
        tags: {
          source: context.source as string || 'unknown',
          code: appError.code || 'unknown'
        },
        extra: context
      });
    } catch (sentryError) {
      console.error('Error during Sentry logging:', sentryError);
    }
  }
};

// Log user actions for debugging
export const logUserAction = (action: string, data: Record<string, string | number | boolean> = {}): void => {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(`[USER ACTION] ${action}`, data);
  }
  
  // Log to analytics in both dev and prod for funnel analysis
  try {
    // import('../firebase/config').then(({ analytics }) => {
    //   if (analytics) {
    //     import('firebase/analytics').then((analyticsModule) => {
    //       const { logEvent } = analyticsModule;
    //       logEvent(analytics, 'user_action', {
    //         action_name: action,
    //         action_data: JSON.stringify(data).substring(0, 500) // Limit data length
    //       });
    //     });
    //   }
    // }).catch(e => {
    //   console.warn('Failed to import analytics for user action:', e);
    // });
  } catch (error) {
    console.warn('Failed to log user action to analytics:', error);
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

// Format user-friendly error messages
export const getUserFriendlyErrorMessage = (error: Error | unknown): string => {
  const appError = error as AppError;
  
  // Firebase auth error codes
  if (appError.code?.startsWith('auth/')) {
    switch (appError.code) {
      case 'auth/user-not-found':
        return 'Account not found. Please check your email or sign up.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use a stronger password.';
      case 'auth/invalid-email':
        return 'Invalid email address. Please check and try again.';
      case 'auth/too-many-requests':
        return 'Too many unsuccessful attempts. Please try again later.';
      default:
        return 'Authentication error. Please try again.';
    }
  }
  
  // Firebase Firestore error codes
  if (appError.code?.startsWith('firestore/')) {
    switch (appError.code) {
      case 'firestore/permission-denied':
        return 'You don\'t have permission to perform this action.';
      default:
        return 'Database error. Please try again.';
    }
  }
  
  // Network errors
  if (error instanceof TypeError && error.message.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  // General app errors based on context
  if (appError.context) {
    switch (appError.context) {
      case 'venue-checkin':
        return 'Unable to check in at this venue. Please try again.';
      case 'profile-update':
        return 'Unable to update your profile. Please try again.';
      case 'match-creation':
        return 'Unable to create match. Please try again.';
      default:
        break;
    }
  }
  
  // Default error message
  return appError.message || 'Something went wrong. Please try again.';
};

// Initialize error tracking with Sentry
// Per spec section 9: Error tracking with tracesSampleRate: 0.1
export const initErrorTracking = (): void => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    console.warn('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn,
    integrations: [
      new Sentry.BrowserTracing(),
    ],
    tracesSampleRate: 0.1, // Per spec section 9
    environment: import.meta.env.VITE_ENVIRONMENT || import.meta.env.MODE || 'development',
    enabled: import.meta.env.PROD || import.meta.env.VITE_ENABLE_SENTRY === 'true',
    beforeSend(event) {
      // Filter sensitive information
      if (event.request?.headers) {
        delete event.request.headers['Authorization'];
        delete event.request.headers['Cookie'];
      }
      return event;
    },
  });
};

// Create a reusable error boundary component - fixed implementation without JSX
export const withErrorBoundary = <P extends Record<string, unknown>>(
  Component: React.ComponentType<P>, 
  fallback: React.ReactNode
): React.FC<P> => {
  const ErrorBoundaryWrapper: React.FC<P> = (props) => {
    // Create a fallback component
    const FallbackComponent = () => {
      return React.createElement('div', null, fallback);
    };
    
    // Use createElement instead of JSX
    return React.createElement(
      Sentry.ErrorBoundary, 
      { fallback: React.createElement(FallbackComponent) },
      React.createElement(Component, props)
    );
  };
  
  const displayName = Component.displayName || Component.name || 'Component';
  ErrorBoundaryWrapper.displayName = `withErrorBoundary(${displayName})`;
  
  return ErrorBoundaryWrapper;
};

export default {
  logError,
  logUserAction,
  initErrorTracking,
  getUserFriendlyErrorMessage,
  withErrorBoundary,
  ErrorSeverity
};
