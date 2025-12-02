import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import config from '@/config';
import userService from '@/services/firebase/userService';
import { mockUsers } from '@/data/mock';
import { ArrowLeft } from 'lucide-react';
import analytics from '@/services/appAnalytics';
import { logError } from '@/utils/errorHandler';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const ageOptions = Array.from({ length: 83 }, (_, i) => i + 18); // ages 18–100
const genderOptions = ['Women', 'Men', 'Everyone'];

export default function Preferences() {
  const { currentUser } = useAuth();
  const { setOnboardingStepComplete } = useOnboarding();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [minAge, setMinAge] = useState(25);
  const [maxAge, setMaxAge] = useState(35);
  const [genderPref, setGenderPref] = useState('Everyone');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Store uid in local variable to prevent race conditions
        const userId = currentUser?.uid;
        if (!userId) {
          setLoading(false);
          return;
        }

        if (config.DEMO_MODE) {
          // Demo mode: use mock data
          const user = mockUsers.find(u => u.id === userId);
          if (user?.ageRangePreference) {
            setMinAge(user.ageRangePreference.min);
            setMaxAge(user.ageRangePreference.max);
          }
          if (user?.interestedIn) {
            if (user.interestedIn.includes('female') && user.interestedIn.includes('male')) {
              setGenderPref('Everyone');
            } else if (user.interestedIn.includes('female')) {
              setGenderPref('Women');
            } else if (user.interestedIn.includes('male')) {
              setGenderPref('Men');
            }
          }
        } else {
          // Production: load from Firebase
          const profile = await userService.getUserProfile(userId);
          if (profile?.ageRangePreference) {
            setMinAge(profile.ageRangePreference.min);
            setMaxAge(profile.ageRangePreference.max);
          }
          if (profile?.interestedIn) {
            const interestedIn = Array.isArray(profile.interestedIn) ? profile.interestedIn : [];
            if (interestedIn.includes('female') && interestedIn.includes('male')) {
              setGenderPref('Everyone');
            } else if (interestedIn.includes('female')) {
              setGenderPref('Women');
            } else if (interestedIn.includes('male')) {
              setGenderPref('Men');
            }
          }
        }
      } catch (error) {
        logError(error as Error, { context: 'Preferences.fetchPreferences', userId: currentUser?.uid || 'unknown' });
        toast({
          title: 'Error',
          description: 'Failed to load preferences. Using defaults.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [currentUser, toast]);

  const handleSubmit = async () => {
    if (!currentUser?.uid) return;
    
    // Validate age range
    if (minAge > maxAge) {
      toast({
        title: 'Invalid age range',
        description: 'Minimum age must be less than or equal to maximum age.',
        variant: 'destructive',
      });
      return;
    }
    
    setSaving(true);
    
    try {
      // Convert genderPref back to interestedIn format for compatibility
      let interestedIn: ('male' | 'female' | 'non-binary' | 'other')[] = [];
      if (genderPref === 'Everyone') {
        interestedIn = ['male', 'female'];
      } else if (genderPref === 'Women') {
        interestedIn = ['female'];
      } else if (genderPref === 'Men') {
        interestedIn = ['male'];
      }

      const updates = {
        ageRangePreference: { min: minAge, max: maxAge },
        interestedIn,
      };

      if (config.DEMO_MODE) {
        // Demo mode: save to localStorage
        // Preferences updated in demo mode
        localStorage.setItem(`preferences_${currentUser.uid}`, JSON.stringify(updates));
      } else {
        // Production: save to Firebase
        await userService.updateUserProfile(currentUser.uid, updates);
      }
      
      setOnboardingStepComplete('preferences');
      
      // Track onboarding completion
      analytics.track('onboarding_completed', {
        total_steps: 3,
        steps_completed: ['profile', 'photo', 'preferences'],
        skipped_steps: [],
      });
      
      toast({
        title: 'Preferences saved!',
        description: 'Your preferences have been updated successfully.',
      });
      
      // Navigate to check-in after a brief delay
      setTimeout(() => {
        navigate('/checkin');
      }, 1000);
    } catch (error) {
      logError(error as Error, { context: 'Preferences.handleSubmit', userId: currentUser?.uid || 'unknown' });
      toast({
        title: 'Failed to save',
        description: 'Could not save preferences. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 via-pink-50 to-white flex items-center justify-center">
          <LoadingSpinner size="lg" message="Loading preferences..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout showBottomNav={false}>
      <div className="min-h-screen bg-neutral-50 pb-20">
        <Card className="w-full max-w-md mx-auto mt-6 border-2 border-neutral-200 bg-white shadow-xl">
          <CardHeader className="text-center space-y-2 border-b border-neutral-200">
            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">1</div>
                <div className="w-12 h-1 bg-indigo-600 rounded"></div>
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">2</div>
                <div className="w-12 h-1 bg-indigo-600 rounded"></div>
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">3</div>
              </div>
            </div>
            <CardTitle className="text-heading-2">
              Set Your Preferences
            </CardTitle>
            <p className="text-sm text-neutral-700">Step 3 of 3: You can update these anytime in settings.</p>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-900">Gender preference</label>
                <Select value={genderPref} onValueChange={setGenderPref}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-900">Min Age</label>
                  <Select value={minAge.toString()} onValueChange={(v) => setMinAge(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ageOptions.map((age) => (
                        <SelectItem key={age} value={age.toString()}>
                          {age}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-900">Max Age</label>
                  <Select value={maxAge.toString()} onValueChange={(v) => setMaxAge(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ageOptions.map((age) => (
                        <SelectItem key={age} value={age.toString()}>
                          {age}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => navigate('/photo-upload')}
                disabled={saving}
                className="flex-1 border-2 border-neutral-300 hover:bg-neutral-50 text-neutral-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                loading={saving}
                disabled={saving || minAge > maxAge}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md"
              >
                {saving ? 'Saving...' : 'Finish Onboarding'}
              </Button>
            </div>
            
            {minAge > maxAge && (
              <p className="text-xs text-red-500 text-center">
                Minimum age must be less than or equal to maximum age.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      {/* BottomNav will show automatically after onboarding completes */}
    </Layout>
  );
}