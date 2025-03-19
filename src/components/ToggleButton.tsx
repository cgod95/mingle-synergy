
import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToggleButtonProps {
  isVisible: boolean;
  onToggle: () => void;
  className?: string;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ 
  isVisible, 
  onToggle,
  className 
}) => {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-300",
        isVisible 
          ? "bg-secondary text-foreground" 
          : "bg-muted text-muted-foreground",
        className
      )}
      aria-label={isVisible ? "Go invisible" : "Go visible"}
    >
      <span className="font-medium">
        {isVisible ? "You're visible" : "You're invisible"}
      </span>
      
      <div className={cn(
        "w-10 h-6 rounded-full p-1 transition-colors duration-300",
        isVisible ? "bg-primary" : "bg-border"
      )}>
        <div className={cn(
          "w-4 h-4 rounded-full transform transition-transform duration-300 flex items-center justify-center",
          isVisible ? "translate-x-4 bg-white" : "translate-x-0 bg-muted-foreground"
        )}>
          {isVisible ? (
            <Eye className="w-3 h-3 text-primary" />
          ) : (
            <EyeOff className="w-3 h-3 text-muted" />
          )}
        </div>
      </div>
    </button>
  );
};

export default ToggleButton;
