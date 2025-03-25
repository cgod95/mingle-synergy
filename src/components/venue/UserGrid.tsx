
import React from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../ui/OptimizedImage';

interface UserGridProps {
  users: Array<{
    id: string;
    name?: string; // Changed to optional to match User type
    age?: number;
    photos: string[];
  }>;
  onLikeUser: (userId: string) => void;
  likesRemaining: number;
  likedUsers: string[];
}

const UserGrid: React.FC<UserGridProps> = ({ users, onLikeUser, likesRemaining, likedUsers }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {users.map(user => (
        <div key={user.id} className="bg-white rounded-lg overflow-hidden shadow-sm">
          <div className="aspect-square relative">
            <OptimizedImage
              src={user.photos[0]}
              alt={user.name || 'User'}
              placeholderName={user.name || 'User'}
              className="w-full h-full object-cover"
            />
            
            <button
              onClick={() => onLikeUser(user.id)}
              disabled={likesRemaining <= 0 || likedUsers.includes(user.id)}
              className={`absolute bottom-2 right-2 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                likedUsers.includes(user.id) 
                ? 'bg-brand-primary text-white' 
                : 'bg-white text-brand-primary'
              } ${likesRemaining <= 0 && !likedUsers.includes(user.id) ? 'opacity-50' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={likedUsers.includes(user.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
          
          <div className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{user.name || 'Unknown'}</h3>
                {user.age && <p className="text-sm text-gray-500">{user.age}</p>}
              </div>
              <Link 
                to={`/profile/${user.id}`}
                className="text-sm text-brand-primary font-medium"
              >
                View
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserGrid;
