import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Zap, MapPin, Users, Heart, Sparkles } from 'lucide-react';
import { getVenues } from '@/lib/api';
import { Card } from '@/components/ui/card';

export default function LandingPage() {
  const navigate = useNavigate();
  const { createDemoUser } = useAuth();
  const [venues, setVenues] = useState<any[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(true);

  useEffect(() => {
    const loadVenues = async () => {
      try {
        const loadedVenues = await getVenues();
        // Show top 3-4 venues with highest check-in counts
        const sortedVenues = loadedVenues
          .sort((a, b) => (b.checkInCount || 0) - (a.checkInCount || 0))
          .slice(0, 4);
        setVenues(sortedVenues);
      } catch (error) {
        // Failed to load venues - non-critical
      } finally {
        setLoadingVenues(false);
      }
    };
    loadVenues();
  }, []);

  const handleDemoMode = () => {
    createDemoUser();
    navigate('/demo-welcome');
  };

  const handleCheckIn = () => {
    navigate('/checkin');
  };

  return (
    <Layout>
      {/* Mingle Branding Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Mingle
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center text-center px-4 py-12 space-y-8"
      >
        <h1 className="text-5xl font-bold leading-tight text-neutral-900">
          Meet people at the places you already go
        </h1>
        <p className="text-lg text-neutral-800 max-w-xl mb-2 font-medium">
          No swiping. No noise. Just real connections at real places.
        </p>
        {/* Venue Preview Section - Show nearby venues with live counts */}
        {venues.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-2xl"
          >
            <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6 shadow-sm">
              <h2 className="text-xl font-semibold text-neutral-900 mb-2 text-center">
                See who's at venues near you
              </h2>
              <p className="text-sm text-neutral-600 text-center mb-4">
                Check in to start meeting people
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {venues.map((venue, index) => (
                  <motion.div
                    key={venue.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Card className="border border-neutral-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer bg-white"
                      onClick={handleCheckIn}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-neutral-900 text-base">{venue.name}</h3>
                          {venue.checkInCount > 0 && (
                            <div className="flex items-center gap-1 text-sm text-indigo-600">
                              <Users className="w-4 h-4" />
                              <span className="font-medium">{venue.checkInCount}</span>
                            </div>
                          )}
                        </div>
                        {venue.address && (
                          <div className="flex items-center gap-1 text-xs text-neutral-500">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{venue.address}</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
              <Button
                onClick={handleCheckIn}
                variant="outline"
                className="w-full border-indigo-300 text-indigo-600 hover:bg-indigo-50"
              >
                See all venues →
              </Button>
            </div>
          </motion.div>
        )}

        {/* How Mingle Works - Below venues */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: venues.length > 0 ? 0.6 : 0.3 }}
          className="bg-white rounded-xl border border-neutral-200 p-5 max-w-xl shadow-md"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-600 flex-shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-800 mb-2">How Mingle Works</h3>
              <ol className="text-sm text-neutral-700 space-y-1.5 list-decimal list-inside">
                <li><strong>Check into a venue</strong> where you are (scan QR code or auto-detect)</li>
                <li><strong>See people</strong> who are also checked in there</li>
                <li><strong>Like someone</strong> - if they like you back, you match!</li>
                <li><strong>Chat to make plans</strong> to meet up in person</li>
                <li><strong>Meet tonight</strong> - that's what Mingle is all about!</li>
              </ol>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col gap-4 w-full max-w-sm space-y-4">
          {/* Demo Mode Button - Prominent */}
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={handleDemoMode}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Try Demo Mode
            </Button>
            <p className="text-xs text-neutral-500 mt-2">
              Experience the full app instantly - no signup required
            </p>
          </motion.div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-neutral-500">Or</span>
            </div>
          </div>

          <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md">
            <Link to="/signup">
              Create Account
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full border-neutral-300 hover:bg-neutral-50">
            <Link to="/signin">
              Sign In
            </Link>
          </Button>
          
          {/* Test Onboarding Option - Only visible in demo mode */}
          {import.meta.env.VITE_DEMO_MODE === 'true' && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-neutral-500">Test</span>
                </div>
              </div>
              <Button
                onClick={() => {
                  // Set flag to test onboarding flow
                  localStorage.setItem('testOnboarding', 'true');
                  navigate('/signup');
                }}
                variant="outline"
                className="w-full border-2 border-purple-200 hover:bg-purple-50 text-purple-700"
              >
                Test Onboarding Flow
              </Button>
              <p className="text-xs text-neutral-500 text-center">
                Test the real signup/onboarding process (bypasses demo shortcuts)
              </p>
            </>
          )}
        </div>
      </motion.div>

      {/* Footer Philosophy */}
      <footer className="text-center text-sm text-neutral-600 p-6 max-w-xl mx-auto">
        <p className="font-medium">Built differently</p>
        <p className="text-neutral-500 mt-1">Where proximity beats algorithms. Where places unlock people. Where real time beats whenever.</p>
      </footer>
    </Layout>
  );
} 