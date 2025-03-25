import * as Sentry from '@sentry/react';
import React from 'react';
import { analytics } from '@/firebase/config';
import { logEvent } from 'firebase/analytics';

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
  metadata?: Record<string, any>; // Additional error data
}

// Log errors with context
export const logError = (
  error: Error, 
  context: Record<string, any> = {},
  severity: ErrorSeverity = ErrorSeverity.ERROR
): void => {
  const appError = error as AppError;
  appError.context = context.source || 'unknown';
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
  if (analytics) {
    try {
      logEvent(analytics, 'app_error', {
        error_message: error.message,
        error_code: appError.code || 'unknown',
        error_severity: severity,
        error_context: JSON.stringify(context),
        error_stack: error.stack?.substring(0, 500) // Limit stack trace length
      });
    } catch (loggingError) {
      console.error('Error during analytics logging:', loggingError);
    }
  }
  
  // Send to Sentry in production
  if (import.meta.env.PROD) {
    try {
      Sentry.captureException(error, {
        level: severity === ErrorSeverity.CRITICAL ? 'fatal' :
               severity === ErrorSeverity.ERROR ? 'error' :
               severity === ErrorSeverity.WARNING ? 'warning' : 'info',
        tags: {
          source: context.source || 'unknown',
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
export const logUserAction = (action: string, data: Record<string, any> = {}): void => {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(`[USER ACTION] ${action}`, data);
  }
  
  // Log to analytics in both dev and prod for funnel analysis
  if (analytics) {
    try {
      logEvent(analytics, 'user_action', {
        action_name: action,
        action_data: JSON.stringify(data).substring(0, 500) // Limit data length
      });
    } catch (error) {
      console.warn('Failed to log user action to analytics:', error);
    }
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
export const initErrorTracking = (): void => {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN || '', // Replace with your Sentry DSN
      integrations: [new Sentry.BrowserTracing()],
      tracesSampleRate: 0.5,
      environment: import.meta.env.VITE_ENVIRONMENT || 'development',
      enabled: import.meta.env.PROD,
      beforeSend(event) {
        // Filter sensitive information if needed
        return event;
      },
    });
  }
};

// Create a reusable error boundary component - fixed implementation without JSX
export const withErrorBoundary = (
  Component: React.ComponentType<any>, 
  fallback: React.ReactNode
): React.FC<any> => {
  const ErrorBoundaryWrapper: React.FC<any> = (props) => {
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
