import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '@/types/services';
import { useAuth } from '@/context/AuthContext';
import services from '@/services';
import { canRematch, createRematch } from '@/services/firebase/matchService';
import { logError } from '@/utils/errorHandler';

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
      logError(err as Error, { source: 'VenueUserGrid', action: 'handleLike', targetUserId, venueId });
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
      logError(err as Error, { source: 'VenueUserGrid', action: 'handleRematch', targetUserId, venueId });
    } finally {
      setLoading(prev => ({ ...prev, [targetUserId]: false }));
    }
  };

  // Filter out the current user from the display
  const otherUsers = users.filter(user => user.id !== currentUser?.uid);

  if (otherUsers.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-900/50 flex items-center justify-center">
          <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No one here yet</h3>
        <p className="text-sm text-neutral-400">Check back later or try another venue!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {otherUsers.map((user) => {
        const isRematchable = rematchableUsers.includes(user.id);
        const isLiked = likedIds.includes(user.id);
        const isLoading = loading[user.id];

        return (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -4 }}
            className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden shadow-sm hover:shadow-md transition-all"
          >
            <div className="relative h-48 w-full overflow-hidden bg-neutral-200">
              <img
                src={user.photos?.[0] || '/placeholder-avatar.png'}
                alt={user.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="text-base font-semibold text-white mb-1">
                {user.name}{user.age && <span className="text-neutral-400 font-normal">, {user.age}</span>}
              </h3>
              {user.bio && (
                <p className="text-sm text-neutral-400 mb-3 line-clamp-2">{user.bio}</p>
              )}
              
              {isRematchable && !isLiked ? (
                <button
                  onClick={() => handleRematch(user.id)}
                  disabled={isLoading}
                  className={`mt-2 w-full px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isLoading 
                      ? 'bg-neutral-700 cursor-not-allowed text-neutral-400' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                  }`}
                >
                  {isLoading ? 'Reconnecting...' : 'Reconnect 🔄'}
                </button>
              ) : (
                <button
                  onClick={() => handleLike(user.id)}
                  disabled={isLiked || isLoading}
                  className={`mt-2 w-full px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isLiked || isLoading
                      ? 'bg-neutral-700 cursor-not-allowed text-neutral-400' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                  }`}
                >
                  {isLiked ? 'Liked ❤️' : 'Like ❤️'}
                </button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
} 