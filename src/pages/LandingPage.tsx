import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { MapPin } from 'lucide-react';
import MingleMLogo from '@/components/ui/MingleMLogo';
import { getVenues } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { DEMO_PEOPLE } from '@/lib/demoPeople';

interface Venue {
  id: string;
  name: string;
  image?: string;
  checkInCount?: number;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { createDemoUser } = useAuth();
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    const loadVenues = async () => {
      try {
        const loadedVenues = await getVenues();
        // Show more venues for dynamic grid (8-10 venues to fill the page)
        const sortedVenues = loadedVenues
          .sort((a: Venue, b: Venue) => (b.checkInCount || 0) - (a.checkInCount || 0))
          .slice(0, 10);
        setVenues(sortedVenues);
      } catch (error) {
        // Failed to load venues - non-critical
      }
    };
    loadVenues();
  }, []);

  const handleDemoMode = () => {
    createDemoUser();
    navigate('/demo-welcome');
  };

  // Generate random rotations for venue cards (Tinder-style staggered effect)
  const getRandomRotation = (index: number) => {
    const rotations = [-8, -5, -3, 3, 5, 8, -6, 4];
    return rotations[index % rotations.length];
  };

  return (
    <Layout showBottomNav={false}>
      {/* Dynamic Hero Section - Dark background with venue cards */}
      <div className="relative min-h-screen bg-neutral-900 overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900" />
        
        {/* Background Cards Grid - Mix of venues and people - images visible all around */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-80">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-8 h-full">
            {/* Venue cards */}
            {venues.slice(0, 10).map((venue, index) => (
              <motion.div
                key={`venue-${venue.id}`}
                initial={{ opacity: 0, scale: 0.8, rotate: getRandomRotation(index) }}
                animate={{ 
                  opacity: 0.45,
                  scale: 1,
                  rotate: getRandomRotation(index),
                  y: [0, -10, 0]
                }}
                transition={{ 
                  duration: 0.6,
                  delay: index * 0.1,
                  y: {
                    duration: 4 + (index % 3) * 0.5,
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
                <Card className="overflow-hidden bg-neutral-800 shadow-xl border-2 border-neutral-700">
                  <div className="relative h-48 w-full overflow-hidden bg-neutral-800">
                    {venue.image ? (
                      <img
                        src={venue.image}
                        alt={venue.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600">
                        <MapPin className="w-12 h-12 text-white/50" />
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
            {/* People cards */}
            {DEMO_PEOPLE.slice(0, 10).map((person, index) => (
              <motion.div
                key={`person-${person.id}`}
                initial={{ opacity: 0, scale: 0.8, rotate: getRandomRotation(index + 6) }}
                animate={{ 
                  opacity: 0.45,
                  scale: 1,
                  rotate: getRandomRotation(index + 6),
                  y: [0, -10, 0]
                }}
                transition={{ 
                  duration: 0.6,
                  delay: (index + 6) * 0.1,
                  y: {
                    duration: 4.5 + (index % 3) * 0.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: (index + 6) * 0.2
                  }
                }}
                className="relative"
                style={{ 
                  transform: `rotate(${getRandomRotation(index + 6)}deg)`,
                }}
              >
                <Card className="overflow-hidden bg-neutral-800 shadow-xl border-2 border-neutral-700">
                  <div className="relative h-48 w-full overflow-hidden bg-neutral-800">
                    <img
                      src={person.photo}
                      alt={person.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </Card>
              </motion.div>
            ))}
            {/* Additional 2 images for bottom right - repeating from existing */}
            {DEMO_PEOPLE.slice(0, 2).map((person, index) => (
              <motion.div
                key={`person-extra-${index}`}
                initial={{ opacity: 0, scale: 0.8, rotate: getRandomRotation(index + 16) }}
                animate={{ 
                  opacity: 0.45,
                  scale: 1,
                  rotate: getRandomRotation(index + 16),
                  y: [0, -10, 0]
                }}
                transition={{ 
                  duration: 0.6,
                  delay: (index + 16) * 0.1,
                  y: {
                    duration: 4.5 + (index % 3) * 0.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: (index + 16) * 0.2
                  }
                }}
                className="relative"
                style={{ 
                  transform: `rotate(${getRandomRotation(index + 16)}deg)`,
                }}
              >
                <Card className="overflow-hidden bg-neutral-800 shadow-xl border-2 border-neutral-700">
                  <div className="relative h-48 w-full overflow-hidden bg-neutral-800">
                    <img
                      src={person.photo}
                      alt={person.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Hero Content - Centered with tight background block */}
        <div className="relative z-20 min-h-screen flex flex-col items-center justify-center text-center px-4 py-12">
          {/* Tight background block - minimal padding, images visible around */}
          <div className="relative z-30 inline-block">
            <div className="bg-neutral-900/95 backdrop-blur-2xl rounded-2xl px-8 py-12 md:px-12 md:py-16 border-2 border-neutral-800 shadow-2xl">
            {/* Logo and Large Hero Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              {/* Logo */}
              <div className="mb-6 flex justify-center">
                <MingleMLogo size="lg" showText={false} className="text-white" />
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-9xl font-bold text-white mb-6">
                Mingle
              </h1>
              <div className="space-y-3">
                <p className="text-lg text-neutral-300 max-w-xl mx-auto">
                  No more swiping. No more noise. Just meet people.
                </p>
              </div>
            </motion.div>

            {/* Primary CTA Button with Features */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-8"
            >
              <Button
                onClick={handleDemoMode}
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 border-2 border-indigo-500/50 hover:border-indigo-400 hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-500 text-white text-xl px-16 py-7 rounded-full shadow-xl font-bold transform hover:scale-105 transition-all mb-8 backdrop-blur-sm"
                size="lg"
              >
                Try Demo Mode
              </Button>
            </motion.div>

            {/* Secondary Actions - Centered */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto"
            >
              <Button 
                asChild 
                className="flex-1 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white hover:bg-white/20 font-semibold text-base"
              >
                <Link to="/signup">
                  Create Account
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                className="flex-1 border-2 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm bg-white/5 text-base"
              >
                <Link to="/signin">
                  Sign In
                </Link>
              </Button>
            </motion.div>
            </div>
          </div>
        </div>
      </div>

    </Layout>
  );
} 