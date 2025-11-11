// src/components/UserCard.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { UserProfile } from '@/types/UserProfile';
import { checkForMatchAndCreate, likeUser } from '@/services/firebase/userService';
import { useUser } from '@/hooks/useUser';
import { logError } from '@/utils/errorHandler';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type UserCardProps = {
  user: UserProfile;
};

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const { currentUser } = useUser();
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isLiking, setIsLiking] = useState<boolean>(false);

  const handleLikeToggle = async () => {
    if (isLiking || isLiked) return;
    
    setIsLiking(true);
    try {
      await likeUser(currentUser, user.id);
      await checkForMatchAndCreate(currentUser, user.id);
      setIsLiked(true);
    } catch (error) {
      logError(error as Error, { source: 'UserCard', action: 'likeUser', targetUserId: user.id });
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border border-neutral-200 hover:border-indigo-300 hover:shadow-md transition-all overflow-hidden bg-white">
        {/* User Image */}
        <div className="relative h-64 w-full overflow-hidden bg-neutral-200">
          {user.photos && user.photos.length > 0 ? (
            <img
              src={user.photos[0]}
              alt={user.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-indigo-600 text-white text-2xl font-bold">
                  {user.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
          {user.age && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-white/90 backdrop-blur-sm text-neutral-700 border border-neutral-200">
                {user.age}
              </Badge>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-neutral-900 truncate">
                {user.name}
                {user.age && <span className="text-neutral-600 font-normal">, {user.age}</span>}
              </h3>
            </div>
          </div>
          
          {user.bio && (
            <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{user.bio}</p>
          )}

          <Button
            onClick={handleLikeToggle}
            disabled={isLiked || isLiking}
            className={cn(
              "w-full",
              isLiked
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            )}
          >
            {isLiking ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Liking...
              </span>
            ) : isLiked ? (
              <>
                <Heart className="w-4 h-4 mr-2 fill-white" />
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
      </Card>
    </motion.div>
  );
};

export default UserCard;