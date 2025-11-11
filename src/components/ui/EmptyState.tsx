import React from 'react';
import { motion } from 'framer-motion';
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('text-center py-12 px-4', className)}
    >
      {Icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4"
        >
          <Icon className="w-8 h-8 text-indigo-600" />
        </motion.div>
      )}
      <h3 className="text-heading-3 mb-2">{title}</h3>
      {description && (
        <p className="text-body-secondary mb-6 max-w-md mx-auto">{description}</p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {action.label}
        </Button>
      )}
    </motion.div>
  );
};

