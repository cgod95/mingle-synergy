import React from 'react';
import { LucideIcon, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './button';
import { cn } from '@/lib/utils';

/* Illustration SVGs for empty states - violet gradient brand */
const NoVenuesIllustration = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 80 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="36" fill="url(#empty-venues-grad)" opacity="0.3" />
    <path d="M40 20c-6 0-11 5-11 11 0 8 11 18 11 18s11-10 11-18c0-6-5-11-11-11z" fill="url(#empty-venues-grad)" stroke="url(#empty-venues-grad)" strokeWidth="1.5" />
    <circle cx="40" cy="31" r="4" fill="url(#empty-venues-grad)" />
    <defs>
      <linearGradient id="empty-venues-grad" x1="20" y1="20" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A78BFA" />
        <stop offset="0.5" stopColor="#C084FC" />
        <stop offset="1" stopColor="#F472B6" />
      </linearGradient>
    </defs>
  </svg>
);

const NoMatchesIllustration = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 80 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="36" fill="url(#empty-matches-grad)" opacity="0.3" />
    <path d="M40 28c-4.4 0-8 3.6-8 8 0 3 4 8 8 12 4-4 8-9 8-12 0-4.4-3.6-8-8-8z" fill="url(#empty-matches-grad)" stroke="url(#empty-matches-grad)" strokeWidth="1.5" />
    <path d="M32 44c-2 2-4 6-4 10h24c0-4-2-8-4-10" stroke="url(#empty-matches-grad)" strokeWidth="1.5" fill="none" />
    <defs>
      <linearGradient id="empty-matches-grad" x1="20" y1="20" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A78BFA" />
        <stop offset="0.5" stopColor="#C084FC" />
        <stop offset="1" stopColor="#F472B6" />
      </linearGradient>
    </defs>
  </svg>
);

const NoMessagesIllustration = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 80 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="36" fill="url(#empty-msgs-grad)" opacity="0.3" />
    <path d="M24 32h32v20l-8 6-8-6-8 6-8-6V32z" fill="url(#empty-msgs-grad)" stroke="url(#empty-msgs-grad)" strokeWidth="1.5" />
    <path d="M28 36h24M28 42h16" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
    <defs>
      <linearGradient id="empty-msgs-grad" x1="20" y1="20" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A78BFA" />
        <stop offset="0.5" stopColor="#C084FC" />
        <stop offset="1" stopColor="#F472B6" />
      </linearGradient>
    </defs>
  </svg>
);

const ILLUSTRATIONS = {
  venues: NoVenuesIllustration,
  matches: NoMatchesIllustration,
  messages: NoMessagesIllustration,
} as const;

interface EmptyStateProps {
  icon?: LucideIcon;
  illustrationVariant?: keyof typeof ILLUSTRATIONS;
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
  illustrationVariant,
  title,
  description,
  action,
  secondaryAction,
  className,
  variant = 'default',
}) => {
  const isCompact = variant === 'compact';
  const isCard = variant === 'card';
  const Illustration = illustrationVariant ? ILLUSTRATIONS[illustrationVariant] : null;

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
      {(Icon || Illustration) && (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3, type: 'spring', stiffness: 200 }}
          className={cn(
            "mx-auto rounded-full flex items-center justify-center mb-5",
            "bg-gradient-to-br from-violet-900/50 to-violet-900/30",
            "ring-2 ring-violet-500/10 shadow-lg shadow-violet-500/10",
            isCompact ? 'w-14 h-14' : 'w-20 h-20'
          )}
        >
          {Illustration ? (
            <Illustration className={cn(isCompact ? 'w-9 h-9' : 'w-12 h-12')} />
          ) : Icon ? (
            <Icon className={cn(
              "text-violet-400",
              isCompact ? 'w-7 h-7' : 'w-10 h-10'
            )} />
          ) : null}
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
                "text-white font-semibold shadow-lg shadow-violet-500/30",
                "transition-all duration-200 hover:shadow-violet-500/30 hover:scale-[1.02]",
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

