// Demo Welcome Screen - Introduces demo mode and auto-completes onboarding

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { Sparkles, Heart, MapPin, MessageCircle, Zap } from 'lucide-react';
import config from '@/config';

export default function DemoWelcome() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { setOnboardingStepComplete } = useOnboarding();

  useEffect(() => {
    // Auto-complete all onboarding steps for demo user
    if (config.DEMO_MODE && currentUser) {
      setOnboardingStepComplete('email');
      setOnboardingStepComplete('profile');
      setOnboardingStepComplete('photo');
      setOnboardingStepComplete('preferences');
      
      // Mark onboarding as complete in localStorage for demo mode
      localStorage.setItem('onboardingComplete', 'true');
      localStorage.setItem('profileComplete', 'true');
      
      // Seed demo data (likes and conversations) when entering demo mode
      try {
        const { ensureDemoLikesSeed } = require('@/lib/likesStore');
        const { ensureDemoThreadsSeed } = require('@/lib/chatStore');
        ensureDemoLikesSeed();
        ensureDemoThreadsSeed();
      } catch (error) {
        console.warn('Failed to seed demo data:', error);
      }
    }
  }, [currentUser, setOnboardingStepComplete]);

  const handleEnterDemo = () => {
    // Navigate to check-in page - demo user has full access
    navigate('/checkin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 border-indigo-200 shadow-xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to Demo Mode
            </CardTitle>
            <CardDescription className="text-base">
              Experience Mingle with full access - no restrictions, no limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-100">
                  <Zap className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Full Access</h3>
                  <p className="text-sm text-neutral-600">
                    Unlimited likes, messages, and matches - everything unlocked
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Populated Venues</h3>
                  <p className="text-sm text-neutral-600">
                    Explore 8 venues with 26 active users ready to connect
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-pink-100">
                  <MessageCircle className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Real Conversations</h3>
                  <p className="text-sm text-neutral-600">
                    See how people connect and meet up in real places
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-100">
                  <Heart className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Serendipity</h3>
                  <p className="text-sm text-neutral-600">
                    Experience the magic of meeting people where you are
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleEnterDemo}
                className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg"
                size="lg"
              >
                Enter Demo Mode
              </Button>
              <p className="text-xs text-center text-neutral-500 mt-3">
                Your demo session is ready - start exploring venues and meeting people!
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

