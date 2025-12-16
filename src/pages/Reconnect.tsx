import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import ErrorBoundary from '@/components/ErrorBoundary';
import { CenteredContainer, SectionHeader } from '@/components/LayoutUtils';

const Reconnect: React.FC = () => {
  const navigate = useNavigate();

  const handleCheckIn = () => {
    // Redirect user to the venue check-in flow
    navigate('/checkin');
  };

  return (
    <ErrorBoundary>
      <div className="pb-16 p-6">
        <CenteredContainer>
          <div className="text-center">
            <SectionHeader 
              title="Reconnect with Someone?" 
              subtitle="To reconnect, check into the same venue again. If they do too, your match will restart."
            />
            <button
              onClick={handleCheckIn}
              className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors font-medium"
            >
              Check Into a Venue
            </button>
          </div>
        </CenteredContainer>
      </div>
      <BottomNav />
    </ErrorBoundary>
  );
};

export default Reconnect; 