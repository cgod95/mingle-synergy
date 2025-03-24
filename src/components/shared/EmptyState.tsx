
import React from 'react';
import { Users } from 'lucide-react';

interface EmptyStateProps {
  message: string;
  description?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  message, 
  description = "Be the first to check in" 
}) => {
  return (
    <div className="text-center py-12 bg-card rounded-xl border border-border/30 shadow-bubble">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
        <Users className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-medium mb-2">{message}</h3>
      <p className="text-muted-foreground max-w-sm mx-auto mb-4">
        {description}
      </p>
    </div>
  );
};

export default EmptyState;
