import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserProfile } from '@/services/userService';
import { useUser } from '@/contexts/UserContext';
import Button from '@/components/ui/button';

const CreateProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const updatedUser = await createUserProfile({ ...user, name, bio });
      setUser(updatedUser);
      navigate('/upload-photos');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Create Profile</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
          required
          className="w-full px-4 py-2 border rounded"
        />
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Short Bio"
          className="w-full px-4 py-2 border rounded resize-none"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit">Next</Button>
      </form>
    </div>
  );
};

export default CreateProfile;