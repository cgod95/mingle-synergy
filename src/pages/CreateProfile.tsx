// CreateProfile - Dark theme with brand purple

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '@/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOnboarding } from '@/context/OnboardingContext';
import { ArrowLeft, Loader2, User, ChevronRight } from 'lucide-react';
import analytics from '@/services/appAnalytics';
import { motion, AnimatePresence } from 'framer-motion';
import { retryWithMessage } from '@/utils/retry';
import { logError } from '@/utils/errorHandler';

const ageOptions = Array.from({ length: 83 }, (_, i) => i + 18);
const genderOptions = [
  { value: 'man', label: 'Man' },
  { value: 'woman', label: 'Woman' },
];
const interestedInOptions = [
  { value: 'everyone', label: 'Everyone' },
  { value: 'women', label: 'Women' },
  { value: 'men', label: 'Men' },
];

export default function CreateProfile() {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('man');
  const [interestedIn, setInterestedIn] = useState<string>('everyone');
  const [age, setAge] = useState(25);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const navigate = useNavigate();
  const { setOnboardingStepComplete, onboardingProgress } = useOnboarding();

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

  useEffect(() => {
    if (onboardingProgress.profile) {
      try {
        navigate('/photo-upload');
      } catch (error) {
        logError(error as Error, { context: 'CreateProfile.navigate', step: 'photo-upload' });
      }
      return;
    }

    try {
      const saved = localStorage.getItem('onboarding_profile_draft');
      if (saved) {
        const draft = JSON.parse(saved);
        setName(draft.name || '');
        setGender(draft.gender || 'man');
        setInterestedIn(draft.interestedIn || 'everyone');
        setAge(draft.age || 25);
      }
    } catch (e) {
      // Ignore
    }
  }, [onboardingProgress.profile, navigate]);

  useEffect(() => {
    if (name) {
      localStorage.setItem('onboarding_profile_draft', JSON.stringify({
        name, gender, interestedIn, age,
      }));
    }
  }, [name, gender, interestedIn, age]);

  const handleSubmit = async () => {
    if (!auth.currentUser || !auth.currentUser.uid) {
      setError('User not authenticated. Please sign in again.');
      navigate('/signin');
      return;
    }
    
    if (!firestore) {
      setError('Firebase is not initialized. Please refresh the page.');
      return;
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
        interestedIn,
        age,
        ageRangePreference: { min: 18, max: 99 },
        matches: [],
        likedUsers: [],
        blockedUsers: []
      };

      if (!auth.currentUser || !auth.currentUser.uid) {
        throw new Error('User not authenticated. Please sign in again.');
      }
      
      await retryWithMessage(
        async () => {
          const ref = doc(firestore, 'users', auth.currentUser!.uid);
          
          let userDocExists = false;
          try {
            const userDoc = await getDoc(ref);
            userDocExists = userDoc.exists();
          } catch (error: any) {
            if (error?.code === 'permission-denied') {
              userDocExists = false;
            } else {
              throw error;
            }
          }
          
          if (!userDocExists) {
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
          
          await setDoc(ref, profileData, { merge: true });
        },
        { 
          operationName: 'saving profile',
          maxRetries: 3,
          onRetry: (attempt: number) => setRetryCount(attempt)
        }
      );
      
      localStorage.removeItem('onboarding_profile_draft');
      
      analytics.track('onboarding_step_completed', {
        step: 'profile',
        step_number: 1,
        retry_count: retryCount,
      });
      
      setOnboardingStepComplete('profile');
      localStorage.setItem('profileComplete', 'true');
      localStorage.setItem('onboarding_last_step', 'profile');
      
      try {
        navigate('/photo-upload');
      } catch (navError) {
        logError(navError as Error, { source: 'CreateProfile', action: 'navigate', target: '/photo-upload' });
        window.location.href = '/photo-upload';
      }
    } catch (err: unknown) {
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

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.15)_0%,_transparent_50%)]" />
      
      {/* Progress bar */}
      <div className="w-full h-1 bg-[#1a1a24]">
        <div className="h-full w-1/2 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9]" />
      </div>

      {/* Back button */}
      <div className="px-6 py-4">
        <button
          onClick={() => navigate('/signup')}
          className="flex items-center text-[#6B7280] hover:text-white text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 pb-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto w-full"
        >
          {/* Icon */}
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] flex items-center justify-center shadow-lg shadow-[#7C3AED]/30 mb-6">
            <User className="w-8 h-8 text-white" />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-[#A78BFA] text-sm font-semibold uppercase tracking-wider mb-2">Step 1 of 2</p>
            <h1 className="text-2xl font-bold text-white mb-2">Create your profile</h1>
            <p className="text-[#6B7280]">Tell us a bit about yourself</p>
          </div>

          {/* Form */}
          <div className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#9CA3AF]">Your name</label>
              <Input 
                placeholder="Enter your name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="bg-[#111118] border-[#2D2D3A] text-white placeholder:text-[#4B5563] focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] h-12 rounded-xl"
              />
            </div>
            
            {/* Age */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#9CA3AF]">Your age</label>
              <Select value={age.toString()} onValueChange={(v) => setAge(Number(v))}>
                <SelectTrigger className="bg-[#111118] border-[#2D2D3A] text-white h-12 rounded-xl focus:ring-[#7C3AED]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111118] border-[#2D2D3A]">
                  {ageOptions.map((ageOption) => (
                    <SelectItem key={ageOption} value={ageOption.toString()} className="text-white hover:bg-[#7C3AED]/20">
                      {ageOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Gender */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#9CA3AF]">I am a</label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="bg-[#111118] border-[#2D2D3A] text-white h-12 rounded-xl focus:ring-[#7C3AED]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111118] border-[#2D2D3A]">
                  {genderOptions.map((g) => (
                    <SelectItem key={g.value} value={g.value} className="text-white hover:bg-[#7C3AED]/20">
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Interested In */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#9CA3AF]">Interested in</label>
              <Select value={interestedIn} onValueChange={setInterestedIn}>
                <SelectTrigger className="bg-[#111118] border-[#2D2D3A] text-white h-12 rounded-xl focus:ring-[#7C3AED]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111118] border-[#2D2D3A]">
                  {interestedInOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white hover:bg-[#7C3AED]/20">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl"
                >
                  <p className="text-sm text-red-400">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={!name.trim() || saving}
              className="w-full h-14 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#8B5CF6] hover:to-[#7C3AED] text-white font-semibold rounded-xl shadow-lg shadow-[#7C3AED]/25 transition-all disabled:opacity-50 mt-4"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {retryCount > 0 ? `Retrying... (${retryCount})` : 'Saving...'}
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
