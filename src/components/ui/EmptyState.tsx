import React from 'react';
import { LucideIcon, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
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
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  variant?: 'default' | 'compact' | 'card';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  variant = 'default',
}) => {
  const isCompact = variant === 'compact';
  const isCard = variant === 'card';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        'text-center',
        isCompact ? 'py-8 px-4' : 'py-12 px-6',
        isCard && 'bg-neutral-800/50 rounded-2xl border border-neutral-700/50 shadow-lg backdrop-blur-sm',
        className
      )}
    >
      {Icon && (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3, type: 'spring', stiffness: 200 }}
          className={cn(
            "mx-auto rounded-full flex items-center justify-center mb-5",
            "bg-gradient-to-br from-violet-900/60 to-violet-900/40",
            "ring-2 ring-violet-500/20 shadow-lg shadow-violet-500/10",
            isCompact ? 'w-14 h-14' : 'w-20 h-20'
          )}
        >
          <Icon className={cn(
            "text-violet-400",
            isCompact ? 'w-7 h-7' : 'w-10 h-10'
          )} />
        </motion.div>
      )}
      
      <motion.h3 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className={cn(
          "font-bold mb-2 text-white",
          isCompact ? 'text-xl' : 'text-2xl'
        )}
      >
        {title}
      </motion.h3>
      
      {description && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={cn(
            "text-neutral-300 max-w-md mx-auto leading-relaxed",
            isCompact ? 'text-sm mb-4' : 'text-base mb-6'
          )}
        >
          {description}
        </motion.p>
      )}
      
      {(action || secondaryAction) && (
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          {action && (
            <Button
              onClick={action.onClick}
              className={cn(
                "bg-gradient-to-r from-violet-600 to-violet-600",
                "hover:from-violet-500 hover:to-violet-500",
                "text-white font-semibold shadow-lg shadow-violet-500/25",
                "transition-all duration-200 hover:shadow-violet-500/40 hover:scale-[1.02]",
                "active:scale-[0.98]",
                isCompact ? 'px-4 py-2 text-sm' : 'px-6 py-2.5'
              )}
            >
              {action.label}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="ghost"
              className="text-neutral-400 hover:text-white hover:bg-neutral-700/50"
            >
              {secondaryAction.label}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

