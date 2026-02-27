import React, { ReactNode, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionProps {
  title?: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  expanded?: boolean;
  count?: number;
  countClassName?: string;
  className?: string;
  titleClassName?: string;
  onToggle?: (expanded: boolean) => void;
}

export function Section({
  title,
  children,
  collapsible = false,
  defaultExpanded = true,
  expanded: controlledExpanded,
  count,
  countClassName,
  className,
  titleClassName,
  onToggle,
}: SectionProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const expanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const toggle = () => {
    const next = !expanded;
    if (controlledExpanded === undefined) setInternalExpanded(next);
    onToggle?.(next);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {title && (
        <button
          type="button"
          onClick={collapsible ? toggle : undefined}
          className={cn(
            'flex items-center justify-between w-full text-left py-2',
            collapsible && 'cursor-pointer active:opacity-80',
            !collapsible && 'cursor-default',
            titleClassName
          )}
          aria-expanded={collapsible ? expanded : undefined}
          disabled={!collapsible}
        >
          <div className="flex items-center gap-2">
            <h2 className="type-title uppercase tracking-wider text-neutral-400">{title}</h2>
            {count !== undefined && (
              <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', countClassName ?? 'bg-neutral-800 text-neutral-300')}>
                {count}
              </span>
            )}
          </div>
          {collapsible && (
            <ChevronDown
              className={cn(
                'w-4 h-4 text-neutral-500 transition-transform duration-200',
                expanded && 'rotate-180'
              )}
            />
          )}
        </button>
      )}
      <div
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-200 ease-out',
          expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
