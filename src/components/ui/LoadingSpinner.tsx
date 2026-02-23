import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'fullscreen' | 'inline';
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  variant = 'inline',
  message,
  className 
}) => {
  const sizeClasses = {
    sm: { logo: 'w-12 h-12', text: 'text-3xl', dots: 'w-1.5 h-1.5' },
    md: { logo: 'w-16 h-16', text: 'text-4xl', dots: 'w-2 h-2' },
    lg: { logo: 'w-20 h-20', text: 'text-5xl', dots: 'w-2.5 h-2.5' },
    xl: { logo: 'w-24 h-24', text: 'text-5xl', dots: 'w-2 h-2' }
  };

  const sizes = sizeClasses[size];

  const content = (
    <div className={cn('flex flex-col items-center', className)}>
      <div className={cn(sizes.logo, 'mb-4 animate-pulse')}>
        <div className="w-full h-full rounded-2xl bg-[#7C3AED] flex items-center justify-center shadow-lg shadow-[#7C3AED]/30">
          <span className={cn(sizes.text, 'font-bold text-white')}>
            M
          </span>
        </div>
      </div>
      
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(sizes.dots, 'bg-violet-400 rounded-full animate-pulse')}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '0.8s',
            }}
          />
        ))}
      </div>
      
      {message && (
        <p className="mt-4 text-sm text-neutral-400">{message}</p>
      )}
    </div>
  );

  if (variant === 'fullscreen') {
    return (
      <div className="fixed inset-0 bg-[#0a0a0f] flex items-center justify-center z-[9999]">
        {content}
      </div>
    );
  }

  return content;
};

export const InlineSpinner: React.FC<{ 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn('animate-spin rounded-full border-2 border-violet-600 border-t-transparent', sizeClasses[size], className)} />
  );
};

export default LoadingSpinner;
