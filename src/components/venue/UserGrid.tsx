
import React, { memo } from 'react';
import { User, Interest, Match } from '@/types';
import { Heart } from 'lucide-react';
import OptimizedImage from '../shared/OptimizedImage';

interface UserGridProps {
  users: User[];
  onLikeUser?: (userId: string) => void;
  likesRemaining: number;
  likedUsers?: string[];
  // ActiveVenue.tsx specific props
  interests?: Interest[];
  setInterests?: React.Dispatch<React.SetStateAction<Interest[]>>;
  matches?: Match[];
  setMatches?: React.Dispatch<React.SetStateAction<Match[]>>;
  currentUser?: { id: string; name: string };
  venueId?: string;
  setLikesRemaining?: React.Dispatch<React.SetStateAction<number>>;
}

const UserGrid: React.FC<UserGridProps> = ({ 
  users, 
  onLikeUser, 
  likesRemaining, 
  likedUsers = [],
  interests = [],
  setInterests,
  matches = [],
  setMatches,
  currentUser,
  venueId,
  setLikesRemaining
}) => {
  // Determine which users are already liked
  const effectiveLikedUsers = likedUsers.length > 0 
    ? likedUsers 
    : currentUser && interests.length > 0
      ? interests
          .filter(interest => interest.fromUserId === currentUser.id)
          .map(interest => interest.toUserId)
      : [];
  
  return (
    <div className="grid grid-cols-3 gap-3">
      {users.map(user => {
        const isLiked = effectiveLikedUsers.includes(user.id);
        
        return (
          <div key={user.id} className="relative rounded-xl overflow-hidden shadow-sm">
            <OptimizedImage 
              src={user.photos?.[0] || ''} 
              alt={user.name || 'User'}
              className="w-full aspect-square"
              width={300}
              height={300}
            />
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent">
              <div className="text-white">
                <div className="font-medium">{user.name}</div>
                {user.age && <div className="text-sm">{user.age}</div>}
              </div>
            </div>
            <button 
              onClick={() => {
                if (!isLiked && likesRemaining > 0 && onLikeUser) {
                  onLikeUser(user.id);
                }
              }}
              disabled={isLiked || likesRemaining <= 0}
              className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center ${
                isLiked ? 'bg-pink-500 text-white' : 
                likesRemaining > 0 ? 'bg-white/80 text-gray-600 hover:bg-gray-100' : 
                'bg-gray-300/80 text-gray-400'
              }`}
            >
              <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

// Export with memo to prevent unnecessary re-renders
export default memo(UserGrid);
