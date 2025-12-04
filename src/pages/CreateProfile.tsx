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
        has_bio: true,
        bio_length: bio.trim().length,
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
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-neutral-600">Loading...</p>
            {error && <p className="text-red-600 mt-2">{error}</p>}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showBottomNav={false}>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-primary/10 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-primary/20 bg-gradient-to-br from-background via-primary/5 to-primary/10 shadow-xl">
          <CardHeader className="text-center space-y-2 border-b border-primary/20 bg-gradient-to-r from-primary/10 via-primary/10 to-primary/10">
            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">1</div>
                <div className="w-12 h-1 bg-primary/20 rounded"></div>
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold">2</div>
                <div className="w-12 h-1 bg-primary/20 rounded"></div>
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold">3</div>
              </div>
            </div>
            <CardTitle className="text-heading-2">
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
                className="w-full min-h-[100px] px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:border-primary transition-all resize-none"
                placeholder="Tell us about yourself (e.g., interests, what you're looking for, etc.)"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={200}
                required
              />
              <p className="text-xs text-neutral-500">
                {bio.length}/200 characters
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
                onClick={() => navigate('/signup')}
                className="flex-1 border-2 border-neutral-300 hover:bg-neutral-50 text-neutral-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                loading={saving}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md"
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