import React, { useState } from 'react';
import { Heart, HeartOff } from 'lucide-react';
import { logError } from '@/utils/errorHandler';

interface LikeButtonProps {
  isLiked: boolean;
  onToggle: () => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({ isLiked, onToggle }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onToggle();
    } catch (error) {
      logError(error as Error, { source: 'LikeButton', action: 'handleClick' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="focus:outline-none"
      aria-label={isLiked ? 'Unlike' : 'Like'}
    >
      {isLiked ? (
        <Heart className="text-red-500 w-6 h-6 fill-current" />
      ) : (
        <HeartOff className="text-gray-400 w-6 h-6" />
      )}
    </button>
  );
};

export default LikeButton;