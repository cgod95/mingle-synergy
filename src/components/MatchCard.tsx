// src/components/MatchCard.tsx
import React from 'react';
import { Match } from '@/types/match.types';
import { MatchUser } from '@/types/match.types';

interface MatchCardProps {
  match: Match;
  user: MatchUser;
  onReconnectRequest: () => void;
  onShareContact: () => void;
  onWeMetClick: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, user, onReconnectRequest, onShareContact, onWeMetClick }) => {
  return (
    <div className="border p-4 rounded-lg shadow bg-white">
      <h3 className="text-lg font-semibold">{user.name}, {user.age}</h3>
      <p className="text-sm text-gray-600 mb-2">{user.bio}</p>
      {user.photos && user.photos.length > 0 && (
        <img src={user.photos[0]} alt={user.name} className="w-full h-48 object-cover rounded-md mb-4" />
      )}
    </div>
  );
};

export default MatchCard;
