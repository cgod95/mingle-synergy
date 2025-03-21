
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
        "flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.08)]",
        isVisible 
          ? "bg-gradient-to-r from-[#EBF2FF] to-[#F9FAFB] text-[#3A86FF]" 
          : "bg-[#F9FAFB] text-[#6B7280]",
        className
      )}
      aria-label={isVisible ? "Go invisible" : "Go visible"}
    >
      <span className="text-button">
        {isVisible ? "You're visible" : "You're invisible"}
      </span>
      
      <div className={cn(
        "w-12 h-7 rounded-full p-1 transition-colors duration-300",
        isVisible ? "bg-[#3A86FF]" : "bg-[#E5E7EB]"
      )}>
        <div className={cn(
          "w-5 h-5 rounded-full transform transition-transform duration-300 flex items-center justify-center shadow-sm",
          isVisible ? "translate-x-5 bg-white" : "translate-x-0 bg-white"
        )}>
          {isVisible ? (
            <Eye className="w-3 h-3 text-[#3A86FF]" />
          ) : (
            <EyeOff className="w-3 h-3 text-[#6B7280]" />
          )}
        </div>
      </div>
    </button>
  );
};

export default ToggleButton;
