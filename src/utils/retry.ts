/**
 * Retry utility for failed operations
 * Provides exponential backoff and configurable retry logic
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryable?: (error: unknown) => boolean;
  operationName?: string;
  onRetry?: (attempt: number) => void;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'operationName' | 'onRetry'>> & Partial<Pick<RetryOptions, 'operationName' | 'onRetry'>> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryable: () => true, // Retry all errors by default
};

/**
 * Check if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return (
      error.message.includes('network') ||
      error.message.includes('fetch') ||
      error.message.includes('Failed to fetch')
    );
  }
  if (error instanceof Error) {
    return (
      error.message.includes('network') ||
      error.message.includes('NetworkError') ||
      error.message.includes('timeout')
    );
  }
  return false;
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  // Network errors are always retryable
  if (isNetworkError(error)) {
    return true;
  }

  // Firebase errors that are retryable
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code?: string }).code;
    if (code) {
      // Retryable Firebase error codes
      const retryableCodes = [
        'unavailable',
        'deadline-exceeded',
        'resource-exhausted',
        'internal',
        'aborted',
      ];
      return retryableCodes.some((c) => code.includes(c));
    }
  }

  // Default: don't retry unless it's a network error
  return false;
}

/**
 * Calculate delay with exponential backoff
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  const delay = options.initialDelay * Math.pow(options.backoffMultiplier, attempt);
  return Math.min(delay, options.maxDelay);
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const retryable = options.retryable || isRetryableError;

  let lastError: unknown;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if error is not retryable
      if (!retryable(error)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === opts.maxRetries) {
        break;
      }

      // Call onRetry callback if provided
      if (options.onRetry) {
        options.onRetry(attempt + 1);
      }

      // Wait before retrying
      const delay = calculateDelay(attempt, opts);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Retry with user-friendly error messages
 */
export async function retryWithMessage<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { operationName, ...retryOptions } = options;

  try {
    return await retry(fn, retryOptions);
  } catch (error) {
    if (isNetworkError(error)) {
      throw new Error(
        `Network error. Please check your connection and try again.${operationName ? ` (${operationName})` : ''}`
      );
    }
    throw error;
  }
}








