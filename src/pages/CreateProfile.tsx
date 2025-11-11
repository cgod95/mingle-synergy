// src/pages/CreateProfile.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '@/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOnboarding } from '@/context/OnboardingContext';
import Layout from '@/components/Layout';
import { ArrowLeft } from 'lucide-react';
import analytics from '@/services/appAnalytics';
import { motion, AnimatePresence } from 'framer-motion';
import { retryWithMessage } from '@/utils/retry';
import { logError } from '@/utils/errorHandler';

const ageOptions = Array.from({ length: 83 }, (_, i) => i + 18); // ages 18–100
const genderOptions = ['male', 'female', 'non-binary', 'other'];
const interestedInOptions = [
  { value: 'everyone', label: 'Doesn\'t matter' },
  { value: 'female', label: 'Women' },
  { value: 'male', label: 'Men' },
];

export default function CreateProfile() {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('other');
  const [interestedIn, setInterestedIn] = useState<string>('everyone');
  const [age, setAge] = useState(25);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  const { setOnboardingStepComplete, onboardingProgress } = useOnboarding();

  // Resume onboarding - load saved data if available
  useEffect(() => {
    if (onboardingProgress.profile) {
      // Profile already completed, skip to next step
      try {
        navigate('/photo-upload');
      } catch (error) {
        logError(error as Error, { context: 'CreateProfile.navigate', step: 'photo-upload' });
      }
      return;
    }

    // Try to load saved profile data from localStorage (for resume)
    try {
      const saved = localStorage.getItem('onboarding_profile_draft');
      if (saved) {
        const draft = JSON.parse(saved);
        setName(draft.name || '');
        setBio(draft.bio || '');
        setGender(draft.gender || 'other');
        setInterestedIn(draft.interestedIn || 'everyone');
        setAge(draft.age || 25);
      }
    } catch (e) {
      // Ignore errors loading draft
    }
  }, [onboardingProgress.profile, navigate]);

  // Save draft to localStorage as user types (for resume capability)
  useEffect(() => {
    if (name || bio) {
      localStorage.setItem('onboarding_profile_draft', JSON.stringify({
        name,
        bio,
        gender,
        interestedIn,
        age,
      }));
    }
  }, [name, bio, gender, interestedIn, age]);

  const handleSubmit = async () => {
    if (!auth.currentUser) return;
    
    // Validate bio length
    if (!bio.trim() || bio.trim().length < 10) {
      setError('Bio must be at least 10 characters long');
      return;
    }
    
    // Convert interestedIn from "everyone" to array
    let interestedInArray: ('male' | 'female' | 'non-binary' | 'other')[] = [];
    if (interestedIn === 'everyone') {
      interestedInArray = ['male', 'female'];
    } else {
      interestedInArray = [interestedIn as 'male' | 'female'];
    }
    
    setSaving(true);
    setError('');
    setRetryCount(0);
    
    try {
      const profileData = {
        id: auth.currentUser.uid,
        name,
        bio: bio.trim(),
        photos: [],
        isCheckedIn: false,
        isVisible: true,
        interests: [],
        gender,
        interestedIn: interestedInArray,
        age,
        ageRangePreference: { min: 18, max: 99 }, // Default, can be updated in preferences
        matches: [],
        likedUsers: [],
        blockedUsers: []
      };

      // Use retry utility for network resilience
      await retryWithMessage(
        async () => {
          const ref = doc(firestore, 'users', auth.currentUser.uid);
          await setDoc(ref, profileData);
        },
        { 
          operationName: 'saving profile',
          maxRetries: 3,
          onRetry: (attempt) => setRetryCount(attempt)
        }
      );
      
      // Clear draft after successful save
      localStorage.removeItem('onboarding_profile_draft');
      
      // Track onboarding step completion
      analytics.track('onboarding_step_completed', {
        step: 'profile',
        step_number: 1,
        has_bio: true,
        bio_length: bio.trim().length,
        retry_count: retryCount,
      });
      
      setOnboardingStepComplete('profile');
      localStorage.setItem('profileComplete', 'true');
      localStorage.setItem('onboarding_last_step', 'profile');
      navigate('/photo-upload'); // Next step: photo upload
    } catch (err: unknown) {
      // Enhanced error handling
      let errorMessage = 'Failed to save profile. Please try again.';
      
      if (err instanceof Error) {
        if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (err.message.includes('permission')) {
          errorMessage = 'Permission denied. Please sign in again.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout showBottomNav={false}>
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-neutral-200 bg-white shadow-xl">
          <CardHeader className="text-center space-y-2 border-b border-neutral-200">
            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">1</div>
                <div className="w-12 h-1 bg-indigo-200 rounded"></div>
                <div className="w-8 h-8 rounded-full bg-indigo-200 text-indigo-600 flex items-center justify-center text-sm font-semibold">2</div>
                <div className="w-12 h-1 bg-indigo-200 rounded"></div>
                <div className="w-8 h-8 rounded-full bg-indigo-200 text-indigo-600 flex items-center justify-center text-sm font-semibold">3</div>
              </div>
            </div>
            <CardTitle className="text-2xl text-neutral-900 font-bold">
              Create Profile
            </CardTitle>
            <p className="text-sm text-neutral-700">Step 1 of 3: Tell us about you</p>
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
              <label className="block text-sm font-medium text-neutral-900">Your age</label>
              <Select value={age.toString()} onValueChange={(v) => setAge(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ageOptions.map((ageOption) => (
                    <SelectItem key={ageOption} value={ageOption.toString()}>
                      {ageOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-900">Gender</label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-900">Interested in</label>
              <Select 
                value={interestedIn} 
                onValueChange={setInterestedIn}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {interestedInOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-900">
                Short bio <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="Tell us about yourself (e.g., interests, what you're looking for, etc.)"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={200}
                required
              />
              <p className="text-xs text-neutral-500">
                {bio.length}/200 characters {bio.length < 10 && '(minimum 10 characters required)'}
              </p>
            </div>
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-sm text-red-600 mb-2">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSubmit}
                    className="w-full border-red-300 text-red-700 hover:bg-red-100"
                  >
                    Retry
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => navigate('/onboarding')}
                className="flex-1 border-2 border-neutral-300 hover:bg-neutral-50 text-neutral-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md"
                disabled={!name.trim() || !bio.trim() || bio.trim().length < 10 || saving}
              >
                {saving ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    {retryCount > 0 ? `Retrying... (${retryCount})` : 'Saving...'}
                  </span>
                ) : (
                  'Continue'
                )}
              </Button>
            </div>
            {bio.trim().length > 0 && bio.trim().length < 10 && (
              <p className="text-xs text-red-500 text-center">
                Bio must be at least 10 characters long
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}