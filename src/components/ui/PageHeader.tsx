import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  onBack?: () => void;
  trailing?: ReactNode;
  gradient?: boolean;
  className?: string;
}

export function PageHeader({ title, subtitle, backTo, onBack, trailing, gradient = false, className }: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  const showBack = backTo !== undefined || onBack !== undefined;

  return (
    <div className={cn('flex items-center gap-3 px-4 py-3', className)}>
      {showBack && (
        <button
          onClick={handleBack}
          className="h-11 w-11 flex items-center justify-center rounded-full hover:bg-neutral-800 transition-colors flex-shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className={cn(
          'type-display truncate',
          gradient && 'text-gradient'
        )}>
          {title}
        </h1>
        {subtitle && (
          <p className="type-caption truncate">{subtitle}</p>
        )}
      </div>
      {trailing && (
        <div className="flex-shrink-0">{trailing}</div>
      )}
    </div>
  );
}
