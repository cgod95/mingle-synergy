import React from 'react';
import { User } from '@/types/user';

interface UserListProps {
  users: User[];
}

const UserList: React.FC<UserListProps> = ({ users }) => {
  if (users.length === 0) {
    return <p className="text-sm text-gray-500">No one is currently checked in.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {users.map((user) => (
        <div key={user.id} className="border p-2 rounded shadow">
          {user.photoURL && (
            <img src={user.photoURL} alt={user.name} className="w-full h-32 object-cover rounded" />
          )}
          <div className="mt-2">
            <h2 className="text-lg font-bold">{user.name}</h2>
            <p className="text-sm text-gray-600">{user.bio}</p>
            {user.age && <p className="text-sm text-gray-500">{user.age} years old</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList; 