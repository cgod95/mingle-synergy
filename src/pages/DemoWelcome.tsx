// Closed Beta Welcome Screen - Introduces closed beta experience

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Heart, MapPin, MessageCircle, Zap } from 'lucide-react';
import MingleHeader from '@/components/layout/MingleHeader';

export default function DemoWelcome() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Note: Demo data seeding removed - closed beta uses real Firebase data

  const handleGetStarted = () => {
    // Navigate to signup if not authenticated, otherwise to check-in
    if (currentUser) {
      navigate('/checkin');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900">
      <MingleHeader />
      <div className="flex items-center justify-center p-4 pt-8 min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Left Side - Philosophy/Education */}
          <div>
            <Card className="border-2 border-neutral-700 shadow-xl bg-neutral-800 h-full hover:shadow-2xl hover:border-indigo-700/50 transition-all duration-300">
              <CardHeader className="space-y-4 pb-6">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]">
                  What is Mingle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-neutral-300 mb-4">
                  Mingle is a meeting app that encourages introductions and gets people meeting face-to-face. Less time spent on screens, more time connecting in person. Unlike dating apps that keep you swiping endlessly, Mingle helps you discover who's at the places you already love—then make the move to say hello.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-indigo-900 flex-shrink-0">
                      <MapPin className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Actual venues, genuine connections</h3>
                      <p className="text-sm text-neutral-300">
                        Connect at places you already visit
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
                        Best connections happen in physical places
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Demo Features */}
          <div>
            <Card className="border-2 border-neutral-700 shadow-xl bg-neutral-800 h-full hover:shadow-2xl hover:border-indigo-700/50 transition-all duration-300">
              <CardHeader className="space-y-4 pb-6">
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]">
                    What You'll Experience
                  </CardTitle>
                  <p className="text-sm text-indigo-300 font-medium">Closed Beta</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="mb-4 p-3 bg-indigo-900/30 rounded-lg border border-indigo-700/50">
                  <p className="text-sm text-neutral-200 text-center font-medium">
                    Live venues • Authentic users • Physical connections
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
                        Actual venues with active users
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-indigo-900 flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">In-person Conversations</h3>
                      <p className="text-sm text-neutral-300">
                        See how people connect face-to-face
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-center">
                  <Button
                    onClick={handleGetStarted}
                    className="w-full md:w-auto md:min-w-[200px] bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg"
                    size="lg"
                  >
                    Get Started
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}





