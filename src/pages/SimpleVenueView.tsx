
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import MatchNotification from '@/components/MatchNotification';
import { User, Venue, Match, Interest } from '@/types';
import { venues, getUsersAtVenue } from '@/data/mockData';
import { Users } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Import our new components
import VenueHeader from '@/components/venue/VenueHeader';
import ZoneSelector from '@/components/ZoneSelector'; // Using the existing one
import LikesCounter from '@/components/venue/LikesCounter';
import UserGrid from '@/components/venue/UserGrid';

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
  const [currentZone, setCurrentZone] = useState<string>('Main Area');
  
  const [likesRemaining, setLikesRemaining] = useState(() => {
    if (id) {
      const saved = localStorage.getItem(`likesRemaining-${id}`);
      return saved ? parseInt(saved, 10) : 3;
    }
    return 3;
  });

  const [showInterestSent, setShowInterestSent] = useState(false);
  const [lastLikedUser, setLastLikedUser] = useState<User | null>(null);
  
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
  
  const currentUser = {
    id: 'current-user-id',
    name: 'Current User'
  };
  
  useEffect(() => {
    window.showToast = (message) => {
      setToastMessage(message);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
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
  
  useEffect(() => {
    if (interests.length > 0) {
      const lastInterest = interests[interests.length - 1];
      const likedUser = usersAtVenue.find(user => user.id === lastInterest.toUserId);
      if (likedUser) {
        setLastLikedUser(likedUser);
      }
    }
  }, [interests, usersAtVenue]);
  
  useEffect(() => {
    if (!id) return;
    
    const foundVenue = venues.find(v => v.id === id);
    setVenue(foundVenue || null);
    
    const users = getUsersAtVenue(id);
    setUsersAtVenue(users);
    
    setTimeout(() => {
      setLoading(false);
    }, 300);
    
  }, [id]);
  
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
              <VenueHeader 
                venue={venue} 
                onCheckOut={() => navigate('/venues')} 
              />
              
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
              
              <ZoneSelector 
                activeZone={currentZone}
                zones={availableZones}
                onZoneSelect={handleZoneSelect}
                className="mb-6"
              />
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[20px] font-semibold text-[#202020]">People Here</h2>
                  
                  <LikesCounter count={likesRemaining} />
                </div>
                
                <UserGrid
                  users={usersAtVenue}
                  interests={interests}
                  setInterests={setInterests}
                  matches={matches}
                  setMatches={setMatches}
                  currentUser={currentUser}
                  likesRemaining={likesRemaining}
                  setLikesRemaining={setLikesRemaining}
                  venueId={id || 'unknown'}
                />
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
        
        {showToast && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg z-50">
            {toastMessage}
          </div>
        )}

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
