import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Switch } from "@/components/ui/switch";

interface VisibilityToggleProps {
  isVisible: boolean;
  onToggle: () => void;
  isLoading?: boolean;
}

const VisibilityToggle: React.FC<VisibilityToggleProps> = ({ 
  isVisible, 
  onToggle,
  isLoading = false
}) => {
  return (
    <div className="bg-secondary rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {isVisible ? 
            <Eye className="w-5 h-5 text-foreground mr-3" /> : 
            <EyeOff className="w-5 h-5 text-text-tertiary mr-3" />
          }
          <div>
            <h2 className="text-foreground font-medium">Visibility</h2>
            <p className="text-sm text-muted-foreground">
              {isVisible ? 
                'You are visible to others at this venue' : 
                'You are invisible to others at this venue'}
            </p>
          </div>
        </div>
        
        <Switch
          checked={isVisible}
          onCheckedChange={onToggle}
          disabled={isLoading}
          className={`${isLoading ? 'opacity-50' : ''} data-[state=checked]:bg-brand-primary`}
        />
      </div>
    </div>
  );
};

export default VisibilityToggle;
