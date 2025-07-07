import React, { useState } from 'react';
import { Heart, HeartOff } from 'lucide-react';

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
      console.error('Failed to toggle like:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-full p-1 transition-colors"
      aria-label={isLiked ? 'Unlike' : 'Like'}
      aria-pressed={isLiked}
      aria-busy={loading}
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