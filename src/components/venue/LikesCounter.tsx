
import React from 'react';
import { Heart } from 'lucide-react';

interface LikesCounterProps {
  count: number;
}

const LikesCounter: React.FC<LikesCounterProps> = ({ count }) => {
  return (
    <div className="bg-white/90 px-3 py-1 rounded-full text-sm font-medium shadow-sm border border-gray-100 flex items-center mb-4">
      <Heart size={14} className="mr-1.5 text-[#3A86FF]" />
      <span>{count} likes remaining</span>
    </div>
  );
};

export default LikesCounter;
