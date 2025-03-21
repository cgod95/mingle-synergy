
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import VenueCard from '@/components/VenueCard';
import UserCard from '@/components/UserCard';
import { Venue, Interest, Match, User } from '@/types';
import { venues as mockVenues, users as mockUsers } from '@/data/mockData';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppState } from '@/context/AppStateContext';

// Declare global window types for TypeScript
declare global {
  interface Window {
    showToast?: (message: string) => void;
    showMatchModal?: (user: User) => void;
  }
}

const VenueList = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { venueId } = useParams();
  const [venueUsers, setVenueUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser, interests, setInterests, matches, setMatches, matchedUser, setMatchedUser, showMatchModal, setShowMatchModal } = useAppState();

  // Add these functions to expose the notifications globally
  useEffect(() => {
    window.showToast = (message) => {
      // Use toast from context or local state
    };
    
    window.showMatchModal = (user) => {
      if (setMatchedUser && setShowMatchModal) {
        setMatchedUser(user);
        setShowMatchModal(true);
      }
    };
    
    return () => {
      delete window.showToast;
      delete window.showMatchModal;
    };
  }, [setMatchedUser, setShowMatchModal]);

  // Fetch venues on component mount
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setTimeout(() => {
          setVenues(mockVenues);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching venues:', error);
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  // Fetch users for this venue
  useEffect(() => {
    if (venueId) {
      setIsLoading(true);
      
      // Always load at least 8 mock users for demo purposes
      const usersAtVenue = mockUsers
        .filter(user => user.isCheckedIn && (
          user.currentVenue === venueId || Math.random() > 0.3)
        )
        .slice(0, 12);
      
      // Simulate API delay
      setTimeout(() => {
        setVenueUsers(usersAtVenue);
        setIsLoading(false);
      }, 800);
    }
  }, [venueId]);

  return (
    <div className="pb-20 pt-16">
      <Header title="Venues" />

      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton 
                key={i} 
                className="w-full h-32 rounded-xl"
              />
            ))}
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-6">Find People Nearby</h1>
            <div className="space-y-4">
              {venues.map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>

            {venueId && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">People Here</h2>
                
                {isLoading ? (
                  <div className="grid grid-cols-3 gap-4">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="bg-gray-100 rounded-lg aspect-square animate-pulse"></div>
                    ))}
                  </div>
                ) : venueUsers.length > 0 ? (
                  <div className="grid grid-cols-3 gap-4">
                    {venueUsers.map(user => (
                      <UserCard 
                        key={user.id} 
                        user={user}
                        interests={interests}
                        setInterests={setInterests}
                        matches={matches}
                        setMatches={setMatches}
                        currentUser={currentUser}
                        setMatchedUser={setMatchedUser}
                        setShowMatchModal={setShowMatchModal}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center bg-gray-50 rounded-lg">
                    <div className="text-gray-400 mb-2">
                      <svg width="48" height="48" className="mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">No one's here yet</p>
                    <p className="text-gray-400 text-sm mt-1">Be the first to check in</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default VenueList;
