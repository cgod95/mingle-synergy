
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import UserCard from '@/components/UserCard';
import MatchNotification from '@/components/MatchNotification';
import VenueHeader from '@/components/VenueHeader';
import { User, Venue, Match } from '@/types';
import { venues, getUsersAtVenue } from '@/data/mockData';
import { Users } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useVenues } from '@/hooks/useVenues';

const ActiveVenue = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { checkInToVenue, checkOutFromVenue } = useVenues();
  
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [interests, setInterests] = useState<string[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [expiryTime, setExpiryTime] = useState<Date>(new Date());
  const [usersAtVenue, setUsersAtVenue] = useState<User[]>([]);
  
  const mockCurrentUserId = 'u6'; // For demonstration purposes
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    // Find venue
    if (id) {
      const foundVenue = venues.find(v => v.id === id);
      if (foundVenue) {
        setVenue(foundVenue);
        setIsCheckedIn(true);
        
        // Load users at this venue
        const users = getUsersAtVenue(id);
        console.log(`Loaded ${users.length} users for venue ${id}`);
        setUsersAtVenue(users);
        
        // Set expiry time
        const hours = getExpiryHours(foundVenue.type);
        setTimeRemaining(hours * 60 * 60);
        
        // Set expiry time date object
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + hours);
        setExpiryTime(expiryDate);
      }
    }
    
    return () => clearTimeout(timer);
  }, [id]);
  
  // Timer effect for countdown
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
  
  // Get timer based on venue type
  const getExpiryHours = (type: string) => {
    switch (type) {
      case 'cafe': return 1;
      case 'bar': return 3;
      case 'restaurant': return 2;
      case 'gym': return 2;
      default: return 3;
    }
  };
  
  const handleExpressInterest = (userId: string) => {
    // Check if already interested
    if (interests.includes(userId)) {
      return;
    }
    
    // Add to interests
    setInterests([...interests, userId]);
    toast({
      title: "Interest Sent!",
      description: "They'll be notified of your interest.",
    });
    
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
        
        setMatches(prev => {
          const updatedMatches = [...prev, newMatch];
          // Limit to 10 most recent matches
          return updatedMatches.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
        });
        
        setCurrentMatch(newMatch);
        setShowMatchNotification(true);
      }
    }, 1000);
  };
  
  const handleCheckOut = () => {
    setIsCheckedIn(false);
    setActiveZone(null);
    checkOutFromVenue();
    setTimeRemaining(0);
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
  
  console.log('Current venue:', venue?.name);
  console.log('Users at venue:', usersAtVenue.length, usersAtVenue.map(u => u.name).join(', '));
  
  return (
    <div className="min-h-screen bg-background text-foreground pt-16 pb-24">
      <Header />
      
      <main className="container mx-auto px-4 mt-6">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-muted rounded w-2/3"></div>
            <div className="h-32 bg-muted rounded w-full"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[3/4] bg-muted rounded"></div>
              ))}
            </div>
          </div>
        ) : venue ? (
          <div className="animate-fade-in">
            {/* Compact Venue Header */}
            <VenueHeader
              venue={venue}
              isCheckedIn={isCheckedIn}
              isVisible={isVisible}
              activeZone={activeZone}
              timeRemaining={timeRemaining}
              expiryTime={expiryTime}
              onCheckOut={handleCheckOut}
              onZoneSelect={handleZoneSelect}
              onToggleVisibility={toggleVisibility}
            />
            
            {/* People Here Now Section - Main focus */}
            <div>
              <h2 className="text-lg font-medium mb-4">People Here Now</h2>
              
              {usersAtVenue.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[calc(100vh-220px)] pb-16 p-1">
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
                <div className="text-center py-8 bg-card rounded-xl border border-border/30 shadow-sm">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No one's here yet</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto mb-4">
                    Be the first to check in and others will see you here.
                  </p>
                  <button
                    onClick={() => navigate('/venues')}
                    className="py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Find Another Venue
                  </button>
                </div>
              )}
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
              className="py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
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
