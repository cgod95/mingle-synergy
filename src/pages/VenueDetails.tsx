import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import VenueDetailsHeader from '../components/venue/VenueDetailsHeader';
import UserGrid from '../components/venue/UserGrid';

const VenueDetails: React.FC = () => {
  const { venueId } = useParams<{venueId: string}>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [venue, setVenue] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [likesRemaining, setLikesRemaining] = useState(3);
  const [likedUsers, setLikedUsers] = useState<string[]>([]);
  const [expiryTime, setExpiryTime] = useState<string>('');
  
  useEffect(() => {
    const fetchVenueData = async () => {
      if (!venueId || !currentUser) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Mock venue data for demo
        const mockVenue = {
          id: venueId,
          name: venueId === 'v1' ? 'The Grand Cafe' : 
                venueId === 'v2' ? 'Skybar Lounge' : 
                venueId === 'v3' ? 'The Italian Place' : 'Downtown Club',
          address: '123 Main Street, New York',
          userCount: Math.floor(Math.random() * 30) + 5,
          type: venueId === 'v1' ? 'cafe' : 
               venueId === 'v2' ? 'bar' : 
               venueId === 'v3' ? 'restaurant' : 'club'
        };
        
        setVenue(mockVenue);
        
        // Calculate expiry time (2 hours from now)
        const now = new Date();
        const expiry = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        setExpiryTime(expiry.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        
        // Mock users at venue
        const mockUsers = [
          {
            id: 'u1',
            name: 'Alex',
            age: 28,
            photos: ['https://randomuser.me/api/portraits/men/32.jpg']
          },
          {
            id: 'u2',
            name: 'Jordan',
            age: 26,
            photos: ['https://randomuser.me/api/portraits/women/44.jpg']
          },
          {
            id: 'u3',
            name: 'Taylor',
            age: 30,
            photos: ['https://randomuser.me/api/portraits/women/22.jpg']
          },
          {
            id: 'u4',
            name: 'Casey',
            age: 27,
            photos: ['https://randomuser.me/api/portraits/men/18.jpg']
          },
          {
            id: 'u5',
            name: 'Morgan',
            age: 29,
            photos: ['https://randomuser.me/api/portraits/women/56.jpg']
          }
        ];
        
        setUsers(mockUsers);
      } catch (error) {
        console.error('Error fetching venue data:', error);
        setError('Unable to load venue. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVenueData();
  }, [venueId, currentUser]);
  
  const toggleVisibility = async () => {
    if (!currentUser) return;
    
    try {
      // Update local state immediately for responsive UI
      setIsVisible(!isVisible);
      
      // In a real app, this would call userService.updateUserVisibility
      console.log(`Setting visibility to ${!isVisible}`);
    } catch (error) {
      console.error('Error toggling visibility:', error);
      // Revert state on error
      setIsVisible(isVisible);
    }
  };
  
  const handleLikeUser = async (userId: string) => {
    if (!currentUser || likesRemaining <= 0 || likedUsers.includes(userId)) return;
    
    try {
      // Update local state
      setLikedUsers([...likedUsers, userId]);
      setLikesRemaining(likesRemaining - 1);
      
      // In a real app, this would call userService.likeUser
      console.log(`Liked user ${userId}`);
    } catch (error) {
      console.error('Error liking user:', error);
      // Revert state on error
      setLikedUsers(likedUsers.filter(id => id !== userId));
      setLikesRemaining(likesRemaining);
    }
  };
  
  const handleCheckOut = async () => {
    if (!currentUser || !venueId) return;
    
    try {
      // In a real app, this would call venueService.checkOutFromVenue
      console.log(`Checking out from venue ${venueId}`);
      
      // Navigate back to discovery page
      navigate('/venues');
    } catch (error) {
      console.error('Error checking out:', error);
    }
  };
  
  if (isLoading) {
    return <LoadingScreen message="Loading venue..." />;
  }
  
  if (error || !venue) {
    return (
      <div className="p-4 text-center py-12 bg-bg-tertiary rounded-lg">
        <p className="text-text-primary font-medium">{error || "Venue not found"}</p>
        <button 
          onClick={() => navigate('/venues')}
          className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-full text-sm"
        >
          Back to Venues
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-bg-primary min-h-screen pb-24">
      <div className="container mx-auto p-4">
        {/* Venue Header */}
        <VenueDetailsHeader
          venue={venue}
          expiryTime={expiryTime}
          onCheckOut={handleCheckOut}
          isVisible={isVisible}
          onToggleVisibility={toggleVisibility}
        />
        
        {/* Users at Venue */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-text-primary">People Here</h2>
            <div className="text-sm font-medium bg-brand-accent text-brand-primary px-3 py-1 rounded-full">
              {likesRemaining} likes remaining
            </div>
          </div>
          
          {users.length === 0 ? (
            <div className="bg-bg-secondary rounded-lg shadow-sm p-8 text-center">
              <p className="text-text-primary font-medium">No one here yet</p>
              <p className="text-text-secondary text-sm mt-1">Be the first to check in!</p>
            </div>
          ) : (
            <UserGrid
              users={users}
              onLikeUser={handleLikeUser}
              likesRemaining={likesRemaining}
              likedUsers={likedUsers}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VenueDetails;
