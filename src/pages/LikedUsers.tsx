import React from 'react';
import BottomNav from '../components/BottomNav';
import ErrorBoundary from '../components/ErrorBoundary';

const LikedUsers: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen min-h-[100dvh] bg-neutral-900 text-white px-4 py-6 max-w-screen-md mx-auto space-y-6 pb-24">
        <h1 className="text-2xl font-bold mb-6">Users You've Liked</h1>
        {/* Placeholder for liked users list */}
        <p className="text-neutral-300">Liked user cards will appear here.</p>
      </div>
      <BottomNav />
    </ErrorBoundary>
  );
};

export default LikedUsers;