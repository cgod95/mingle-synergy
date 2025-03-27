
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  className?: string;
  withIcon?: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message,
  className = '',
  withIcon = true
}) => {
  if (!message) return null;
  
  return (
    <div className={`bg-red-50 border-l-4 border-red-400 p-4 my-3 rounded ${className}`}>
      <div className="flex">
        {withIcon && (
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
        )}
        <div className={withIcon ? "ml-3" : ""}>
          <p className="text-sm text-red-700">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
