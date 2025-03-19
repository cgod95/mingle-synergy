
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import UserCard from '@/components/UserCard';
import MatchNotification from '@/components/MatchNotification';
import { User, Venue, Match, Interest } from '@/types';
import { venues, users, getUsersAtVenue, hasMutualInterest } from '@/data/mockData';
import { Clock, ArrowLeft, MapPin, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const ActiveVenue = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [venue, setVenue] = useState<Venue | null>(null);
  const [usersAtVenue, setUsersAtVenue] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [interests, setInterests] = useState<string[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  
  const mockCurrentUserId = 'u6'; // For demonstration purposes
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    // Find venue
    if (id) {
      const foundVenue = venues.find(v => v.id === id);
      if (foundVenue) {
        setVenue(foundVenue);
        setUsersAtVenue(getUsersAtVenue(id));
      }
    }
    
    return () => clearTimeout(timer);
  }, [id]);
  
  const handleExpressInterest = (userId: string) => {
    // Check if already interested
    if (interests.includes(userId)) {
      return;
    }
    
    // Add to interests
    setInterests([...interests, userId]);
    
    // Check if mutual interest - for demo purposes, simulate match after short delay
    setTimeout(() => {
      if (Math.random() > 0.5) {
        const newMatch: Match = {
          id: `m${Date.now()}`,
          userId: mockCurrentUserId,
          matchedUserId: userId,
          venueId: id || '',
          timestamp: Date.now(),
          isActive: true,
          expiresAt: Date.now() + 1000 * 60 * 60 * 3, // 3 hours
          contactShared: false
        };
        
        setMatches([...matches, newMatch]);
        setCurrentMatch(newMatch);
        setShowMatchNotification(true);
      }
    }, 1000);
  };
  
  const handleCheckIn = () => {
    setIsCheckedIn(true);
    
    // Show toast or some UI indication
    // Could be implemented with a toast library
  };
  
  return (
    <div className="min-h-screen bg-background text-foreground pt-16 pb-8">
      <Header />
      
      <main className="container mx-auto px-4 mt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back
        </button>
        
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-2/3 mb-4"></div>
            <div className="h-6 bg-muted rounded w-full mb-6"></div>
            <div className="aspect-video w-full bg-muted rounded-xl mb-6"></div>
          </div>
        ) : venue ? (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-semibold mb-2">{venue.name}</h1>
            <p className="text-muted-foreground mb-4">{venue.address}</p>
            
            <div className="relative rounded-xl overflow-hidden mb-6">
              <img 
                src={venue.image + "?auto=format&fit=crop&w=1200&q=80"}
                alt={venue.name}
                className="w-full aspect-[21/9] object-cover"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/30 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-white">
                    <Users size={20} />
                    <span className="font-medium">{venue.checkInCount} checked in</span>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-white">
                    <Clock size={20} />
                    <span className="font-medium">Expires in {venue.expiryTime / 60}h</span>
                  </div>
                </div>
                
                <button
                  onClick={handleCheckIn}
                  className={cn(
                    "py-2 px-4 rounded-lg transition-all",
                    isCheckedIn 
                      ? "bg-secondary text-secondary-foreground" 
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                  disabled={isCheckedIn}
                >
                  {isCheckedIn ? 'Checked In' : 'Check In'}
                </button>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-medium mb-4">People Here Now</h2>
              
              {usersAtVenue.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {usersAtVenue.map((user) => (
                    <UserCard 
                      key={user.id} 
                      user={user}
                      onExpressInterest={handleExpressInterest}
                      hasPendingInterest={interests.includes(user.id)}
                      hasMatch={matches.some(
                        m => (m.userId === mockCurrentUserId && m.matchedUserId === user.id) || 
                             (m.userId === user.id && m.matchedUserId === mockCurrentUserId)
                      )}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No one's here yet</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Be the first to check in and others will see you here.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
              <MapPin className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">Venue not found</h3>
            <p className="text-muted-foreground">
              The venue you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Discover Venues
            </button>
          </div>
        )}
      </main>
      
      {showMatchNotification && currentMatch && (
        <MatchNotification 
          match={currentMatch}
          currentUserId={mockCurrentUserId}
          onClose={() => setShowMatchNotification(false)}
        />
      )}
    </div>
  );
};

export default ActiveVenue;
