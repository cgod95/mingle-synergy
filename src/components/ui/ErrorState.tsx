
import React from 'react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="p-4 py-12 bg-gray-50 rounded-lg text-center">
      <p className="text-gray-700 font-medium mb-2">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="mt-2 px-4 py-2 bg-coral-500 text-white rounded-full text-sm"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
