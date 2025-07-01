import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import venueService from '@/services/firebase/venueService';
import { useAuth } from '@/context/AuthContext';
import userService from '@/services/firebase/userService';

type Props = {
  venueId: string;
};

const CheckInButton: React.FC<Props> = ({ venueId }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckIn = async () => {
    if (!currentUser?.uid) {
      setError('You must be logged in to check in.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Enforce photo upload
      const profile = await userService.getUserProfile(currentUser.uid);
      if (!profile || !profile.photos || profile.photos.length === 0) {
        navigate(`/photo-upload?returnTo=/venues`);
        setLoading(false);
        return;
      }
      await venueService.checkInToVenue(currentUser.uid, venueId);
      setCheckedIn(true);
      navigate("/check-in-success");
    } catch (err) {
      setError('Failed to check in. Try again.');
      console.error('Check-in error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      {checkedIn ? (
        <button className="bg-green-500 text-white px-4 py-2 rounded cursor-default" disabled>
          Checked In
        </button>
      ) : (
        <button
          onClick={handleCheckIn}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Checking In...' : 'Check In to Venue'}
        </button>
      )}
      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
    </div>
  );
};

export default CheckInButton; 