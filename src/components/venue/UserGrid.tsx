
import React from 'react';
import { User, Interest, Match } from '@/types';
import UserCard from '@/components/UserCard';
import EmptyState from '@/components/shared/EmptyState';

interface UserGridProps {
  users: User[];
  interests: Interest[];
  setInterests: React.Dispatch<React.SetStateAction<Interest[]>>;
  matches: Match[];
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  currentUser: { id: string; name: string };
  likesRemaining: number;
  setLikesRemaining: React.Dispatch<React.SetStateAction<number>>;
  venueId: string;
}

const UserGrid: React.FC<UserGridProps> = ({
  users,
  interests,
  setInterests,
  matches,
  setMatches,
  currentUser,
  likesRemaining,
  setLikesRemaining,
  venueId
}) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-12 mt-10 bg-white rounded-xl border border-[#F1F5F9] shadow-[0px_2px_8px_rgba(0,0,0,0.05)]">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
          {/* Silhouette placeholder */}
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M32 32C38.6274 32 44 26.6274 44 20C44 13.3726 38.6274 8 32 8C25.3726 8 20 13.3726 20 20C20 26.6274 25.3726 32 32 32Z" fill="#F1F5F9"/>
            <path d="M54 56C54 42.7452 44.2548 32 32 32C19.7452 32 10 42.7452 10 56" stroke="#F1F5F9" strokeWidth="4"/>
          </svg>
        </div>
        <p className="text-[16px] text-[#505050]">No one here yet. Be the first.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 pb-16">
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          interests={interests}
          setInterests={setInterests}
          matches={matches}
          setMatches={setMatches}
          currentUser={currentUser}
          likesRemaining={likesRemaining}
          setLikesRemaining={setLikesRemaining}
          venueId={venueId}
        />
      ))}
    </div>
  );
};

export default UserGrid;
