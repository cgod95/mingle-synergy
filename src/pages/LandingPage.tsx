import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { MapPin } from 'lucide-react';
import { getVenues } from '@/lib/api';

import { DEMO_PEOPLE } from '@/lib/demoPeople';
import config from '@/config';

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

  const handleJoinClosedBeta = () => {
    navigate('/signup');
  };

  const getRandomRotation = (index: number) => {
    const rotations = [-8, -5, -3, 3, 5, 8, -6, 4];
    return rotations[index % rotations.length];
  };

  return (
    <Layout showBottomNav={false}>
      {/* Dynamic Hero Section - Brand dark background */}
      <div className="relative min-h-screen min-h-[100dvh] bg-surface overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(263_70%_58%/0.12)_0%,_transparent_50%)]" />
        
        {/* Background Cards Grid */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-70">
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
                <div className="overflow-hidden rounded-xl bg-surface-elevated shadow-xl">
                  <div className="relative h-48 w-full overflow-hidden bg-surface-elevated">
                    {venue.image ? (
                      <img
                        src={venue.image}
                        alt={venue.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-violet-600/30 to-violet-700/10">
                        <MapPin className="w-12 h-12 text-violet-400/50" />
                      </div>
                    )}
                  </div>
                </div>
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
                <div className="overflow-hidden rounded-xl bg-surface-elevated shadow-xl">
                  <div className="relative h-48 w-full overflow-hidden bg-surface-elevated">
                    <img
                      src={person.photo}
                      alt={person.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
            {/* Extra images for bottom */}
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
                <div className="overflow-hidden rounded-xl bg-surface-elevated shadow-xl">
                  <div className="relative h-48 w-full overflow-hidden bg-surface-elevated">
                    <img
                      src={person.photo}
                      alt={person.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-20 min-h-screen min-h-[100dvh] flex safe-y flex-col items-center justify-center text-center px-4 py-12">
          <div className="relative z-30 inline-block">
              <div className="bg-surface/80 backdrop-blur-2xl rounded-3xl px-8 py-12 md:px-12 md:py-16 shadow-2xl shadow-violet-500/10">
              {/* Logo with gradient */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-8"
              >
                {/* Logo Icon */}
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-brand flex items-center justify-center shadow-lg shadow-violet-500/30">
                    <span className="text-white font-bold text-3xl">M</span>
                  </div>
                </div>
                {/* Gradient Text Logo */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gradient mb-6">
                  Mingle
                </h1>
                <div className="space-y-3">
                  <p className="text-lg text-on-surface-muted max-w-xl mx-auto">
                    No more swiping. No more noise. Just meet people.
                  </p>
                </div>
              </motion.div>

              {/* Primary CTA */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mb-6"
              >
                <Button
                  onClick={handleJoinClosedBeta}
                  className="bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white text-xl px-12 py-6 rounded-full shadow-xl shadow-violet-500/30 font-bold transform hover:scale-105 transition-all"
                  size="lg"
                >
                  Join Closed Beta
                </Button>
              </motion.div>

              {/* Sign in link */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="text-center"
              >
                <p className="text-sm text-on-surface-muted">
                  Already have an account?{' '}
                  <Link to="/signin" className="text-violet-400 hover:text-violet-300 font-medium">
                    Sign in
                  </Link>
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
