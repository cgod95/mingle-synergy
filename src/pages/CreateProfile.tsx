// src/pages/CreateProfile.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '@/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/context/OnboardingContext';

export default function CreateProfile() {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setOnboardingStepComplete } = useOnboarding();

  const handleSubmit = async () => {
    if (!auth.currentUser) return;
    try {
      const ref = doc(firestore, 'users', auth.currentUser.uid);
      await setDoc(ref, {
        id: auth.currentUser.uid,
        name,
        bio,
        photos: [],
        isCheckedIn: false,
        isVisible: true,
        interests: [],
        gender: 'other',
        interestedIn: ['female', 'male', 'non-binary', 'other'],
        age: 18,
        ageRangePreference: { min: 18, max: 99 },
        matches: [],
        likedUsers: [],
        blockedUsers: []
      });
      setOnboardingStepComplete('profile');
      navigate('/photo-upload');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-3xl font-bold text-center">Create Profile</h1>
        <p className="text-sm text-muted-foreground text-center">Tell us a bit about you</p>

        <div className="space-y-4">
          <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Short bio" value={bio} onChange={(e) => setBio(e.target.value)} />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={!name.trim() || !bio.trim()}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}