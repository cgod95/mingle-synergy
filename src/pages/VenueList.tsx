// 🧠 Purpose: Display a scrollable, responsive list of venues post-onboarding using Hinge-style layout and routing

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import venueService from '@/services/firebase/venueService';
import { Venue } from '@/types/services';

const VenueList: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadVenues = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const venueList = await venueService.getVenues();
      setVenues(venueList);
    } catch (err) {
      setError('Failed to load venues');
      console.error('Venue load error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadVenues();
  }, [loadVenues]);

  const handleVenueClick = (venue: Venue) => {
    navigate(`/venues/${venue.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mingle-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mingle-primary mx-auto mb-4"></div>
          <p className="text-mingle-muted">Loading venues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mingle-background p-4 pt-6 pb-24">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-mingle-text mb-2">Venues</h1>
          <p className="text-mingle-muted">Discover places to connect</p>
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {venues.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-mingle-muted">No venues available at the moment.</p>
            </div>
          ) : (
            venues.map((venue) => (
              <div
                key={venue.id}
                className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 cursor-pointer hover:shadow-lg transition"
                onClick={() => handleVenueClick(venue)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="text-xl font-semibold text-mingle-text">{venue.name}</h2>
                    <p className="text-mingle-muted">{venue.city}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-mingle-muted">
                    <span className="block">{venue.address}</span>
                    <span className="block">{venue.checkInCount} people</span>
                  </div>

                  <Button variant="outline" size="sm">
                    View Venue
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VenueList;
