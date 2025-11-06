
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import usePerformance from '@/hooks/usePerformance';

interface ErrorMessageProps {
  message: string;
  className?: string;
  withIcon?: boolean;
  variant?: 'default' | 'destructive' | 'warning';
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message,
  className = '',
  withIcon = true,
  variant = 'default',
  onRetry
}) => {
  // Track component performance
  usePerformance('ErrorMessage');
  
  if (!message) return null;
  
  // Determine styling based on variant
  const variantStyles = {
    default: 'bg-red-50 border-red-400 text-red-700',
    destructive: 'bg-red-100 border-red-500 text-red-800',
    warning: 'bg-amber-50 border-amber-400 text-amber-700'
  };
  
  const iconColor = {
    default: 'text-red-400',
    destructive: 'text-red-500',
    warning: 'text-amber-400'
  };
  
  return (
    <div className={`border-l-4 p-4 my-3 rounded ${variantStyles[variant]} ${className}`}>
      <div className="flex items-start">
        {withIcon && (
          <div className="flex-shrink-0 mt-0.5">
            <AlertTriangle className={`h-5 w-5 ${iconColor[variant]}`} />
          </div>
        )}
        <div className={withIcon ? "ml-3" : ""}>
          <p className="text-sm">{message}</p>
          
          {onRetry && (
            <button 
              onClick={onRetry}
              className="mt-2 text-sm font-medium underline focus:outline-none"
              type="button"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
