// 🧠 Purpose: Display a scrollable, responsive list of venues post-onboarding using Hinge-style layout and routing

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';

const mockVenues = [
  { id: '1', name: 'The Velvet Lounge', location: 'Sydney' },
  { id: '2', name: 'Neon Terrace', location: 'Melbourne' },
  { id: '3', name: 'Garden Underground', location: 'Brisbane' },
];

const VenueList: React.FC = () => {
  const { currentUser } = useAuth();
  const { isOnboardingComplete } = useOnboarding();
  const navigate = useNavigate();

  const handleVenueClick = (id: string) => {
    navigate(`/venue/${id}`);
  };

  if (!currentUser || !isOnboardingComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Venues Near You</h1>
      <div className="space-y-4">
        {mockVenues.map((venue) => (
          <div
            key={venue.id}
            onClick={() => handleVenueClick(venue.id)}
            className="cursor-pointer border rounded-2xl p-5 shadow-md hover:bg-gray-50 transition"
          >
            <h2 className="text-xl font-semibold">{venue.name}</h2>
            <p className="text-gray-500">{venue.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VenueList;
