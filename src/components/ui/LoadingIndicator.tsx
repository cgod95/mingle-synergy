
import React from 'react';

interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  size = 'md', 
  color = 'brand-primary'
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className={`relative ${sizeMap[size]}`}>
        <div className="absolute top-0 left-0 w-full h-full rounded-full border-2 border-gray-200"></div>
        <div className={`absolute top-0 left-0 w-full h-full rounded-full border-2 border-t-transparent border-l-transparent border-r-transparent border-b-${color} animate-spin`}></div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
