import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ListRowProps {
  leading?: ReactNode;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  className?: string;
}

export function ListRow({ leading, title, subtitle, trailing, onPress, destructive = false, className }: ListRowProps) {
  const Comp = onPress ? 'button' : 'div';

  return (
    <Comp
      onClick={onPress}
      className={cn(
        'flex items-center gap-3 w-full min-h-[48px] px-4 py-3 rounded-xl transition-colors',
        onPress && 'hover:bg-neutral-800/50 active:bg-neutral-800 cursor-pointer text-left',
        className
      )}
    >
      {leading && <div className="flex-shrink-0">{leading}</div>}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-base font-medium truncate',
          destructive ? 'text-red-400' : 'text-white'
        )}>
          {title}
        </p>
        {subtitle && (
          <p className="type-caption truncate">{subtitle}</p>
        )}
      </div>
      {trailing && <div className="flex-shrink-0">{trailing}</div>}
    </Comp>
  );
}
