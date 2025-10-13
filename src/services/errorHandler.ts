import { trackError } from './appAnalytics';
import { logError } from '@/utils/errorHandler';
import logger from '@/utils/Logger';

interface ErrorWithCode extends Error {
  code?: string;
}

class ErrorHandler {
  // Initialize error handler
  init() {
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
    
    // Catch global errors
    window.addEventListener('error', this.handleGlobalError.bind(this));
    
    // Override console.error to track errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Log to analytics if it's an error object
      if (args[0] instanceof Error) {
        this.trackApplicationError(args[0]);
      }
      // Call the original console.error
      originalConsoleError.apply(console, args);
    };
  }
  
  // Handle promise rejections
  private handlePromiseRejection(event: PromiseRejectionEvent) {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    this.trackApplicationError(error, 'unhandled_promise_rejection');
  }
  
  // Handle global errors
  private handleGlobalError(event: ErrorEvent) {
    const { message, filename, lineno, colno, error } = event;
    this.trackApplicationError(
      error || new Error(message),
      'global_error',
      { filename, lineno, colno }
    );
  }
  
  // Track application errors
  trackApplicationError(error: Error, source = 'application', additionalData?: Record<string, unknown>) {
    const errorWithCode = error as ErrorWithCode;
    
    // Track with Firebase Analytics
    trackError(
      errorWithCode.code || error.name || 'unknown',
      error.message,
      {
        source,
        stack: error.stack,
        ...additionalData
      }
    );
    
    // Also log with Sentry
    logError(error, {
      source,
      ...additionalData
    });
  }
}

export const errorHandler = new ErrorHandler();
