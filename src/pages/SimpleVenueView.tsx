import React from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import VenueCard from '@/components/VenueCard';

const SimpleVenueView: React.FC = () => {
  return (
    <ErrorBoundary>
      <main className="p-4">
        <h1 className="text-xl font-medium mb-2">Simple Venue View</h1>
        <VenueCard venue={undefined} />
      </main>
    </ErrorBoundary>
  );
};

export default SimpleVenueView;