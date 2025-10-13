import { useState, useEffect } from 'react';
import { UserProfile } from '@/types/services';
import { useAuth } from '@/context/AuthContext';
import services from '@/services';
import { canRematch, createRematch } from '@/services/firebase/matchService';
import logger from '@/utils/Logger';

type Props = {
  users: UserProfile[];
  venueId: string;
  venueName: string;
};

export default function VenueUserGrid({ users, venueId, venueName }: Props) {
  const { currentUser } = useAuth();
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [rematchableUsers, setRematchableUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  // Check for rematchable users on component mount
  useEffect(() => {
    const checkRematches = async () => {
      if (!currentUser?.uid) return;
      
      const rematchable: string[] = [];
      for (const user of users) {
        if (user.id !== currentUser.uid) {
          const canRematchUser = await canRematch(currentUser.uid, user.id);
          if (canRematchUser) {
            rematchable.push(user.id);
          }
        }
      }
      setRematchableUsers(rematchable);
    };

    checkRematches();
  }, [currentUser?.uid, users]);

  const handleLike = async (targetUserId: string) => {
    if (!currentUser?.uid || likedIds.includes(targetUserId)) return;
    
    try {
      await services.interest.expressInterest(currentUser.uid, targetUserId, venueId);
      setLikedIds(prev => [...prev, targetUserId]);
    } catch (err) {
      logger.error('Like failed:', err);
    }
  };

  const handleRematch = async (targetUserId: string) => {
    if (!currentUser?.uid) return;
    
    setLoading(prev => ({ ...prev, [targetUserId]: true }));
    
    try {
      await createRematch(currentUser.uid, targetUserId, venueId);
      // Remove from rematchable users since we've created a new match
      setRematchableUsers(prev => prev.filter(id => id !== targetUserId));
      // Add to liked users to show the new match
      setLikedIds(prev => [...prev, targetUserId]);
    } catch (err) {
      logger.error('Rematch failed:', err);
    } finally {
      setLoading(prev => ({ ...prev, [targetUserId]: false }));
    }
  };

  // Filter out the current user from the display
  const otherUsers = users.filter(user => user.id !== currentUser?.uid);

  if (otherUsers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No other users at this venue right now.</p>
        <p className="text-sm text-gray-400 mt-2">Check back later or try another venue!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {otherUsers.map((user) => {
        const isRematchable = rematchableUsers.includes(user.id);
        const isLiked = likedIds.includes(user.id);
        const isLoading = loading[user.id];

        return (
          <div
            key={user.id}
            className="bg-white rounded-xl p-4 shadow hover:shadow-lg transition"
          >
            <img
              src={user.photos?.[0] || '/placeholder-avatar.png'}
              alt={user.name}
              className="w-full h-40 object-cover rounded-lg mb-2"
            />
            <h3 className="text-lg font-semibold">{user.name}, {user.age}</h3>
            <p className="text-sm text-gray-600">{user.bio || 'No bio available'}</p>
            
            {isRematchable && !isLiked ? (
              <button
                onClick={() => handleRematch(user.id)}
                disabled={isLoading}
                className={`mt-2 w-full px-4 py-1 rounded ${
                  isLoading 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {isLoading ? 'Reconnecting...' : 'Reconnect 🔄'}
              </button>
            ) : (
              <button
                onClick={() => handleLike(user.id)}
                disabled={isLiked || isLoading}
                className={`mt-2 w-full px-4 py-1 rounded ${
                  isLiked || isLoading
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-pink-500 hover:bg-pink-600 text-white'
                }`}
              >
                {isLiked ? 'Liked ❤️' : 'Like ❤️'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
} 