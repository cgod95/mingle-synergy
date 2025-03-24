
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
    <div className="text-center py-12 bg-card rounded-t-2xl rounded-b-none border border-border/30 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#BDD9DC]/20 mb-4">
        <Users className="w-8 h-8 text-[#7B8794]" stroke-width={2} />
      </div>
      <h3 className="text-xl font-semibold mb-2 font-serif">{message}</h3>
      <p className="text-[#7B8794] max-w-sm mx-auto mb-4">
        {description}
      </p>
    </div>
  );
};

export default EmptyState;
