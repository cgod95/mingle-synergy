import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface RetryButtonProps {
  onRetry: () => void;
  isLoading?: boolean;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'destructive' | 'ghost';
}

export function RetryButton({
  onRetry,
  isLoading = false,
  className = '',
  size = 'default',
  variant = 'outline',
}: RetryButtonProps) {
  return (
    <Button
      onClick={onRetry}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      <motion.div
        animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: 'linear' }}
        className="inline-flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        {isLoading ? 'Retrying...' : 'Retry'}
      </motion.div>
    </Button>
  );
}



