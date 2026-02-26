// src/pages/CreateProfile.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
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
  const [isReady, setIsReady] = useState(false);
  const navigate = useNavigate();
  const { setOnboardingStepComplete, onboardingProgress } = useOnboarding();

  // Ensure Firebase is initialized before rendering
  useEffect(() => {
    if (!auth || !firestore) {
      setError('Firebase is not initialized. Please refresh the page.');
      return;
    }
    if (!auth.currentUser) {
      navigate('/signin');
      return;
    }
    setIsReady(true);
  }, [navigate]);

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
    if (name) {
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
    // Pre-flight checks
    if (!auth.currentUser || !auth.currentUser.uid) {
      setError('User not authenticated. Please sign in again.');
      navigate('/signin');
      return;
    }
    
    if (!firestore) {
      setError('Firebase is not initialized. Please refresh the page.');
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
          bio: bio.trim() || '',
          photos: [],
        isCheckedIn: false,
        isVisible: true,
        interests: [],
        gender,
        interestedIn: interestedInArray,
        age,
        ageRangePreference: { min: 18, max: 99 },
        matches: [],
        likedUsers: [],
        blockedUsers: []
      };

      // Use retry utility for network resilience
      // Verify auth state before operations
      if (!auth.currentUser || !auth.currentUser.uid) {
        throw new Error('User not authenticated. Please sign in again.');
      }
      
      await retryWithMessage(
        async () => {
          const ref = doc(firestore, 'users', auth.currentUser!.uid);
          
          // Check if document exists - handle permission errors gracefully
          let userDocExists = false;
          try {
            const userDoc = await getDoc(ref);
            userDocExists = userDoc.exists();
          } catch (error: any) {
            // If getDoc fails with permission denied, assume document doesn't exist
            if (error?.code === 'permission-denied') {
              userDocExists = false;
            } else {
              throw error; // Re-throw other errors
            }
          }
          
          if (!userDocExists) {
            // Document doesn't exist - create it WITHOUT merge (treats as CREATE operation)
            // This handles the case where sign-up didn't create the document
            await setDoc(ref, {
              email: auth.currentUser!.email || '',
              id: auth.currentUser!.uid,
              createdAt: new Date().toISOString(),
              photos: [],
              isCheckedIn: false,
              isVisible: true,
              interests: []
            });
          }
          
          // Now update with profile data using merge: true
          // This ensures we don't lose any existing data
          await setDoc(ref, profileData, { merge: true });
        },
        { 
          operationName: 'saving profile',
          maxRetries: 3,
          onRetry: (attempt: number) => setRetryCount(attempt)
        }
      );
      
      // Clear draft after successful save
      localStorage.removeItem('onboarding_profile_draft');
      
      // Track onboarding step completion
        analytics.track('onboarding_step_completed', {
          step: 'profile',
          step_number: 1,
          retry_count: retryCount,
        });
      
      setOnboardingStepComplete('profile');
      localStorage.setItem('profileComplete', 'true');
      localStorage.setItem('onboarding_last_step', 'profile');
      
      // Navigate to next step with error handling
      try {
        navigate('/photo-upload'); // Next step: photo upload
      } catch (navError) {
        // If navigation fails, use window.location as fallback
        logError(navError as Error, { source: 'CreateProfile', action: 'navigate', target: '/photo-upload' });
        window.location.href = '/photo-upload';
      }
    } catch (err: unknown) {
      // Enhanced error handling
      let errorMessage = 'Failed to save profile. Please try again.';
      
      if (err instanceof Error) {
        const errorCode = (err as any).code || '';
        const errorMsg = err.message || '';
        
        if (errorCode === 'permission-denied' || errorMsg.includes('permission') || errorMsg.includes('Permission')) {
          errorMessage = 'Permission denied. Please ensure you are signed in and try again.';
          logError(err, { source: 'CreateProfile', action: 'handleSubmit', errorCode });
        } else if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorCode.includes('unavailable')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = errorMsg || 'Failed to save profile. Please try again.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Show loading state while checking Firebase/auth
  if (!isReady) {
    return (
      <Layout showBottomNav={false}>
        <div className="min-h-screen min-h-[100dvh] bg-neutral-900 flex items-center justify-center">
          <div className="text-center">
            <p className="text-neutral-300">Loading...</p>
            {error && <p className="text-red-400 mt-2">{error}</p>}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showBottomNav={false}>
      <div className="min-h-screen min-h-[100dvh] bg-neutral-900 overflow-y-auto safe-y">
        <div className="flex flex-col min-h-screen min-h-[100dvh] px-4 py-8">
          {/* Back */}
          <div className="flex-shrink-0 mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/signup')}
              className="text-violet-400 hover:text-violet-300 hover:bg-violet-900/30 -ml-2"
              size="icon"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 flex flex-col justify-start pt-[4vh] w-full max-w-sm mx-auto">
            {/* Progress */}
            <div className="flex items-center justify-center mb-6 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm font-semibold">1</div>
                <div className="w-10 h-0.5 bg-neutral-700 rounded"></div>
                <div className="w-8 h-8 rounded-full bg-neutral-800 text-neutral-500 flex items-center justify-center text-sm font-semibold">2</div>
              </div>
            </div>

            <div className="text-center mb-6 flex-shrink-0">
              <h1 className="text-3xl font-bold text-white">Create your profile</h1>
              <p className="text-base text-neutral-300 mt-2">Tell us about yourself</p>
            </div>

            <div className="space-y-4 flex-shrink-0">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-neutral-300">Name</label>
                <Input 
                  placeholder="Your name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl h-12"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-neutral-300">Age</label>
                <Select value={age.toString()} onValueChange={(v) => setAge(Number(v))}>
                  <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white rounded-xl h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700">
                    {ageOptions.map((ageOption) => (
                      <SelectItem key={ageOption} value={ageOption.toString()}>
                        {ageOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-neutral-300">Gender</label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white rounded-xl h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700">
                    {genderOptions.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-neutral-300">Interested in</label>
                <Select value={interestedIn} onValueChange={setInterestedIn}>
                  <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white rounded-xl h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700">
                    {interestedInOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-neutral-300">Bio <span className="text-neutral-500 font-normal">(optional)</span></label>
                <textarea
                  placeholder="Tell people a little about yourself"
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 200))}
                  maxLength={200}
                  rows={3}
                  className="w-full bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none rounded-xl p-3 text-base resize-none"
                />
                <p className="text-xs text-neutral-500 text-right">{bio.length}/200</p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3 bg-red-900/30 rounded-xl"
                  >
                    <p className="text-sm text-red-400">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <Button
                onClick={handleSubmit}
                loading={saving}
                className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-base rounded-2xl"
                disabled={!name.trim() || saving}
              >
                {saving ? (
                  retryCount > 0 ? `Retrying... (${retryCount})` : 'Saving...'
                ) : (
                  'Continue'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}