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
import PrivateLayout from '@/components/PrivateLayout';
import BottomNav from '@/components/BottomNav';
import OptimizedImage from '@/components/shared/OptimizedImage';
import venueService from '@/services/firebase/venueService';
import userService from '@/services/firebase/userService';
import matchService from '@/services/firebase/matchService';
import { Venue } from '@/types';
import { UserProfile } from '@/types/services';
import logger from '@/utils/Logger';

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
  
  const [venue, setVenue] = useState<Venue | null>(null);
  const [venueUsers, setVenueUsers] = useState<VenueUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!venueId) {
      navigate('/venues');
      return;
    }

    const fetchVenueData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch venue from Firestore
        const venueData = await venueService.getVenueById(venueId);
        if (!venueData) {
          setError('Venue not found');
          setLoading(false);
          return;
        }

        setVenue(venueData);

        // Get users at this venue from Firestore
        const usersAtVenue = await venueService.getUsersAtVenue(venueId);
        
        // Filter out current user and only show checked-in users
        const filteredUsers = usersAtVenue.filter(user => 
          user.id !== currentUser?.uid && user.isCheckedIn
        );

        // Transform to VenueUser format
        const transformedUsers: VenueUser[] = filteredUsers.map(user => ({
          id: user.id,
          name: user.name,
          age: user.age,
          photos: user.photos || [],
          bio: user.bio || '',
          interests: user.interests || [],
          zone: user.currentZone,
          lastActive: Date.now() // TODO: Add lastActive to user profile
        }));

        setVenueUsers(transformedUsers);
      } catch (err) {
        logger.error('Error fetching venue data:', err);
        setError('Failed to load venue data');
      } finally {
        setLoading(false);
      }
    };

    fetchVenueData();
  }, [venueId, currentUser?.uid, navigate]);

  const handleLike = async (userId: string) => {
    if (!currentUser || !venueId) return;

    const user = venueUsers.find(u => u.id === userId);
    if (!user) return;

    try {
      // Use real like functionality
      await matchService.likeUser(currentUser.uid, userId, venueId);
      
      toast({
        title: "Like sent! ❤️",
        description: `${user.name} will be notified of your interest`,
      });
    } catch (err) {
      logger.error('Error liking user:', err);
      toast({
        title: "Error",
        description: "Failed to send like. Please try again.",
        variant: "destructive",
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
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <PrivateLayout>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pb-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading venue...</p>
        </div>
        <BottomNav />
      </PrivateLayout>
    );
  }

  if (error || !venue) {
    return (
      <PrivateLayout>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pb-20">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error || 'Venue not found'}
            </h3>
            <Button onClick={() => navigate('/venues')} className="mt-4">
              Back to Venues
            </Button>
          </div>
        </div>
        <BottomNav />
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
          <button 
            onClick={() => navigate('/venues')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-lg">{venue.name}</h1>
            <p className="text-sm text-gray-600">{venue.address}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {venueUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <Users className="w-12 h-12 text-neutral-400 mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No one here yet</h3>
              <p className="text-neutral-600 mb-6">Be the first to check in and meet people!</p>
              <Button onClick={() => navigate(`/venues/${venueId}`)}>
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
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative">
                        <OptimizedImage
                          src={user.photos[0] || ''}
                          alt={user.name}
                          className="w-full h-32 object-cover"
                          fallback={
                            <div className="w-full h-32 bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                              <span className="text-2xl font-bold text-white">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          }
                        />
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="text-xs">
                            {getTimeAgo(user.lastActive)}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-sm truncate">{user.name}, {user.age}</h3>
                        <p className="text-xs text-gray-500 truncate">{user.bio}</p>
                        <div className="flex gap-1 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs"
                            onClick={() => handleLike(user.id)}
                          >
                            <Heart className="w-3 h-3 mr-1" />
                            Like
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs"
                            onClick={() => handleViewProfile(user.id)}
                          >
                            <MessageCircle className="w-3 h-3 mr-1" />
                            Profile
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </PrivateLayout>
  );
};

export default SimpleVenueView;