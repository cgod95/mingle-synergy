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
        gender,
        interestedIn,
        age,
      }));
    }
  }, [name, gender, interestedIn, age]);

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
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
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
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-neutral-700 bg-neutral-800 shadow-xl">
          <CardHeader className="text-center space-y-2 border-b border-neutral-700 bg-gradient-to-r from-neutral-800/50 via-neutral-800/50 to-neutral-800/50">
            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">1</div>
                <div className="w-12 h-1 bg-neutral-700 rounded"></div>
                <div className="w-8 h-8 rounded-full bg-neutral-700 text-neutral-400 flex items-center justify-center text-sm font-semibold">2</div>
              </div>
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent font-bold">
              Create Profile
            </CardTitle>
            <p className="text-sm text-neutral-300">Step 1 of 2: Tell us about you</p>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-300">Your name</label>
              <Input 
                placeholder="Enter your name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-neutral-800"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-300">Your age</label>
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
              <label className="block text-sm font-medium text-neutral-300">Gender</label>
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
              <label className="block text-sm font-medium text-neutral-300">Interested in</label>
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
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg"
                >
                  <p className="text-sm text-red-400 mb-2">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSubmit}
                    className="w-full border-red-700/50 text-red-400 hover:bg-red-900/20"
                  >
                    Retry
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => navigate('/signup')}
                className="flex-1 border-2 border-neutral-700 hover:bg-neutral-700 text-neutral-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                loading={saving}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-md"
                disabled={!name.trim() || saving}
              >
                {saving ? (
                  <span className="flex items-center justify-center">
                    {retryCount > 0 ? `Retrying... (${retryCount})` : 'Saving...'}
                  </span>
                ) : (
                  'Continue'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}