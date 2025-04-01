import React from 'react';
import { UserProfile } from '@/types/UserProfile';

interface UserCardProps {
  user: UserProfile;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  return (
    <div className="p-4 border rounded-lg shadow">
      <img
        src={user.photos?.[0] || ''}
        alt={user.name}
        className="w-full h-32 object-cover rounded"
      />
      <div className="mt-2 font-semibold">{user.name}</div>
    </div>
  );
};

export default UserCard;