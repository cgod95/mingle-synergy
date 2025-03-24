
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Venue } from '@/types';
import { venues } from '@/data/mockData';
import { Users, Heart } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PageTransition, StaggeredList, StaggeredItem } from '@/components/animations/Transitions';

// Define component interfaces for internal use
interface InternalUser {
  id: string;
  name: string;
  age?: number;
  photos: string[];
  currentZone?: string;
}

interface InternalVenue {
  id: string;
  name: string;
  address?: string;
}

// Internal components
const VenueHeader = ({ venue, onCheckOut }) => (
  <div className="p-4 bg-white rounded-xl shadow-sm mb-4">
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-xl font-bold">{venue.name}</h1>
        {venue.address && <p className="text-gray-600 text-sm">{venue.address}</p>}
      </div>
      <button 
        onClick={onCheckOut}
        className="text-red-500 text-sm font-medium"
      >
        Check Out
      </button>
    </div>
  </div>
);

const LikesCounter = ({ count }) => (
  <div className="mb-4 px-4 py-2 bg-blue-50 rounded-lg inline-flex items-center">
    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mr-2">
      {count}
    </div>
    <span className="text-sm font-medium text-blue-800">likes remaining</span>
  </div>
);

const UserGrid = ({ users, onLikeUser, likesRemaining }) => (
  <div className="grid grid-cols-3 gap-3">
    {users.map(user => (
      <div key={user.id} className="relative rounded-xl overflow-hidden shadow-sm">
        <img 
          src={user.photos[0]} 
          alt={user.name}
          className="w-full aspect-square object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
          <div className="text-white">
            <div className="font-medium">{user.name}</div>
            {user.age && <div className="text-sm">{user.age}</div>}
          </div>
        </div>
        <button 
          onClick={() => likesRemaining > 0 && onLikeUser(user.id)}
          disabled={likesRemaining <= 0}
          className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center ${
            likesRemaining > 0 
              ? 'bg-white/80 text-gray-600 hover:bg-gray-100' 
              : 'bg-gray-300/80 text-gray-400'
          }`}
        >
          <Heart size={20} strokeWidth={2} />
        </button>
      </div>
    ))}
  </div>
);

const EmptyState = ({ message }) => (
  <div className="py-12 text-center bg-gray-50 rounded-lg">
    <div className="text-gray-400 mb-2">
      <Users size={48} className="mx-auto" />
    </div>
    <p className="text-gray-500 font-medium">{message}</p>
    <p className="text-gray-400 text-sm mt-1">Be the first to check in</p>
  </div>
);

const ZoneSelector = ({ zones, selectedZone, onZoneSelect, users }) => {
  // Count users in each zone
  const userCountByZone = zones.reduce((counts, zone) => {
    counts[zone] = users.filter(user => user.currentZone === zone).length;
    return counts;
  }, {});
  
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Where are you?</h3>
      
      <div className="flex flex-wrap gap-2">
        {zones.map(zone => {
          const isActive = zone === selectedZone;
          const userCount = userCountByZone[zone] || 0;
          
          return (
            <button
              key={zone}
              onClick={() => onZoneSelect(zone)}
              className={`px-3 py-1.5 rounded-full text-sm ${
                isActive 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {zone}
              {userCount > 0 && <span className="ml-1 text-xs">({userCount})</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Toast notification component
const ToastNotification = ({ message, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [onClose, duration]);
  
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg z-50">
      {message}
    </div>
  );
};

// Main component
const SimpleVenueView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [venue, setVenue] = useState(null);
  const [usersAtVenue, setUsersAtVenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentZone, setCurrentZone] = useState('Main Area');
  
  const [likesRemaining, setLikesRemaining] = useState(() => {
    if (id) {
      const saved = localStorage.getItem(`likesRemaining-${id}`);
      return saved ? parseInt(saved, 10) : 3;
    }
    return 3;
  });

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showInterestSent, setShowInterestSent] = useState(false);
  const [lastLikedUser, setLastLikedUser] = useState(null);
  
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
    
    return () => {
      delete window.showToast;
    };
  }, []);
  
  useEffect(() => {
    if (!id) return;
    
    const foundVenue = venues.find(v => v.id === id);
    setVenue(foundVenue || null);
    
    // Mock data for users at this venue
    const mockUsers = [
      {
        id: 'user1',
        name: 'Alex',
        age: 28,
        photos: ['https://randomuser.me/api/portraits/men/32.jpg'],
        currentZone: 'Bar',
        isCheckedIn: true,
        isVisible: true,
        interests: ['music', 'travel'],
        gender: 'male',
        interestedIn: ['female'],
        ageRangePreference: { min: 21, max: 35 },
        matches: [],
        likedUsers: [],
        blockedUsers: []
      },
      {
        id: 'user2',
        name: 'Jordan',
        age: 26,
        photos: ['https://randomuser.me/api/portraits/women/44.jpg'],
        currentZone: 'Main Area',
        isCheckedIn: true,
        isVisible: true,
        interests: ['hiking', 'cooking'],
        gender: 'female',
        interestedIn: ['male'],
        ageRangePreference: { min: 25, max: 35 },
        matches: [],
        likedUsers: [],
        blockedUsers: []
      },
    ];
    
    setUsersAtVenue(mockUsers);
    
    setTimeout(() => {
      setLoading(false);
    }, 300);
    
  }, [id]);
  
  const handleCheckOut = () => {
    navigate('/venues');
  };
  
  const handleLikeUser = (userId) => {
    if (likesRemaining <= 0) return;
    
    // Find the user
    const user = usersAtVenue.find(u => u.id === userId);
    if (user) {
      setLastLikedUser(user);
    }
    
    // Update likes remaining
    setLikesRemaining(prev => {
      const newValue = prev - 1;
      localStorage.setItem(`likesRemaining-${id}`, String(newValue));
      return newValue;
    });
    
    // Show toast notification
    setToastMessage('Interest sent!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    
    setShowInterestSent(true);
    setTimeout(() => setShowInterestSent(false), 3000);
  };
  
  const handleZoneSelect = (zoneName) => {
    setCurrentZone(zoneName);
  };
  
  const availableZones = [
    'Main Area', 
    'Bar', 
    'Entrance', 
    'Outside', 
    'Upstairs'
  ];
  
  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">Unable to load venue information.</p>
          <button 
            onClick={() => navigate('/venues')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Return to Venues
          </button>
        </div>
      }
    >
      <div className="min-h-screen bg-[#F9FAFB] text-[#202020] pt-16 pb-24">
        <PageTransition>
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
                  onCheckOut={handleCheckOut} 
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
                  zones={availableZones}
                  selectedZone={currentZone}
                  onZoneSelect={handleZoneSelect}
                  users={usersAtVenue}
                />
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[20px] font-semibold text-[#202020]">People Here</h2>
                    
                    <LikesCounter count={likesRemaining} />
                  </div>
                  
                  <StaggeredList>
                    {usersAtVenue.length > 0 ? (
                      <UserGrid
                        users={usersAtVenue}
                        onLikeUser={handleLikeUser}
                        likesRemaining={likesRemaining}
                      />
                    ) : (
                      <EmptyState message="No one's here yet" />
                    )}
                  </StaggeredList>
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
        </PageTransition>
        
        {showToast && (
          <ToastNotification
            message={toastMessage}
            onClose={() => setShowToast(false)}
          />
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
      </div>
    </ErrorBoundary>
  );
};

export default SimpleVenueView;
