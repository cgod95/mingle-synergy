// src/pages/CreateProfile.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import { Button } from '@/components/ui/button';

const CreateProfile: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setCreating(true);

    try {
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        name,
        age: parseInt(age),
        bio,
        photos: [],
        createdAt: new Date().toISOString(),
      });
      navigate('/upload-photos');
    } catch (err) {
      console.error('Error creating profile:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Create Your Profile</h1>

      <input
        type="text"
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      <input
        type="number"
        placeholder="Your Age"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      <textarea
        placeholder="Short Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      <Button onClick={handleCreate} disabled={creating} className="w-full">
        {creating ? 'Creating...' : 'Continue'}
      </Button>
    </div>
  );
};

export default CreateProfile;