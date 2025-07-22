// 🧠 Purpose: Display a detailed view of a venue after check-in, showing venue name, location, and placeholder content

import React from 'react';
import { useParams } from 'react-router-dom';

const mockVenueData = {
  '1': { name: 'The Velvet Lounge', location: 'Sydney', description: 'A chic cocktail venue with live music.' },
  '2': { name: 'Neon Terrace', location: 'Melbourne', description: 'A rooftop bar with neon aesthetics and DJ sets.' },
  '3': { name: 'Garden Underground', location: 'Brisbane', description: 'A secret warehouse with immersive visuals.' },
};

const ActiveVenue: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const venue = id ? mockVenueData[id] : null;

  if (!venue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Venue not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">{venue.name}</h1>
      <p className="text-gray-600 mb-6">{venue.location}</p>
      <p className="text-gray-800">{venue.description}</p>

      <div className="mt-8 border-t pt-6">
        <h2 className="text-xl font-semibold mb-2">Tonight's Happenings</h2>
        <p className="text-gray-600">More info coming soon...</p>
      </div>
    </div>
  );
};

export default ActiveVenue;