
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { User, Venue } from '@/types';
import { venues, getUsersAtVenue } from '@/data/mockData';
import { Users, Heart, ArrowLeft } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const SimpleVenueView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [venue, setVenue] = useState<Venue | null>(null);
  const [usersAtVenue, setUsersAtVenue] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedUsers, setLikedUsers] = useState<string[]>([]);
  
  // Load venue and users
  useEffect(() => {
    if (!id) return;
    
    // Find venue
    const foundVenue = venues.find(v => v.id === id);
    setVenue(foundVenue || null);
    
    // Get users at this venue
    const users = getUsersAtVenue(id);
    console.log(`SimpleVenueView: Found ${users.length} users at venue ${id}`, users);
    setUsersAtVenue(users);
    
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 500);
    
  }, [id]);
  
  const handleLikeUser = (userId: string) => {
    if (likedUsers.includes(userId)) {
      setLikedUsers(prev => prev.filter(id => id !== userId));
      toast({
        title: "Removed interest",
        description: "You've removed your interest in this person",
      });
    } else {
      setLikedUsers(prev => [...prev, userId]);
      toast({
        title: "Interest Sent!",
        description: "They'll be notified of your interest.",
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-background text-foreground pt-16 pb-24">
      <Header />
      
      <main className="container mx-auto px-4 mt-6">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-muted rounded w-2/3"></div>
            <div className="h-16 bg-muted rounded w-full"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[3/4] bg-muted rounded"></div>
              ))}
            </div>
          </div>
        ) : venue ? (
          <div className="animate-fade-in">
            {/* Simple Venue Header */}
            <div className="flex items-center mb-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/venues')}
                className="mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-semibold">{venue.name}</h1>
            </div>
            
            <div className="bg-card rounded-xl border border-border/30 p-4 mb-6 shadow-sm">
              <h2 className="text-lg font-medium mb-2">About This Venue</h2>
              <p className="text-muted-foreground mb-2">{venue.address}</p>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Users size={16} />
                <span>{venue.checkInCount} people here now</span>
              </div>
            </div>
            
            {/* People Here Now - Main Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4">People Here Now</h2>
              
              {usersAtVenue.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[calc(100vh-300px)] pb-16 p-1">
                  {usersAtVenue.map((user) => (
                    <div 
                      key={user.id}
                      className="relative overflow-hidden rounded-xl bg-card border border-border/30 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <div className="aspect-[3/4] w-full overflow-hidden relative">
                        <img 
                          src={user.photos[0] + "?auto=format&fit=crop&w=600&q=80"} 
                          alt={user.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          loading="lazy"
                        />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent pointer-events-none"></div>
                        
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <div className="flex items-end justify-between">
                            <div>
                              <h3 className="text-base font-medium text-white">{user.name}</h3>
                              {user.zone && (
                                <div className="text-xs text-white/80">
                                  <span>{user.zone}</span>
                                </div>
                              )}
                            </div>
                            
                            <button
                              onClick={() => handleLikeUser(user.id)}
                              className={`rounded-full p-2 transition-all duration-300 transform hover:scale-110 active:scale-90 ${
                                likedUsers.includes(user.id) 
                                  ? "bg-[#FF5A5F] text-white shadow-[0_0_15px_rgba(255,90,95,0.3)]"
                                  : "bg-background/60 backdrop-blur-sm text-white hover:bg-[#FF5A5F] hover:text-white"
                              }`}
                              aria-label={likedUsers.includes(user.id) ? "Remove Interest" : "Express Interest"}
                            >
                              <Heart 
                                size={18} 
                                className={likedUsers.includes(user.id) ? "fill-white" : ""} 
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
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
                  <Button
                    onClick={() => navigate('/venues')}
                    variant="default"
                  >
                    Find Another Venue
                  </Button>
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
            <Button
              onClick={() => navigate('/venues')}
              variant="default"
            >
              Discover Venues
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default SimpleVenueView;
