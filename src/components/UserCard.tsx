// UserCard - Dark theme with brand purple

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Loader2 } from 'lucide-react';
import { UserProfile } from '@/types/UserProfile';
import { likeUserWithMutualDetection } from '@/services/firebase/matchService';
import { useUser } from '@/hooks/useUser';
import { logError } from '@/utils/errorHandler';
import { Button } from '@/components/ui/button';
import { getCheckedVenueId } from '@/lib/checkinStore';

type UserCardProps = {
  user: UserProfile;
  venueId?: string;
};

const UserCard: React.FC<UserCardProps> = ({ user, venueId: propVenueId }) => {
  const { currentUser } = useUser();
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isLiking, setIsLiking] = useState<boolean>(false);

  const handleLikeToggle = async () => {
    if (isLiking || isLiked || !currentUser) return;
    
    setIsLiking(true);
    try {
      const venueId = propVenueId || getCheckedVenueId() || '';
      
      if (!venueId) {
        throw new Error('No venue ID available. Please check in to a venue first.');
      }
      
      await likeUserWithMutualDetection(currentUser.uid || currentUser.id, user.id || user.uid || '', venueId);
      setIsLiked(true);
    } catch (error) {
      logError(error as Error, { source: 'UserCard', action: 'likeUser', targetUserId: user.id });
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#111118] border border-[#2D2D3A] group"
    >
      {/* User Image */}
      <div className="absolute inset-0">
        {user.photos && user.photos.length > 0 ? (
          <img
            src={user.photos[0]}
            alt={user.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] flex items-center justify-center">
            <span className="text-5xl font-bold text-white/80">
              {user.name?.charAt(0) || 'U'}
            </span>
          </div>
        )}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Age badge */}
      {user.age && (
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm font-medium">
            {user.age}
          </span>
        </div>
      )}

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {/* Name */}
        <h3 className="text-xl font-bold text-white mb-3">
          {user.name}
          {user.age && <span className="text-white/70 font-normal">, {user.age}</span>}
        </h3>

        {/* Like button */}
        <Button
          onClick={handleLikeToggle}
          disabled={isLiked || isLiking}
          className={`w-full h-11 font-semibold rounded-xl transition-all ${
            isLiked
              ? 'bg-green-600/20 text-green-400 border border-green-500/30'
              : 'bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#8B5CF6] hover:to-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/25'
          }`}
        >
          {isLiking ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Liking...
            </>
          ) : isLiked ? (
            <>
              <Heart className="w-4 h-4 mr-2 fill-green-400" />
              Liked
            </>
          ) : (
            <>
              <Heart className="w-4 h-4 mr-2" />
              Like
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default UserCard;
