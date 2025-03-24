
import React from 'react';
import { Heart } from 'lucide-react';

interface LikesCounterProps {
  count: number;
}

const LikesCounter: React.FC<LikesCounterProps> = ({ count }) => (
  <div className="mb-4 px-4 py-2 bg-blue-50 rounded-lg inline-flex items-center">
    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mr-2">
      {count}
    </div>
    <span className="text-sm font-medium text-blue-800">likes remaining</span>
  </div>
);

export default LikesCounter;
