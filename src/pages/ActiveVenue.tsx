
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import UserCard from '@/components/UserCard';
import MatchNotification from '@/components/MatchNotification';
import ToggleButton from '@/components/ToggleButton';
import ZoneSelector from '@/components/ZoneSelector';
import CheckInTimer from '@/components/CheckInTimer';
import { User, Venue, Match } from '@/types';
import { venues } from '@/data/mockData';
import { ArrowLeft, Users, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/components/ui/use-toast";
import { useVenues } from '@/hooks/useVenues';

const ActiveVenue = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { checkInToVenue, checkOutFromVenue, usersAtVenue } = useVenues();
  
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
        setIsCheckedIn(true);
        
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
  
  const handleCheckIn = (zone?: string) => {
    setIsCheckedIn(true);
    if (zone) {
      setActiveZone(zone);
    }
    
    // Use the checkInToVenue from our hook
    if (id && venue) {
      checkInToVenue(id, zone);
      
      // Reset the timer based on venue type
      const hours = getExpiryHours(venue.type);
      setTimeRemaining(hours * 60 * 60);
      
      // Set expiry time date object
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + hours);
      setExpiryTime(expiryDate);
    }
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
  
  const getVenueZones = () => {
    if (!venue) return [];
    
    if (venue.type === 'bar') {
      return [
        { id: 'entrance', name: 'Near Entrance' },
        { id: 'bar', name: 'At the Bar' },
        { id: 'upstairs', name: 'Upstairs' }
      ];
    } else if (venue.type === 'restaurant') {
      return [
        { id: 'inside', name: 'Inside' },
        { id: 'outside', name: 'Outside' },
        { id: 'bar', name: 'At the Bar' }
      ];
    } else if (venue.type === 'cafe') {
      return [
        { id: 'counter', name: 'Near Counter' },
        { id: 'seated', name: 'Seated Area' },
        { id: 'outside', name: 'Outside' }
      ];
    } else if (venue.type === 'gym') {
      return [
        { id: 'weights', name: 'Weights Area' },
        { id: 'cardio', name: 'Cardio Section' },
        { id: 'studio', name: 'Studio Classes' }
      ];
    }
    return [];
  };
  
  const zones = getVenueZones();
  
  return (
    <div className="min-h-screen bg-background text-foreground pt-16 pb-24">
      <Header />
      
      <main className="container mx-auto px-4 mt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back to Discover
        </button>
        
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-2/3 mb-4"></div>
            <div className="h-6 bg-muted rounded w-full mb-6"></div>
          </div>
        ) : venue ? (
          <div className="animate-fade-in">
            {/* Visibility Toggle */}
            <div className="mb-4">
              <ToggleButton 
                isVisible={isVisible} 
                onToggle={toggleVisibility} 
              />
            </div>
            
            {/* Venue Header with Check-In Status */}
            <div className="bg-card p-4 rounded-xl border border-border mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-semibold mb-1">{venue.name}</h1>
                  <p className="text-muted-foreground mb-2">
                    {venue.address}
                  </p>
                  <div className="flex items-center text-[#3A86FF]">
                    <Users className="mr-1" size={16} />
                    <span className="font-medium">{venue.checkInCount} people here now</span>
                  </div>
                </div>
                
                {isCheckedIn ? (
                  <div className="flex flex-col items-end">
                    <CheckInTimer 
                      timeRemaining={timeRemaining}
                      expiryTime={expiryTime}
                    />
                    <button
                      onClick={handleCheckOut}
                      className="text-sm text-red-500 hover:text-red-600 mt-2 transition-colors"
                    >
                      Check Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleCheckIn()}
                    className="py-2 px-4 bg-[#3A86FF] text-white rounded-lg hover:bg-[#3A86FF]/90 transition-colors"
                  >
                    Check In
                  </button>
                )}
              </div>
              
              {/* Zone Selector */}
              {isCheckedIn && (
                <ZoneSelector
                  zones={zones}
                  activeZone={activeZone}
                  onZoneSelect={handleZoneSelect}
                />
              )}
            </div>
            
            {/* People Here Now Section */}
            <div className="mb-6">
              <h2 className="text-xl font-medium mb-4">People Here Now</h2>
              
              {usersAtVenue.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 overflow-y-auto max-h-[calc(100vh-300px)] p-1">
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
              onClick={() => navigate('/venues')}
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
