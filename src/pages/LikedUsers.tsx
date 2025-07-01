import React from 'react';
import BottomNav from '../components/BottomNav';
import ErrorBoundary from '../components/ErrorBoundary';

const LikedUsers: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="pb-16 p-4">
        <h1 className="text-xl font-bold mb-4">Users You've Liked</h1>
        {/* Placeholder for liked users list */}
        <p className="text-gray-500">Liked user cards will appear here.</p>
      </div>
      <BottomNav />
    </ErrorBoundary>
  );
};

export default LikedUsers;