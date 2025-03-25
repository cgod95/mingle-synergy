
import { useToast } from "@/hooks/use-toast";
import { logError } from './errorHandler';

interface ErrorContext {
  source: string;
  action?: string;
  userId?: string;
  additionalData?: Record<string, any>;
}

/**
 * Centralized error handling utility
 * 
 * @param error - The error that occurred
 * @param context - Context information about where the error occurred
 * @param showToast - Whether to show a toast notification to the user
 */
export const handleAppError = (
  error: unknown, 
  context: ErrorContext, 
  showToast = true
): void => {
  // Convert to Error object if it's not already
  const errorObj = error instanceof Error ? error : new Error(String(error));
  
  // Log the error with context
  logError(errorObj, context);
  
  // Log to console in development
  if (import.meta.env.DEV) {
    console.error(`Error in ${context.source}${context.action ? ` (${context.action})` : ''}:`, error);
    console.error('Context:', context);
  }
  
  // Show a toast notification if requested
  if (showToast) {
    const { toast } = useToast();
    toast({
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
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: ErrorContext,
  showToast = true
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleAppError(error, context, showToast);
      throw error; // Re-throw to allow the caller to handle it
    }
  };
}
