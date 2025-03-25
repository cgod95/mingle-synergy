
import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-bg-tertiary rounded-lg p-6 text-center">
      <p className="text-text-primary font-medium mb-2">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="mt-2 px-4 py-2 bg-brand-primary text-white rounded-full text-sm"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
