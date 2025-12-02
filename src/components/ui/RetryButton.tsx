import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

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
      <div className="inline-flex items-center gap-2">
        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Retrying...' : 'Retry'}
      </div>
    </Button>
  );
}








