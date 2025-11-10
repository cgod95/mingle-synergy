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
      navigate('/photo-upload'); // Next step: photo upload
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 via-pink-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-indigo-100 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 shadow-xl">
          <CardHeader className="text-center space-y-2 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-indigo-100">
            <CardTitle className="text-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
              Create Profile
            </CardTitle>
            <p className="text-sm text-neutral-700">Tell us a bit about you</p>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
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
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg"
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