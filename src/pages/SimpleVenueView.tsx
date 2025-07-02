import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, MapPin, Users, Clock, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { mockVenues } from '@/data/mock';
import { getUsersAtVenue } from '@/data/mock';
import Layout from '@/components/Layout';
import BottomNav from '@/components/BottomNav';
import OptimizedImage from '@/components/shared/OptimizedImage';

interface VenueUser {
  id: string;
  name: string;
  age: number;
  photos: string[];
  bio: string;
  interests: string[];
  zone?: string;
  lastActive: number;
}

const SimpleVenueView: React.FC = () => {
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [venue, setVenue] = useState(mockVenues.find(v => v.id === venueId));
  const [venueUsers, setVenueUsers] = useState<VenueUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!venueId) {
      navigate('/venues');
      return;
    }

    const venueData = mockVenues.find(v => v.id === venueId);
    if (!venueData) {
      navigate('/venues');
      return;
    }

    setVenue(venueData);

    // Get users at this venue (excluding current user)
    const usersAtVenue = getUsersAtVenue(venueId).filter(user => 
      user.id !== currentUser?.uid && user.isCheckedIn
    );

    // Transform to VenueUser format
    const transformedUsers: VenueUser[] = usersAtVenue.map(user => ({
      id: user.id,
      name: user.name,
      age: user.age,
      photos: user.photos || [],
      bio: user.bio || '',
      interests: user.interests || [],
      zone: user.zone || user.currentZone,
      lastActive: user.lastActive || Date.now()
    }));

    setVenueUsers(transformedUsers);
    setLoading(false);
  }, [venueId, currentUser?.uid, navigate]);

  const handleLike = (userId: string) => {
    const user = venueUsers.find(u => u.id === userId);
    if (!user) return;

    // Simulate match chance
    const isMatch = Math.random() < 0.3; // 30% chance for demo

    if (isMatch) {
      toast({
        title: "It's a match! 💕",
        description: `You and ${user.name} liked each other at ${venue?.name}!`,
      });
    } else {
      toast({
        title: "Like sent! ❤️",
        description: `${user.name} will be notified of your interest`,
      });
    }
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading venue...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!venue) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-neutral-600 mb-4">Venue not found</p>
            <Button onClick={() => navigate('/venues')}>Back to Venues</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-neutral-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/venues')}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <div className="text-center">
            <h1 className="font-semibold text-lg">{venue.name}</h1>
            <div className="flex items-center justify-center space-x-2 text-sm text-neutral-600">
              <Users className="w-4 h-4" />
              <span>{venueUsers.length} people here</span>
            </div>
          </div>
          
          <div className="w-8"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* People Grid */}
      <div className="p-4 pb-24">
        {venueUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <Users className="w-12 h-12 text-neutral-400 mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No one here yet</h3>
            <p className="text-neutral-600 mb-6">Be the first to check in and meet people!</p>
            <Button onClick={() => navigate(`/venue/${venueId}`)}>
              Check In Here
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {venueUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="overflow-hidden cursor-pointer group">
                  <div className="relative aspect-square">
                    <OptimizedImage
                      src={user.photos[0] || '/placeholder.svg'}
                      alt={user.name}
                      className="w-full h-full object-cover"
                      fallback="/placeholder.svg"
                    />
                    
                    {/* Overlay with user info */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                        <h3 className="font-medium text-sm truncate">{user.name}, {user.age}</h3>
                        {user.zone && (
                          <div className="flex items-center text-xs opacity-90">
                            <MapPin className="w-3 h-3 mr-1" />
                            {user.zone}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Active indicator */}
                    <div className="absolute top-2 right-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>

                    {/* Action buttons */}
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(user.id);
                          }}
                        >
                          <Heart className="w-4 h-4 text-red-500" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProfile(user.id);
                          }}
                        >
                          <MessageCircle className="w-4 h-4 text-blue-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </Layout>
  );
};

export default SimpleVenueView;