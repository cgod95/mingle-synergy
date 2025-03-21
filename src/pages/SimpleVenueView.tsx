
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import MatchNotification from '@/components/MatchNotification';
import ZoneSelector from '@/components/ZoneSelector';
import { User, Venue, Match, Interest } from '@/types';
import { venues, getUsersAtVenue } from '@/data/mockData';
import { Users, Heart, ArrowLeft, Clock } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import UserCard from '@/components/UserCard';

// Declare global window types for TypeScript
declare global {
  interface Window {
    showToast?: (message: string) => void;
    showMatchModal?: (user: User) => void;
  }
}

const SimpleVenueView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [venue, setVenue] = useState<Venue | null>(null);
  const [usersAtVenue, setUsersAtVenue] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState<{[key: string]: boolean}>({});
  const [currentZone, setCurrentZone] = useState<string>('Main Area');
  
  // Add likes remaining state
  const [likesRemaining, setLikesRemaining] = useState(() => {
    if (id) {
      const saved = localStorage.getItem(`likesRemaining-${id}`);
      return saved ? parseInt(saved, 10) : 3;
    }
    return 3;
  });

  // Add interest sent animation state
  const [showInterestSent, setShowInterestSent] = useState(false);
  const [lastLikedUser, setLastLikedUser] = useState<User | null>(null);
  
  // New state for interests and matches
  const [interests, setInterests] = useState<Interest[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('interests') || '[]');
    } catch (e) {
      return [];
    }
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('matches') || '[]');
    } catch (e) {
      return [];
    }
  });

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  
  // Mock current user (replace with your auth logic)
  const currentUser = {
    id: 'current-user-id',
    name: 'Current User'
  };
  
  // Add these functions to expose the notifications globally
  useEffect(() => {
    window.showToast = (message) => {
      // Show toast
      setToastMessage(message);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
      // For "Interest sent" message, show the animation instead
      if (message === 'Interest sent!') {
        setShowInterestSent(true);
        setTimeout(() => setShowInterestSent(false), 3000);
      }
    };
    
    window.showMatchModal = (user) => {
      setMatchedUser(user);
      setShowMatchModal(true);
    };
    
    return () => {
      delete window.showToast;
      delete window.showMatchModal;
    };
  }, []);
  
  // Track interests to update lastLikedUser
  useEffect(() => {
    if (interests.length > 0) {
      const lastInterest = interests[interests.length - 1];
      const likedUser = usersAtVenue.find(user => user.id === lastInterest.toUserId);
      if (likedUser) {
        setLastLikedUser(likedUser);
      }
    }
  }, [interests, usersAtVenue]);
  
  // Load venue and users
  useEffect(() => {
    if (!id) return;
    
    // Find venue
    const foundVenue = venues.find(v => v.id === id);
    setVenue(foundVenue || null);
    
    // Get users at this venue - all 12 users will be at each venue
    const users = getUsersAtVenue(id);
    setUsersAtVenue(users);
    
    // Initialize image loading state
    const initialLoadingState: {[key: string]: boolean} = {};
    users.forEach(user => {
      initialLoadingState[user.id] = false;
    });
    setImagesLoaded(initialLoadingState);
    
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 300);
    
  }, [id]);
  
  const handleImageLoad = (userId: string) => {
    setImagesLoaded(prev => ({
      ...prev,
      [userId]: true
    }));
  };
  
  const formatExpiryTime = () => {
    if (!venue) return '';
    
    const now = new Date();
    const expiryDate = new Date(now.getTime() + (venue.expiryTime || 120) * 60 * 1000);
    
    // Format as "4:37 PM"
    return expiryDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };
  
  const handleCloseMatch = () => {
    setShowMatchModal(false);
  };
  
  const handleShareContact = () => {
    if (matchedUser) {
      toast({
        title: "Contact Shared",
        description: "If they also share their contact, you'll both receive each other's info.",
      });
    }
    setShowMatchModal(false);
  };
  
  // Handle zone selection
  const handleZoneSelect = (zoneName: string) => {
    setCurrentZone(zoneName);
    toast({
      title: "Zone Updated",
      description: `You're now in ${zoneName}`,
    });
  };
  
  const availableZones = [
    { id: 'z1', name: 'Main Area' },
    { id: 'z2', name: 'Bar' },
    { id: 'z3', name: 'Entrance' },
    { id: 'z4', name: 'Outside' },
    { id: 'z5', name: 'Upstairs' },
  ];
  
  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">Unable to load venue information.</p>
          <button 
            onClick={() => navigate('/venues')}
            className="px-4 py-2 bg-[#3A86FF] text-white rounded-lg"
          >
            Return to Venues
          </button>
        </div>
      }
    >
      <div className="min-h-screen bg-[#F9FAFB] text-[#202020] pt-16 pb-24">
        <Header />
        
        <main className="container mx-auto px-4 mt-4">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-8 bg-[#F1F5F9] rounded w-2/3"></div>
              <div className="h-16 bg-[#F1F5F9] rounded w-full"></div>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-[5/7] bg-[#F1F5F9] rounded-xl"></div>
                ))}
              </div>
            </div>
          ) : venue ? (
            <div className="animate-fade-in">
              {/* Venue Header - max 120px height */}
              <div className="bg-white rounded-xl border border-[#F1F5F9] p-4 mb-6 shadow-[0px_2px_8px_rgba(0,0,0,0.05)] max-h-[120px] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <button 
                      onClick={() => navigate('/venues')}
                      className="mr-3 text-[#505050] hover:text-[#202020]"
                      aria-label="Back"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div>
                      <h1 className="text-[18px] font-semibold text-[#202020] truncate">{venue.name}</h1>
                      <p className="text-[14px] text-[#505050] truncate">{venue.address}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => navigate('/venues')}
                    className="text-[14px] text-[#EF4444] hover:text-[#EF4444]/80 transition-colors"
                  >
                    Check Out
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center text-[#3A86FF] text-[14px]">
                    <Users size={16} className="mr-1.5" />
                    <span>{venue.checkInCount} people</span>
                  </div>
                  
                  <div className="flex items-center text-[#505050] text-[14px]">
                    <Clock size={16} className="mr-1.5" />
                    <span>Expires {formatExpiryTime()}</span>
                  </div>
                </div>
              </div>
              
              {/* Meta information about the venue */}
              <div className="bg-gray-50 px-4 py-3 rounded-lg mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm text-gray-500">Peak hours</span>
                    <p className="font-medium">7:00 PM - 10:00 PM</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Current mood</span>
                    <p className="font-medium">Buzzing</p>
                  </div>
                </div>
              </div>
              
              {/* Zone selector */}
              <ZoneSelector 
                activeZone={currentZone}
                zones={availableZones}
                onZoneSelect={handleZoneSelect}
                className="mb-6"
              />
              
              {/* People Here Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[20px] font-semibold text-[#202020]">People Here</h2>
                  
                  {/* Likes remaining indicator */}
                  <div className="bg-white/90 px-3 py-1 rounded-full text-sm font-medium shadow-sm border border-gray-100">
                    {likesRemaining} likes remaining
                  </div>
                </div>
                
                {usersAtVenue.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3 pb-16">
                    {usersAtVenue.map((user) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        interests={interests}
                        setInterests={setInterests}
                        matches={matches}
                        setMatches={setMatches}
                        currentUser={currentUser}
                        likesRemaining={likesRemaining}
                        setLikesRemaining={setLikesRemaining}
                        venueId={id || 'unknown'}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 mt-10 bg-white rounded-xl border border-[#F1F5F9] shadow-[0px_2px_8px_rgba(0,0,0,0.05)]">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
                      {/* Silhouette placeholder */}
                      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M32 32C38.6274 32 44 26.6274 44 20C44 13.3726 38.6274 8 32 8C25.3726 8 20 13.3726 20 20C20 26.6274 25.3726 32 32 32Z" fill="#F1F5F9"/>
                        <path d="M54 56C54 42.7452 44.2548 32 32 32C19.7452 32 10 42.7452 10 56" stroke="#F1F5F9" strokeWidth="4"/>
                      </svg>
                    </div>
                    <p className="text-[16px] text-[#505050]">No one here yet. Be the first.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F1F5F9] mb-4">
                <Users className="w-8 h-8 text-[#505050]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#202020]">Venue not found</h3>
              <p className="text-[#505050] mb-4">
                The venue you're looking for doesn't exist.
              </p>
              <button
                onClick={() => navigate('/venues')}
                className="py-2 px-4 bg-[#3A86FF] text-white rounded-lg hover:bg-[#3A86FF]/90 transition-colors shadow-[0_2px_10px_rgba(58,134,255,0.2)]"
              >
                Back
              </button>
            </div>
          )}
        </main>
        
        {/* Toast notification */}
        {showToast && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg z-50">
            {toastMessage}
          </div>
        )}

        {/* Interest Sent Animation */}
        {showInterestSent && lastLikedUser && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 animate-fade-in">
            <div className="bg-white/95 rounded-2xl p-6 shadow-xl max-w-xs text-center transform scale-in">
              <div className="w-16 h-16 mx-auto rounded-full bg-pink-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-1">Interest Sent!</h3>
              <p className="text-gray-600 mb-4">You'll be notified if they like you back</p>
              <button 
                onClick={() => setShowInterestSent(false)}
                className="bg-blue-500 text-white px-6 py-2 rounded-full font-medium"
              >
                Got it
              </button>
            </div>
          </div>
        )}

        {/* Match modal */}
        {showMatchModal && matchedUser && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-5/6 max-w-md p-6 animate-fade-in">
              <div className="text-center">
                <div className="mb-2 text-blue-500">
                  <svg className="w-16 h-16 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </div>
                <h2 className="text-xl font-bold mb-2">It's a Match!</h2>
                <p className="text-gray-600 mb-4">You and {matchedUser.name} have expressed interest in each other.</p>
                <img 
                  src={matchedUser.photos?.[0]} 
                  alt={matchedUser.name} 
                  className="w-24 h-24 mx-auto rounded-full object-cover border-4 border-blue-100 mb-4"
                />
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setShowMatchModal(false)} 
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-full text-gray-600"
                  >
                    Later
                  </button>
                  <button 
                    onClick={() => {
                      setShowMatchModal(false);
                      // Navigate to matches tab
                    }}
                    className="flex-1 py-2 px-4 bg-blue-500 rounded-full text-white"
                  >
                    Say Hello
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {showMatchModal === false && matchedUser && (
          <MatchNotification 
            match={{
              id: `match_${Date.now()}`,
              userId: currentUser.id,
              matchedUserId: matchedUser.id,
              venueId: matchedUser.currentVenue || 'unknown',
              timestamp: Date.now(),
              isActive: true,
              expiresAt: Date.now() + (3 * 60 * 60 * 1000),
              contactShared: false
            }}
            currentUserId={currentUser.id}
            onClose={handleCloseMatch}
            onShareContact={handleShareContact}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default SimpleVenueView;
