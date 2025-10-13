// src/components/UserCard.tsx

import React, { useState } from 'react';
import { UserProfile } from '@/types/UserProfile';
import { checkForMatchAndCreate, likeUser } from '@/services/firebase/userService';
import { useUser } from '@/hooks/useUser';
import logger from '@/utils/Logger';

type UserCardProps = {
  user: UserProfile;
};

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const { currentUser } = useUser();
  const [isLiked, setIsLiked] = useState<boolean>(false);

  const handleLikeToggle = async () => {
    try {
      await likeUser(currentUser, user.id);
      await checkForMatchAndCreate(currentUser, user.id);
      setIsLiked(true);
    } catch (error) {
      logger.error('Error liking user:', error);
    }
  };

  return (
    <div className="border p-4 rounded-lg shadow bg-white">
      <h3 className="text-lg font-semibold">{user.name}, {user.age}</h3>
      <p className="text-sm text-gray-600 mb-2">{user.bio}</p>
      {user.photos && user.photos.length > 0 && (
        <img src={user.photos[0]} alt={user.name} className="w-full h-48 object-cover rounded-md mb-4" />
      )}
      <button
        onClick={handleLikeToggle}
        disabled={isLiked}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {isLiked ? 'Liked' : 'Like'}
      </button>
    </div>
  );
};

export default UserCard;