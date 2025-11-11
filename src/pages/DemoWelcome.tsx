// Demo Welcome Screen - Introduces demo mode and auto-completes onboarding

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { Heart, MapPin, MessageCircle, Zap } from 'lucide-react';
import config from '@/config';
import { logError } from '@/utils/errorHandler';
import MingleHeader from '@/components/layout/MingleHeader';

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
        logError(error as Error, { source: 'DemoWelcome', action: 'seedDemoData' });
      }
    }
  }, [currentUser, setOnboardingStepComplete]);

  const handleEnterDemo = () => {
    // Navigate to check-in page - demo user has full access
    navigate('/checkin');
  };

  return (
    <div className="min-h-screen bg-neutral-900">
      <MingleHeader />
      <div className="flex items-center justify-center p-4 pt-8 min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Left Side - Philosophy/Education */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-2 border-neutral-700 shadow-xl bg-neutral-800 h-full hover:shadow-2xl hover:border-indigo-700/50 transition-all duration-300">
              <CardHeader className="space-y-4 pb-6">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]">
                  What is Mingle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-indigo-900 flex-shrink-0">
                      <MapPin className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Real places, real people</h3>
                      <p className="text-sm text-neutral-300">
                        Connect at venues you already visit
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-indigo-900 flex-shrink-0">
                      <Zap className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Location unlocks everything</h3>
                      <p className="text-sm text-neutral-300">
                        Check in. See who's here. Meet up.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-indigo-900 flex-shrink-0">
                      <Heart className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Serendipity over algorithms</h3>
                      <p className="text-sm text-neutral-300">
                        Best connections happen in real places
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Side - Demo Features */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-2 border-neutral-700 shadow-xl bg-neutral-800 h-full hover:shadow-2xl hover:border-indigo-700/50 transition-all duration-300">
              <CardHeader className="space-y-4 pb-6">
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]">
                    What You'll Experience
                  </CardTitle>
                  <p className="text-sm text-indigo-300 font-medium">Demo Mode Preview</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="mb-4 p-3 bg-indigo-900/30 rounded-lg border border-indigo-700/50">
                  <p className="text-sm text-neutral-200 text-center font-medium">
                    8 venues • 26 active users • Real conversations
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-indigo-900 flex-shrink-0">
                      <Zap className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Full Access</h3>
                      <p className="text-sm text-neutral-300">
                        Unlimited likes, messages, matches
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-indigo-900 flex-shrink-0">
                      <MapPin className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Populated Venues</h3>
                      <p className="text-sm text-neutral-300">
                        Real venues with active users
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-indigo-900 flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Real Conversations</h3>
                      <p className="text-sm text-neutral-300">
                        See how people connect in person
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleEnterDemo}
                    className="w-full md:w-auto md:min-w-[200px] bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg"
                    size="lg"
                  >
                    Enter Demo Mode
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}





