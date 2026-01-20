import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div className={cn('text-center py-12 px-4', className)}>
      {Icon && (
        <div className="mx-auto w-16 h-16 bg-indigo-900/50 rounded-full flex items-center justify-center mb-4 ring-2 ring-indigo-900/30">
          <Icon className="w-8 h-8 text-indigo-400" />
        </div>
      )}
      <h3 className="text-2xl font-bold mb-2 text-white">{title}</h3>
      {description && (
        <p className="text-sm text-neutral-300 mb-6 max-w-md mx-auto leading-relaxed">{description}</p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

