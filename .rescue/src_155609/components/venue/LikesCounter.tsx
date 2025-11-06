import React from 'react';
import { Heart } from 'lucide-react';

interface LikesCounterProps {
  count: number;
}

const LikesCounter: React.FC<LikesCounterProps> = ({ count }) => (
  <div className="mb-4 px-4 py-2 bg-brand-accent/10 rounded-lg inline-flex items-center">
    <div className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs mr-2">
      {count}
    </div>
    <span className="text-sm font-medium text-foreground">likes remaining</span>
  </div>
);

export default LikesCounter;
