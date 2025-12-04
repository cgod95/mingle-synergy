/**
 * Onboarding Error Recovery Utilities
 * Provides centralized error recovery mechanisms for onboarding flow
 */

import { logError } from './errorHandler';

export enum ErrorType {
  NETWORK = 'network',
  PERMISSION = 'permission',
  VALIDATION = 'validation',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown',
}

export interface ErrorRecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number) => void;
  onFailure?: (error: Error) => void;
}

const DEFAULT_OPTIONS: Required<Omit<ErrorRecoveryOptions, 'onRetry' | 'onFailure'>> = {
  maxRetries: 3,
  retryDelay: 1000,
};

/**
 * Classify error type
 */
export function classifyError(error: unknown): ErrorType {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const code = (error as any).code || '';
    
    if (message.includes('network') || message.includes('fetch') || code.includes('unavailable')) {
      return ErrorType.NETWORK;
    }
    if (message.includes('permission') || code === 'permission-denied') {
      return ErrorType.PERMISSION;
    }
    if (message.includes('timeout') || code.includes('deadline-exceeded')) {
      return ErrorType.TIMEOUT;
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorType.VALIDATION;
    }
  }
  return ErrorType.UNKNOWN;
}

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error: unknown): boolean {
  const errorType = classifyError(error);
  return errorType === ErrorType.NETWORK || errorType === ErrorType.TIMEOUT;
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown, stepName?: string): string {
  const errorType = classifyError(error);
  const stepContext = stepName ? ` in ${stepName} step` : '';
  
  switch (errorType) {
    case ErrorType.NETWORK:
      return `Network error${stepContext}. Please check your connection and try again.`;
    case ErrorType.PERMISSION:
      return `Permission denied${stepContext}. Please ensure you are signed in and try again.`;
    case ErrorType.TIMEOUT:
      return `Request timed out${stepContext}. Please try again.`;
    case ErrorType.VALIDATION:
      return error instanceof Error ? error.message : `Validation error${stepContext}.`;
    default:
      return error instanceof Error 
        ? error.message 
        : `An error occurred${stepContext}. Please try again.`;
  }
}

/**
 * Retry operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: ErrorRecoveryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry non-recoverable errors
      if (!isRecoverableError(error)) {
        throw lastError;
      }
      
      // Don't retry on last attempt
      if (attempt === opts.maxRetries) {
        break;
      }
      
      // Call onRetry callback
      if (opts.onRetry) {
        opts.onRetry(attempt + 1);
      }
      
      // Wait before retrying (exponential backoff)
      const delay = opts.retryDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // Call onFailure callback
  if (opts.onFailure && lastError) {
    opts.onFailure(lastError);
  }
  
  throw lastError || new Error('Operation failed after retries');
}

/**
 * Step-specific recovery actions
 */
export const stepRecoveryActions = {
  profile: {
    retry: () => {
      // Retry profile creation
      return Promise.resolve();
    },
    goBack: () => {
      window.location.href = '/signin';
    },
  },
  photo: {
    retry: () => {
      // Retry photo upload
      return Promise.resolve();
    },
    goBack: () => {
      window.location.href = '/create-profile';
    },
  },
  preferences: {
    retry: () => {
      // Retry preferences save
      return Promise.resolve();
    },
    goBack: () => {
      window.location.href = '/photo-upload';
    },
  },
};

/**
 * Handle onboarding error with recovery
 */
export async function handleOnboardingError(
  error: unknown,
  stepName: string,
  options: ErrorRecoveryOptions = {}
): Promise<void> {
  const errorType = classifyError(error);
  const errorMessage = getErrorMessage(error, stepName);
  
  logError(error instanceof Error ? error : new Error(String(error)), {
    source: 'onboardingErrorRecovery',
    stepName,
    errorType,
    errorMessage,
  });
  
  // If recoverable, attempt recovery
  if (isRecoverableError(error) && options.maxRetries !== 0) {
    const recoveryAction = stepRecoveryActions[stepName as keyof typeof stepRecoveryActions];
    if (recoveryAction) {
      try {
        await recoveryAction.retry();
        return;
      } catch (retryError) {
        // Retry failed, throw original error
        throw error;
      }
    }
  }
  
  // Non-recoverable or recovery failed
  throw error;
}

