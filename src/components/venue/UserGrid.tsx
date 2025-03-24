
import React from 'react';
import { User } from '@/types';
import { Heart } from 'lucide-react';

interface UserGridProps {
  users: User[];
  onLikeUser: (userId: string) => void;
  likesRemaining: number;
  likedUsers?: string[];
}

const UserGrid: React.FC<UserGridProps> = ({ 
  users, 
  onLikeUser, 
  likesRemaining, 
  likedUsers = [] 
}) => (
  <div className="grid grid-cols-3 gap-3">
    {users.map(user => {
      const isLiked = likedUsers.includes(user.id);
      
      return (
        <div key={user.id} className="relative rounded-xl overflow-hidden shadow-sm">
          <img 
            src={user.photos[0]} 
            alt={user.name}
            className="w-full aspect-square object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
            <div className="text-white">
              <div className="font-medium">{user.name}</div>
              {user.age && <div className="text-sm">{user.age}</div>}
            </div>
          </div>
          <button 
            onClick={() => !isLiked && likesRemaining > 0 && onLikeUser(user.id)}
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

export default UserGrid;
