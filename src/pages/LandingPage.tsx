import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { MapPin } from 'lucide-react';
import { getVenues } from '@/lib/api';
import { Card } from '@/components/ui/card';
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
    navigate('/demo-welcome');
  };

  const getRandomRotation = (index: number) => {
    const rotations = [-8, -5, -3, 3, 5, 8, -6, 4];
    return rotations[index % rotations.length];
  };

  return (
    <Layout showBottomNav={false}>
      {/* Dynamic Hero Section - Brand dark background */}
      <div className="relative min-h-screen bg-[#0a0a0f] overflow-hidden">
        {/* Animated gradient background - matches brand */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.12)_0%,_transparent_50%)]" />
        
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
                <Card className="overflow-hidden bg-[#1A1A24] shadow-xl border border-[#2D2D3A]">
                  <div className="relative h-48 w-full overflow-hidden bg-[#1A1A24]">
                    {venue.image ? (
                      <img
                        src={venue.image}
                        alt={venue.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#7C3AED]/30 to-[#6D28D9]/20">
                        <MapPin className="w-12 h-12 text-[#A78BFA]/50" />
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
                <Card className="overflow-hidden bg-[#1A1A24] shadow-xl border border-[#2D2D3A]">
                  <div className="relative h-48 w-full overflow-hidden bg-[#1A1A24]">
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
                <Card className="overflow-hidden bg-[#1A1A24] shadow-xl border border-[#2D2D3A]">
                  <div className="relative h-48 w-full overflow-hidden bg-[#1A1A24]">
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

        {/* Hero Content */}
        <div className="relative z-20 min-h-screen flex flex-col items-center justify-center text-center px-4 py-12">
          <div className="relative z-30 inline-block">
            <div className="bg-[#0a0a0f]/95 backdrop-blur-2xl rounded-3xl px-8 py-12 md:px-12 md:py-16 border border-[#2D2D3A] shadow-2xl shadow-[#7C3AED]/10">
              {/* Logo with gradient */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-8"
              >
                {/* Logo Icon */}
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#7C3AED] flex items-center justify-center shadow-lg shadow-[#7C3AED]/30">
                    <span className="text-white font-bold text-3xl">M</span>
                  </div>
                </div>
                {/* Gradient Text Logo */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gradient mb-6">
                  Mingle
                </h1>
                <div className="space-y-3">
                  <p className="text-lg text-[#9CA3AF] max-w-xl mx-auto">
                    No more swiping. No more noise. Just meet people.
                  </p>
                </div>
              </motion.div>

              {/* Primary CTA */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mb-8"
              >
                <Button
                  onClick={handleJoinClosedBeta}
                  className="bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#8B5CF6] hover:to-[#7C3AED] text-white text-xl px-12 py-6 rounded-full shadow-xl shadow-[#7C3AED]/30 font-bold transform hover:scale-105 transition-all"
                  size="lg"
                >
                  Join Closed Beta
                </Button>
              </motion.div>

              {/* Auth Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: config.DEMO_MODE ? 0.6 : 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto"
              >
                {!config.DEMO_MODE && (
                  <Button 
                    asChild 
                    className="flex-1 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#8B5CF6] hover:to-[#7C3AED] text-white text-lg px-8 py-5 rounded-full shadow-lg shadow-[#7C3AED]/25 font-semibold"
                    size="lg"
                  >
                    <Link to="/signup">
                      Get Started
                    </Link>
                  </Button>
                )}
                {config.DEMO_MODE && (
                  <>
                    <Button 
                      asChild 
                      className="flex-1 bg-white/10 backdrop-blur-sm border border-[#2D2D3A] text-white hover:bg-white/20 font-semibold text-base"
                    >
                      <Link to="/signup">
                        Create Account
                      </Link>
                    </Button>
                    <Button 
                      asChild 
                      variant="outline" 
                      className="flex-1 border border-[#2D2D3A] text-white hover:bg-white/10 backdrop-blur-sm bg-white/5 text-base"
                    >
                      <Link to="/signin">
                        Sign In
                      </Link>
                    </Button>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
