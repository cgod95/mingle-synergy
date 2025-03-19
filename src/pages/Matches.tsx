
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { User, Match as MatchType } from '@/types';
import { users } from '@/data/mockData';
import { Clock, Heart, Share2, Shield, Flag } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from '@/lib/utils';

const Matches = () => {
  const { toast } = useToast();
  const [activeMatches, setActiveMatches] = useState<MatchType[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Mock current user ID
  const currentUserId = 'u6';
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
      
      // Demo data - in a real app this would come from the backend
      setActiveMatches([
        {
          id: 'm1',
          userId: currentUserId,
          matchedUserId: 'u1',
          venueId: 'v1',
          timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
          isActive: true,
          expiresAt: Date.now() + 1000 * 60 * 60 * 2.5, // 2.5 hours from now
          contactShared: false
        },
        {
          id: 'm2',
          userId: 'u2',
          matchedUserId: currentUserId,
          venueId: 'v2',
          timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
          isActive: true,
          expiresAt: Date.now() + 1000 * 60 * 60 * 2, // 2 hours from now
          contactShared: true
        },
        {
          id: 'm3',
          userId: currentUserId,
          matchedUserId: 'u3',
          venueId: 'v3',
          timestamp: Date.now() - 1000 * 60 * 90, // 1.5 hours ago
          isActive: true,
          expiresAt: Date.now() + 1000 * 60 * 60 * 1.5, // 1.5 hours from now
          contactShared: false
        },
      ]);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const getMatchedUser = (match: MatchType): User => {
    const matchedUserId = match.userId === currentUserId ? match.matchedUserId : match.userId;
    return users.find(user => user.id === matchedUserId) as User;
  };
  
  const getTimeRemaining = (expiresAt: number): string => {
    const timeRemaining = Math.max(0, expiresAt - Date.now());
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hoursRemaining}h ${minutesRemaining}m`;
  };
  
  const handleShareContact = (matchId: string) => {
    // Update match
    setActiveMatches(matches => matches.map(match => 
      match.id === matchId ? { ...match, contactShared: true } : match
    ));
    
    toast({
      title: "Contact shared",
      description: "If they also share, you'll both receive contact details after match expires",
    });
  };
  
  const handleBlock = (userId: string) => {
    // Remove match and block user
    setActiveMatches(matches => matches.filter(match => 
      !(match.userId === userId || match.matchedUserId === userId)
    ));
    
    toast({
      title: "User blocked",
      description: "You won't see this person anymore",
    });
  };
  
  const handleReport = (userId: string) => {
    toast({
      title: "Report submitted",
      description: "Thank you for keeping Proximity safe",
    });
  };
  
  return (
    <div className="min-h-screen bg-background text-foreground pt-16 pb-8">
      <Header />
      
      <main className="container mx-auto px-4 mt-6">
        <h1 className="text-3xl font-semibold mb-6 animate-fade-in">Your Matches</h1>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-xl border border-border animate-pulse">
                <div className="p-4 flex items-center">
                  <div className="w-16 h-16 bg-muted rounded-full mr-4"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-muted rounded w-24 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-40"></div>
                  </div>
                  <div className="w-20 h-10 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activeMatches.length > 0 ? (
          <div className="space-y-4 animate-fade-in">
            <p className="text-muted-foreground mb-4">
              You have {activeMatches.length} active {activeMatches.length === 1 ? 'match' : 'matches'}. Matches expire after 3 hours.
            </p>
            
            {activeMatches.map((match) => {
              const matchedUser = getMatchedUser(match);
              return (
                <div key={match.id} className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <div className="flex items-center mb-4 sm:mb-0">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-background mr-4">
                          <img 
                            src={matchedUser.photos[0]} 
                            alt={matchedUser.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-medium">{matchedUser.name}</h3>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock size={14} className="mr-1" />
                            <span>Expires in {getTimeRemaining(match.expiresAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1"></div>
                      
                      <div className="flex space-x-2">
                        {match.contactShared ? (
                          <Button
                            variant="secondary"
                            disabled
                            className="text-sm"
                          >
                            <Share2 size={14} className="mr-2" /> 
                            Contact Shared
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleShareContact(match.id)}
                            className="bg-[#3A86FF] hover:bg-[#3A86FF]/90 text-sm"
                          >
                            <Share2 size={14} className="mr-2" /> 
                            Share Contact
                          </Button>
                        )}
                        
                        <div className="relative group">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9"
                          >
                            <Shield size={16} />
                          </Button>
                          
                          <div className="absolute right-0 top-full mt-2 w-48 bg-card rounded-lg border border-border shadow-lg z-10 hidden group-hover:block">
                            <div className="p-1">
                              <button
                                onClick={() => handleBlock(matchedUser.id)}
                                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors flex items-center"
                              >
                                <Shield size={14} className="mr-2" /> Block user
                              </button>
                              <button
                                onClick={() => handleReport(matchedUser.id)}
                                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors flex items-center text-destructive"
                              >
                                <Flag size={14} className="mr-2" /> Report user
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>Maximum of 10 active matches at one time</p>
              <p>Matches automatically expire after 3 hours</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">No matches yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Check in to venues and express interest in people you'd like to meet.
            </p>
            <Button
              className="mt-6 bg-[#3A86FF] hover:bg-[#3A86FF]/90"
              onClick={() => window.location.href = '/venues'}
            >
              Find Venues
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Matches;
