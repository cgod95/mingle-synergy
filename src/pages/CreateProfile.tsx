// src/pages/CreateProfile.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '@/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOnboarding } from '@/context/OnboardingContext';
import Layout from '@/components/Layout';

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
      localStorage.setItem('profileComplete', 'true');
      navigate('/photo-upload');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center space-y-2">
            <CardTitle>Create Profile</CardTitle>
            <p className="text-sm text-neutral-600">Tell us a bit about you</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-900">Your name</label>
              <Input 
                placeholder="Enter your name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-900">Short bio</label>
              <Input 
                placeholder="Tell us about yourself" 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
              />
            </div>
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            <Button
              onClick={handleSubmit}
              className="w-full"
              disabled={!name.trim() || !bio.trim()}
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}