import { ErrorInfo } from 'react';
import logger from '@/utils/Logger';

// Hook for functional components to handle errors
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    logger.error('Error caught by useErrorHandler:', error, errorInfo);
    
    // In a production app, you would send this to your error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  };
} 