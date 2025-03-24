
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Venue } from '@/types';
import { venues } from '@/data/mockData';
import { Users } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PageTransition, StaggeredList } from '@/components/animations/Transitions';
import VenueHeader from '@/components/venue/VenueHeader';
import ZoneSelector from '@/components/venue/ZoneSelector';
import LikesCounter from '@/components/venue/LikesCounter';
import UserGrid from '@/components/venue/UserGrid';
import { useToast } from '@/components/ui/toast/ToastContext';
import { getFromStorage, saveToStorage } from '@/utils/localStorageUtils';

// Empty state component
const EmptyState = ({ message }: { message: string }) => (
  <div className="py-12 text-center bg-gray-50 rounded-lg">
    <div className="text-gray-400 mb-2">
      <Users size={48} className="mx-auto" />
    </div>
    <p className="text-gray-500 font-medium">{message}</p>
    <p className="text-gray-400 text-sm mt-1">Be the first to check in</p>
  </div>
);

// Interest sent modal component
const InterestSentModal = ({ user, onClose }: { user: User | null, onClose: () => void }) => {
  if (!user) return null;
  
  return (
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
          onClick={onClose}
          className="bg-blue-500 text-white px-6 py-2 rounded-full font-medium"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

// Main component
const SimpleVenueView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [venue, setVenue] = useState<Venue | null>(null);
  const [usersAtVenue, setUsersAtVenue] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentZone, setCurrentZone] = useState('Main Area');
  
  // Get likes remaining from local storage
  const [likesRemaining, setLikesRemaining] = useState(() => {
    if (id) {
      return getFromStorage<number>(`likesRemaining-${id}`, 3);
    }
    return 3;
  });

  // Get liked users from local storage
  const [likedUsers, setLikedUsers] = useState<string[]>(() => {
    if (id) {
      return getFromStorage<string[]>(`likedUsers-${id}`, []);
    }
    return [];
  });

  const [showInterestSent, setShowInterestSent] = useState(false);
  const [lastLikedUser, setLastLikedUser] = useState<User | null>(null);
  
  const currentUser = {
    id: 'current-user-id',
    name: 'Current User'
  };
  
  useEffect(() => {
    if (!id) return;
    
    const foundVenue = venues.find(v => v.id === id);
    setVenue(foundVenue || null);
    
    // Mock data for users at this venue with proper type handling
    const mockUsers: User[] = [
      {
        id: 'user1',
        name: 'Alex',
        age: 28,
        photos: ['https://randomuser.me/api/portraits/men/32.jpg'],
        currentZone: 'Bar',
        isCheckedIn: true,
        isVisible: true,
        interests: ['music', 'travel'],
        gender: 'male' as const,
        interestedIn: ['female'] as ('male' | 'female' | 'non-binary' | 'other')[],
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
        gender: 'female' as const,
        interestedIn: ['male'] as ('male' | 'female' | 'non-binary' | 'other')[],
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
  
  const handleLikeUser = (userId: string) => {
    if (likesRemaining <= 0 || likedUsers.includes(userId)) return;
    
    // Find the user
    const user = usersAtVenue.find(u => u.id === userId);
    if (user) {
      setLastLikedUser(user);
    }
    
    // Update likes remaining and save to local storage
    const newLikesRemaining = likesRemaining - 1;
    setLikesRemaining(newLikesRemaining);
    if (id) {
      saveToStorage(`likesRemaining-${id}`, newLikesRemaining);
    }
    
    // Update liked users and save to local storage
    const newLikedUsers = [...likedUsers, userId];
    setLikedUsers(newLikedUsers);
    if (id) {
      saveToStorage(`likedUsers-${id}`, newLikedUsers);
    }
    
    // Show toast notification
    showToast('Interest sent!', 'success');
    
    setShowInterestSent(true);
    setTimeout(() => setShowInterestSent(false), 3000);
  };
  
  const handleZoneSelect = (zoneName: string) => {
    setCurrentZone(zoneName);
  };
  
  const availableZones = [
    'Main Area', 
    'Bar', 
    'Entrance', 
    'Outside', 
    'Upstairs'
  ];

  // Filter users by selected zone
  const filteredUsers = usersAtVenue.filter(user => 
    user.currentZone === currentZone
  );
  
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
                  expiryTime={Date.now() + (3 * 60 * 60 * 1000)} // 3 hours from now
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
                    {filteredUsers.length > 0 ? (
                      <UserGrid
                        users={filteredUsers}
                        onLikeUser={handleLikeUser}
                        likesRemaining={likesRemaining}
                        likedUsers={likedUsers}
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
        
        {showInterestSent && lastLikedUser && (
          <InterestSentModal
            user={lastLikedUser}
            onClose={() => setShowInterestSent(false)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default SimpleVenueView;
