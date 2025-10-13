// 🧠 Purpose: Display a detailed view of a venue after check-in, showing venue name, location, and user matching

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import venueService from '@/services/firebase/venueService';
import userService from '@/services/firebase/userService';
import { likeUser } from '@/services/firebase/matchService';
import { Venue } from '@/types/services';

interface VenueUser {
  id: string;
  name: string;
  age: number;
  bio?: string;
  photos: string[];
  isLiked: boolean;
}

const ActiveVenue: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [users, setUsers] = useState<VenueUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);

  const loadVenueData = useCallback(async () => {
    if (!id || !currentUser) return;

    try {
      setLoading(true);
      const [venueData, venueUsers] = await Promise.all([
        venueService.getVenueById(id),
        userService.getUsersAtVenue(id)
      ]);

      if (venueData) {
        setVenue(venueData);
      }

      // Filter out current user and transform to UI format
      const otherUsers = venueUsers
        .filter(user => user.id !== currentUser.uid && user.photos && user.photos.length > 0)
        .map(user => ({
          id: user.id,
          name: user.name,
          age: user.age,
          bio: user.bio || '',
          photos: user.photos,
          isLiked: false // Will be updated based on like status
        }));

      setUsers(otherUsers);
    } catch (err) {
      setError("Failed to load venue data");
      console.error('Venue data load error:', err);
    } finally {
      setLoading(false);
    }
  }, [id, currentUser]);

  useEffect(() => {
    loadVenueData();
  }, [loadVenueData]);

  const handleLike = async (userId: string) => {
    if (!currentUser || !id) return;
    const venueId = String(id);

    setLiking(userId);
    setError(undefined);

    try {
      await likeUser(currentUser.uid, userId, venueId);
      // Update local state
      setUsers(prev => prev.map(user => ({
        ...user,
        isLiked: user.id === userId ? true : user.isLiked
      })));
      // Check if it's a mutual match
      // In a real app, you'd listen for match creation events
    } catch (err) {
      setError("Failed to like user. Please try again.");
      console.error('Like error:', err);
    } finally {
      setLiking(null);
    }
  };

  const handleCheckOut = async () => {
    if (!currentUser) return;

    try {
      await venueService.checkOutFromVenue(currentUser.uid, String(id));
      navigate('/venues');
    } catch (err) {
      setError("Failed to check out. Please try again.");
      console.error('Check-out error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mingle-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mingle-primary mx-auto mb-4"></div>
          <p className="text-mingle-muted">Loading venue...</p>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-mingle-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-mingle-muted">Venue not found</p>
          <Button onClick={() => navigate('/venues')} className="mt-4">
            Back to Venues
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mingle-background p-4 pt-6 pb-24">
      <div className="max-w-md mx-auto">
        {/* Venue Header */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-mingle-text mb-1">{venue.name}</h1>
              <p className="text-mingle-muted">{venue.city}</p>
            </div>
            <Button
              onClick={handleCheckOut}
              variant="outline"
              size="sm"
            >
              Check Out
            </Button>
          </div>
          
          <div className="text-sm text-mingle-muted">
            <p>{venue.address}</p>
            <p>{venue.checkInCount} people checked in</p>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Users at Venue */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-semibold text-mingle-text mb-4">
            People at {venue.name}
          </h2>
          
          {users.length === 0 ? (
            <p className="text-mingle-muted text-center py-8">
              No other users at this venue yet
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {users.map((user) => (
                <div key={user.id} className="bg-white shadow rounded-xl p-4 flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-3">
                    {user.photos.length > 0 ? (
                      <img
                        src={user.photos[0]}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-3xl font-semibold text-gray-500">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-center text-mingle-text mb-1">
                    {user.name}, {user.age}
                  </h3>
                  {user.bio && (
                    <p className="text-xs text-center text-mingle-muted mb-2 truncate max-w-[130px]">
                      {user.bio}
                    </p>
                  )}
                  <Button
                    onClick={() => handleLike(user.id)}
                    loading={liking === user.id}
                    disabled={liking !== null || user.isLiked}
                    variant={user.isLiked ? "outline" : "default"}
                    size="sm"
                    className="w-full"
                  >
                    {user.isLiked ? "Liked" : "Like"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveVenue;