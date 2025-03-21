
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import UserCard from '@/components/UserCard';
import MatchNotification from '@/components/MatchNotification';
import { User, Venue, Match } from '@/types';
import { venues, users, getUsersAtVenue } from '@/data/mockData';
import { ArrowLeft, Users, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/components/ui/use-toast";

const ActiveVenue = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [venue, setVenue] = useState<Venue | null>(null);
  const [usersAtVenue, setUsersAtVenue] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [interests, setInterests] = useState<string[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [activeZone, setActiveZone] = useState<string | null>(null);
  
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
        
        setMatches([...matches, newMatch]);
        setCurrentMatch(newMatch);
        setShowMatchNotification(true);
      }
    }, 1000);
  };
  
  const handleCheckIn = (zone?: string) => {
    setIsCheckedIn(true);
    if (zone) {
      setActiveZone(zone);
      toast({
        title: `Checked into ${zone}`,
        description: "You're now visible in this zone for the next few hours.",
      });
    } else {
      toast({
        title: "Checked In!",
        description: "You're now visible at this venue for the next few hours.",
      });
    }
  };
  
  const getVenueZones = () => {
    if (!venue || !venue.zones) return [];
    
    return [
      { id: 'entrance', name: 'Near Entrance' },
      { id: 'bar', name: 'At the Bar' },
      { id: 'lounge', name: 'Lounge Area' },
      { id: 'outside', name: 'Outside' },
    ];
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
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-semibold mb-1">{venue.name}</h1>
                <p className="text-muted-foreground">{venue.checkInCount} people here now</p>
              </div>
              
              {!isCheckedIn && (
                <button
                  onClick={() => handleCheckIn()}
                  className="py-2 px-4 bg-[#3A86FF] text-white rounded-lg hover:bg-[#3A86FF]/90 transition-colors"
                >
                  Check In
                </button>
              )}
            </div>
            
            {zones.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-medium mb-3">Where are you?</h2>
                <div className="flex flex-wrap gap-2">
                  {zones.map((zone) => (
                    <button
                      key={zone.id}
                      onClick={() => handleCheckIn(zone.name)}
                      className={cn(
                        "py-2 px-3 rounded-full text-sm flex items-center",
                        activeZone === zone.name
                          ? "bg-[#3A86FF] text-white"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      )}
                    >
                      <MapPin size={14} className="mr-1" />
                      {zone.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mb-6">
              <h2 className="text-xl font-medium mb-4">People Here Now</h2>
              
              {usersAtVenue.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
