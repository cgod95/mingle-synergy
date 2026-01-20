import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { MapPin } from 'lucide-react';
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
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    const loadVenues = async () => {
      try {
        const loadedVenues = await getVenues();
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

  // Generate random rotations for venue cards
  const getRandomRotation = (index: number) => {
    const rotations = [-8, -5, -3, 3, 5, 8, -6, 4];
    return rotations[index % rotations.length];
  };

  return (
    <Layout showBottomNav={false}>
      {/* Dynamic Hero Section - Dark background with venue cards */}
      <div className="relative min-h-screen min-h-[100dvh] bg-neutral-900 overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900" />
        
        {/* Background Cards Grid */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 p-4 pt-16 h-full">
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
                  duration: 0.25,
                  delay: index * 0.1,
                  y: {
                    duration: 4 + (index % 3) * 0.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: index * 0.2
                  }
                }}
                className="relative"
                style={{ transform: `rotate(${getRandomRotation(index)}deg)` }}
              >
                <Card className="overflow-hidden bg-neutral-800 shadow-xl border-2 border-neutral-700">
                  <div className="relative h-36 sm:h-48 w-full overflow-hidden bg-neutral-800">
                    {venue.image ? (
                      <img
                        src={venue.image}
                        alt={venue.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600">
                        <MapPin className="w-8 h-8 sm:w-12 sm:h-12 text-white/50" />
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
                  duration: 0.25,
                  delay: (index + 6) * 0.1,
                  y: {
                    duration: 4.5 + (index % 3) * 0.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: (index + 6) * 0.2
                  }
                }}
                className="relative"
                style={{ transform: `rotate(${getRandomRotation(index + 6)}deg)` }}
              >
                <Card className="overflow-hidden bg-neutral-800 shadow-xl border-2 border-neutral-700">
                  <div className="relative h-36 sm:h-48 w-full overflow-hidden bg-neutral-800">
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

        {/* Hero Content - Centered */}
        <div className="relative z-20 min-h-screen min-h-[100dvh] flex flex-col items-center justify-center text-center px-4 py-12 safe-y">
          {/* Content block */}
          <div className="relative z-30">
            <div className="bg-neutral-900/95 backdrop-blur-2xl rounded-3xl px-8 py-10 sm:px-12 sm:py-14 border-2 border-neutral-800 shadow-2xl max-w-sm sm:max-w-md mx-auto">
              
              {/* Centered M Logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="flex justify-center mb-6"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 flex items-center justify-center shadow-xl">
                  <span className="text-4xl sm:text-5xl font-bold text-white">M</span>
                </div>
              </motion.div>
              
              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.1 }}
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
                  Mingle
                </h1>
                <p className="text-base sm:text-lg text-neutral-300 mb-8">
                  No more swiping. No more noise.<br />Just meet people.
                </p>
              </motion.div>

              {/* Get Started Button - Primary CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.2 }}
                className="space-y-4"
              >
                <Button 
                  asChild 
                  className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-500 text-white text-lg sm:text-xl px-8 py-6 sm:py-7 rounded-full shadow-xl font-bold transform hover:scale-105 active:scale-95 transition-all touch-target"
                  size="lg"
                >
                  <Link to="/signup">
                    Get Started
                  </Link>
                </Button>
                
                {/* Sign In Link */}
                <Button 
                  asChild 
                  variant="ghost"
                  className="w-full text-neutral-400 hover:text-white hover:bg-white/5 text-base touch-target"
                >
                  <Link to="/signin">
                    Already have an account? Sign In
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
