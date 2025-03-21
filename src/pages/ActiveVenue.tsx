import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import UserCard from '@/components/UserCard';
import MatchNotification from '@/components/MatchNotification';
import VenueHeader from '@/components/VenueHeader';
import { User, Venue, Match, Interest } from '@/types';
import { venues, getUsersAtVenue, matches } from '@/data/mockData';
import { Users, Plus } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useVenues } from '@/hooks/useVenues';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { 
  saveInterests, 
  getInterests, 
  saveMatches, 
  getMatches,
  saveLikedUsers,
  getLikedUsers
} from '@/utils/localStorageUtils';

const ActiveVenue = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { checkInToVenue, checkOutFromVenue } = useVenues();
  
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [likedUsers, setLikedUsers] = useState<string[]>([]);
  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [expiryTime, setExpiryTime] = useState<Date>(new Date());
  const [usersAtVenue, setUsersAtVenue] = useState<User[]>([]);
  
  const currentUser = { id: 'u6', name: 'Demo User' };
  
  useEffect(() => {
    setInterests(getInterests());
    setMatches(getMatches());
    setLikedUsers(getLikedUsers());
    
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    if (id) {
      const foundVenue = venues.find(v => v.id === id);
      if (foundVenue) {
        setVenue(foundVenue);
        setIsCheckedIn(true);
        
        const users = getUsersAtVenue(id);
        console.log(`Loaded ${users.length} users for venue ${id}`);
        setUsersAtVenue(users);
        
        const hours = getExpiryHours(foundVenue.type);
        setTimeRemaining(hours * 60 * 60);
        
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + hours);
        setExpiryTime(expiryDate);
      }
    }
    
    return () => clearTimeout(timer);
  }, [id]);
  
  useEffect(() => {
    if (timeRemaining <= 0 || !isCheckedIn) return;
    
    const countdown = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          setIsCheckedIn(false);
          checkOutFromVenue();
          toast({
            title: "Check-in expired",
            description: "You've been automatically checked out.",
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(countdown);
  }, [timeRemaining, isCheckedIn, toast, checkOutFromVenue]);
  
  const getExpiryHours = (type: string) => {
    switch (type) {
      case 'cafe': return 1;
      case 'bar': return 3;
      case 'restaurant': return 2;
      case 'gym': return 2;
      default: return 3;
    }
  };
  
  const handleLike = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation(); // Prevent event bubbling
    
    if (likedUsers.includes(userId)) {
      return; // Already liked this user
    }
    
    const newInterest: Interest = {
      id: `int_${Date.now()}`,
      fromUserId: currentUser.id,
      toUserId: userId,
      venueId: id || '',
      timestamp: Date.now(),
      isActive: true,
      expiresAt: Date.now() + (3 * 60 * 60 * 1000) // 3 hours
    };
    
    const updatedInterests = [...interests, newInterest];
    setInterests(updatedInterests);
    saveInterests(updatedInterests);
    
    const updatedLikedUsers = [...likedUsers, userId];
    setLikedUsers(updatedLikedUsers);
    saveLikedUsers(updatedLikedUsers);
    
    // Show confirmation toast
    toast({
      title: "Interest Sent!",
      description: `Interest sent to ${getUserName(userId)}`,
    });
    
    // Check for mutual interest (match)
    checkForMatch(userId);
  };
  
  const getUserName = (userId: string): string => {
    const user = usersAtVenue.find(u => u.id === userId);
    return user?.name || "someone";
  };
  
  const checkForMatch = (userId: string) => {
    if (Math.random() > 0.5) {
      const newMatch: Match = {
        id: `m${Date.now()}`,
        userId: currentUser.id,
        matchedUserId: userId,
        venueId: id || '',
        timestamp: Date.now(),
        isActive: true,
        expiresAt: Date.now() + (3 * 60 * 60 * 1000), // 3 hours
        contactShared: false
      };
      
      const updatedMatches = [...matches, newMatch];
      setMatches(updatedMatches);
      saveMatches(updatedMatches);
      
      setCurrentMatch(newMatch);
      setShowMatchNotification(true);
    }
  };
  
  const handleExpressInterest = (userId: string) => {
    handleLike({ stopPropagation: () => {} } as React.MouseEvent, userId);
  };
  
  const handleCheckOut = () => {
    setIsCheckedIn(false);
    setActiveZone(null);
    checkOutFromVenue();
    setTimeRemaining(0);
    
    toast({
      title: "Checked Out",
      description: "You're no longer visible at this venue.",
    });
  };
  
  const handleZoneSelect = (zoneName: string) => {
    setActiveZone(zoneName);
    toast({
      title: `Now at: ${zoneName}`,
      description: `Other users will see you in the ${zoneName} area`,
    });
  };
  
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
    toast({
      title: isVisible ? "You're now invisible" : "You're now visible",
      description: isVisible 
        ? "You won't appear in other users' discovery" 
        : "Other users can now discover you",
    });
  };
  
  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">We had trouble loading this venue.</p>
          <button
            onClick={() => navigate('/venues')}
            className="py-2 px-4 bg-primary text-primary-foreground rounded-full"
          >
            Return to Venues
          </button>
        </div>
      }
    >
      <div className="min-h-screen bg-background text-foreground pt-16 pb-24">
        <Header title="Mingle" />
        
        <main className="container mx-auto px-4 mt-6">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-8 bg-muted rounded-full w-2/3"></div>
              <div className="h-32 bg-muted rounded-2xl w-full"></div>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-[3/4] bg-muted rounded-2xl"></div>
                ))}
              </div>
            </div>
          ) : venue ? (
            <div className="animate-fade-in">
              <VenueHeader
                venue={venue}
                onCheckOut={handleCheckOut}
                isCheckedIn={isCheckedIn}
                isVisible={isVisible}
                activeZone={activeZone}
                timeRemaining={timeRemaining}
                expiryTime={expiryTime}
                onZoneSelect={handleZoneSelect}
                onToggleVisibility={toggleVisibility}
              />
              
              <div>
                <h2 className="text-lg font-medium mb-4">People Here</h2>
                
                {usersAtVenue.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3 overflow-y-auto max-h-[calc(100vh-220px)] pb-16 p-1">
                    {usersAtVenue.map((user) => (
                      <UserCard 
                        key={user.id} 
                        user={user}
                        interests={interests}
                        setInterests={setInterests}
                        matches={matches}
                        setMatches={setMatches}
                        currentUser={currentUser}
                        onExpressInterest={handleExpressInterest}
                        hasPendingInterest={likedUsers.includes(user.id)}
                        hasMatch={matches.some(
                          m => (m.userId === currentUser.id && m.matchedUserId === user.id) || 
                               (m.userId === user.id && m.matchedUserId === currentUser.id)
                        )}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-card rounded-2xl border border-border/30 shadow-bubble">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
                      <Users className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No one's here yet</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mb-4">
                      Be the first to check in
                    </p>
                    <button
                      onClick={() => navigate('/venues')}
                      className="py-2 px-4 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
                    >
                      Find Another Venue
                    </button>
                  </div>
                )}
              </div>
              
              {/* Floating Action Button */}
              <div className="floating-action-button animate-scale-in">
                <Plus size={24} />
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">Venue not found</h3>
              <p className="text-muted-foreground mb-4">
                The venue you're looking for doesn't exist or has been removed.
              </p>
              <button
                onClick={() => navigate('/venues')}
                className="py-2 px-4 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
              >
                Find People Nearby
              </button>
            </div>
          )}
        </main>
        
        {showMatchNotification && currentMatch && (
          <MatchNotification 
            match={currentMatch}
            currentUserId={currentUser.id}
            onClose={() => setShowMatchNotification(false)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default ActiveVenue;
