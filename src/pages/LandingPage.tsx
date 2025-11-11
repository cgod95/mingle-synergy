import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Zap, MapPin, Users, Sparkles, QrCode } from 'lucide-react';
import MingleLogo from '@/components/ui/MingleLogo';
import { getVenues } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LandingPage() {
  const navigate = useNavigate();
  const { createDemoUser } = useAuth();
  const [venues, setVenues] = useState<any[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(true);

  useEffect(() => {
    const loadVenues = async () => {
      try {
        const loadedVenues = await getVenues();
        // Show more venues for dynamic grid (6-8 venues)
        const sortedVenues = loadedVenues
          .sort((a, b) => (b.checkInCount || 0) - (a.checkInCount || 0))
          .slice(0, 8);
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

  // Generate random rotations for venue cards (Tinder-style staggered effect)
  const getRandomRotation = (index: number) => {
    const rotations = [-8, -5, -3, 3, 5, 8, -6, 4];
    return rotations[index % rotations.length];
  };

  return (
    <Layout>
      {/* Mingle Branding Header - Dark theme */}
      <div className="sticky top-0 z-50 bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <MingleLogo size="md" showText={false} />
              <span className="text-xl font-bold text-white">Mingle</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm text-neutral-300">
              <Link to="/checkin" className="hover:text-white transition-colors">Venues</Link>
              <Link to="/signin" className="hover:text-white transition-colors">Sign In</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Hero Section - Dark background with venue cards */}
      <div className="relative min-h-screen bg-neutral-900 overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900" />
        
        {/* Venue Cards Grid - Tinder-style tilted cards */}
        {venues.length > 0 && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-8 h-full">
              {venues.map((venue, index) => (
                <motion.div
                  key={venue.id}
                  initial={{ opacity: 0, scale: 0.8, rotate: getRandomRotation(index) }}
                  animate={{ 
                    opacity: 0.4,
                    scale: 1,
                    rotate: getRandomRotation(index),
                    y: [0, -10, 0]
                  }}
                  transition={{ 
                    duration: 0.6,
                    delay: index * 0.1,
                    y: {
                      duration: 4,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: index * 0.2
                    }
                  }}
                  className="relative"
                  style={{ 
                    transform: `rotate(${getRandomRotation(index)}deg)`,
                  }}
                >
                  <Card className="overflow-hidden bg-white shadow-xl border-2 border-neutral-700 cursor-pointer hover:border-[#FF6B6B] transition-all group"
                    onClick={handleCheckIn}
                  >
                    {/* Venue Image */}
                    <div className="relative h-48 w-full overflow-hidden bg-neutral-800">
                      {venue.image ? (
                        <img
                          src={venue.image}
                          alt={venue.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop";
                          }}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#FF6B6B] to-[#FF8C42]">
                          <MapPin className="w-12 h-12 text-white/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Check-in count badge */}
                      {venue.checkInCount > 0 && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-[#FF6B6B] text-white border-0 shadow-lg flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {venue.checkInCount}
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    {/* Venue Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                      <h3 className="font-bold text-sm mb-1 drop-shadow-lg">{venue.name}</h3>
                      {venue.address && (
                        <div className="flex items-center gap-1 text-xs opacity-90">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{venue.address.split(',')[0]}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Hero Content - Centered over venue cards */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4 py-12">
          {/* Large Hero Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-4 drop-shadow-2xl">
              Check In®
            </h1>
            <p className="text-xl md:text-2xl text-neutral-300 max-w-2xl mx-auto font-medium">
              Meet people at the places you already go
            </p>
            <p className="text-lg text-neutral-400 mt-3 max-w-xl mx-auto">
              No swiping. No noise. Just real connections at real places.
            </p>
          </motion.div>

          {/* Primary CTA Button - Large and prominent */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-6"
          >
            <Button
              onClick={handleDemoMode}
              className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8C42] hover:from-[#FF5252] hover:to-[#FF7A3A] text-white text-lg px-12 py-6 rounded-full shadow-2xl font-bold transform hover:scale-105 transition-all"
              size="lg"
            >
              <Sparkles className="w-6 h-6 mr-2" />
              Try Demo Mode
            </Button>
            <p className="text-sm text-neutral-400 mt-3">
              Experience the full app instantly - no signup required
            </p>
          </motion.div>

          {/* Secondary Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
          >
            <Button 
              asChild 
              className="flex-1 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white hover:bg-white/20 font-semibold"
            >
              <Link to="/signup">
                Create Account
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              className="flex-1 border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
            >
              <Link to="/signin">
                Sign In
              </Link>
            </Button>
          </motion.div>

          {/* Quick Stats/Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full"
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <QrCode className="w-8 h-8 text-[#FF6B6B] mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Scan & Check In</h3>
              <p className="text-neutral-400 text-sm">QR code at venues gets you started instantly</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <Users className="w-8 h-8 text-[#FF6B6B] mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">See Who's Here</h3>
              <p className="text-neutral-400 text-sm">Real people at real places, right now</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <Zap className="w-8 h-8 text-[#FF6B6B] mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Meet Tonight</h3>
              <p className="text-neutral-400 text-sm">Chat, connect, and meet up in person</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer Philosophy - Dark theme */}
      <footer className="bg-neutral-900 text-center text-sm text-neutral-400 p-8 border-t border-neutral-800">
        <p className="font-semibold text-white mb-2">Seize the moment</p>
        <p className="text-neutral-400 leading-relaxed max-w-2xl mx-auto">
          Where proximity beats algorithms. Where places unlock people. Where real time beats whenever.
        </p>
        <p className="text-xs text-neutral-500 mt-3 italic">
          The venue is the beginning of your journey
        </p>
      </footer>
    </Layout>
  );
} 