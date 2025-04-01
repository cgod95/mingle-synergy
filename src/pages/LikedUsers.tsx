import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchUserProfile, UserProfile } from '@/services/firebase/userService';
import UserCard from '@/components/UserCard';

const LikedUsersPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [likedUsers, setLikedUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const loadLikedUsers = async () => {
      if (!currentUser?.uid) return;

      const profile = await fetchUserProfile(currentUser.uid);
      if (!profile || !profile.likedUsers) return;

      const promises = profile.likedUsers.map(uid => fetchUserProfile(uid));
      const users = await Promise.all(promises);

      const validUsers = users.filter((user): user is UserProfile => user !== null);
      setLikedUsers(validUsers);
    };

    loadLikedUsers();
  }, [currentUser]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">People You Liked</h2>
      <div className="space-y-4">
        {likedUsers.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
};

export default LikedUsersPage;