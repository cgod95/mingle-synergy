import { logError } from './errorHandler';

interface ErrorContext {
  source: string;
  action?: string;
  userId?: string;
  additionalData?: Record<string, unknown>;
}

interface ToastFunction {
  (options: { variant: string; title: string; description: string }): void;
}

/**
 * Centralized error handling utility
 * 
 * @param error - The error that occurred
 * @param context - Context information about where the error occurred
 * @param showToast - Whether to show a toast notification to the user
 * @param toastFn - Optional toast function to use for notifications
 */
export const handleAppError = (
  error: unknown, 
  context: ErrorContext, 
  showToast = true,
  toastFn?: ToastFunction
): void => {
  // Convert to Error object if it's not already
  const errorObj = error instanceof Error ? error : new Error(String(error));
  
  // Log the error with context - convert ErrorContext to Record<string, string | number | boolean>
  const logContext: Record<string, string | number | boolean> = {
    source: context.source,
    ...(context.action && { action: context.action }),
    ...(context.userId && { userId: context.userId }),
    ...(context.additionalData && Object.fromEntries(
      Object.entries(context.additionalData).map(([k, v]) => [k, String(v)])
    ))
  };
  logError(errorObj, logContext);
  
  // Log to console in development
  if (import.meta.env.DEV) {
    console.error(`Error in ${context.source}${context.action ? ` (${context.action})` : ''}:`, error);
    console.error('Context:', context);
  }
  
  // Show a toast notification if requested and toast function provided
  if (showToast && toastFn) {
    toastFn({
      variant: "destructive",
      title: "An error occurred",
      description: errorObj.message || "Something went wrong. Please try again.",
    });
  }
};

/**
 * Higher-order function to wrap async functions with error handling
 * 
 * @param fn - The async function to wrap
 * @param context - Context information about where the function is being used
 * @param showToast - Whether to show a toast on error
 * @param toastFn - Optional toast function to use for notifications
 */
export function withErrorHandling<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context: ErrorContext,
  showToast = true,
  toastFn?: ToastFunction
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    try {
      return await fn(...args) as Awaited<ReturnType<T>>;
    } catch (error) {
      handleAppError(error, context, showToast, toastFn);
      throw error; // Re-throw to allow the caller to handle it
    }
  };
}
