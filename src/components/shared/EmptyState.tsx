
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
    <div className="text-center py-12 bg-bg-secondary rounded-lg border border-bg-tertiary/30 shadow-sm">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-accent/20 mb-4">
        <Users className="w-8 h-8 text-text-secondary" stroke-width={2} />
      </div>
      <h3 className="text-xl font-semibold mb-2 font-serif">{message}</h3>
      <p className="text-text-secondary max-w-sm mx-auto mb-4">
        {description}
      </p>
    </div>
  );
};

export default EmptyState;
