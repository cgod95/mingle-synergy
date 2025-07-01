import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import venueService from '@/services/firebase/venueService';
import { Venue } from '@/types/services';
import { getUsersAtVenue } from '@/data/mock';
import UserGrid from '@/components/venue/UserGrid';
import { useToast } from '@/hooks/use-toast';

export default function ActiveVenue() {
  const { id } = useParams();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [likedUsers, setLikedUsers] = useState<string[]>([]);
  const [likesRemaining, setLikesRemaining] = useState(10);
  const { toast } = useToast();

  useEffect(() => {
    const fetchVenue = async () => {
      if (!id) return;
      try {
        const venueData = await venueService.getVenueById(id);
        setVenue(venueData);
        if (venueData) {
          // Get all users for this venue (show all 16 users)
          const allUsers = getUsersAtVenue(venueData.id);
          setUsers(allUsers);
        }
      } catch (error) {
        console.error('Error fetching venue:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVenue();
  }, [id]);

  const handleLikeUser = (userId: string) => {
    if (likesRemaining > 0 && !likedUsers.includes(userId)) {
      setLikedUsers(prev => [...prev, userId]);
      setLikesRemaining(prev => prev - 1);
      
      // Find the user to show in toast
      const user = users.find(u => u.id === userId);
      
      // Random chance of showing a match notification
      const isMatch = Math.random() < 0.3; // 30% chance
      
      if (isMatch) {
        toast({
          title: "It's a Match! 💕",
          description: `You and ${user?.name || 'someone'} liked each other!`,
          duration: 4000,
        });
      } else {
        toast({
          title: "Liked! ❤️",
          description: `You liked ${user?.name || 'someone'}!`,
          duration: 2000,
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <p className="text-muted-foreground">Loading venue...</p>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <p className="text-muted-foreground">Venue not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-muted">
      <Card className="max-w-2xl mx-auto mb-6">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-2">{venue.name}</h1>
          <p className="text-muted-foreground mb-4">{venue.type}</p>
          <p className="text-sm mb-2">Location: {venue.city}</p>
          <p className="text-sm mb-2">Address: {venue.address}</p>
          <p className="text-sm">People checked in: {venue.checkInCount}</p>
        </CardContent>
      </Card>
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">People Here Now</h2>
          <span className="text-sm text-muted-foreground">
            {likesRemaining} likes remaining
          </span>
        </div>
        <UserGrid 
          users={users} 
          likesRemaining={likesRemaining}
          onLikeUser={handleLikeUser}
          likedUsers={likedUsers}
        />
      </div>
    </div>
  );
}