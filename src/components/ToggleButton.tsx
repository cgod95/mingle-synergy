
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
        "flex items-center justify-between px-5 py-3.5 rounded-xl transition-all duration-300 shadow-sm",
        isVisible 
          ? "bg-gradient-to-r from-[#3A86FF]/15 to-[#3A86FF]/5 text-[#3A86FF]" 
          : "bg-muted text-muted-foreground",
        className
      )}
      aria-label={isVisible ? "Go invisible" : "Go visible"}
    >
      <span className="font-medium text-base">
        {isVisible ? "You're visible" : "You're invisible"}
      </span>
      
      <div className={cn(
        "w-12 h-7 rounded-full p-1 transition-colors duration-300",
        isVisible ? "bg-[#3A86FF]" : "bg-border"
      )}>
        <div className={cn(
          "w-5 h-5 rounded-full transform transition-transform duration-300 flex items-center justify-center",
          isVisible ? "translate-x-5 bg-white" : "translate-x-0 bg-muted-foreground"
        )}>
          {isVisible ? (
            <Eye className="w-3 h-3 text-[#3A86FF]" />
          ) : (
            <EyeOff className="w-3 h-3 text-muted" />
          )}
        </div>
      </div>
    </button>
  );
};

export default ToggleButton;
