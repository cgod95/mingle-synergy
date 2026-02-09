import { useNavigate } from 'react-router-dom';  // Import this if you are using React Router
import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import ToggleButton from '../ToggleButton';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { firestore } from '../../firebase/config';

interface VenueDetailsProps {
  venue: {
    name: string;
    address?: string;
    city?: string;
    userCount: number;
    id: string;
    specials?: Array<{
      title: string;
      description: string;
    }>;
  };
  expiryTime: string;
  onCheckOut: () => void;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

const VenueDetails: React.FC<VenueDetailsProps> = ({ 
  venue, 
  expiryTime, 
  onCheckOut,
  isVisible = true,
  onToggleVisibility
}) => {
  const [userCount, setUserCount] = useState<number>(venue.userCount);

  // Check if profile exists, if not, redirect to profile creation page
  const profileExists = localStorage.getItem('profile');  // or your profile checking logic
  const navigate = useNavigate();
  useEffect(() => {
    if (!profileExists) {
      navigate('/create-profile');
    }
  }, [profileExists, navigate]);

  useEffect(() => {
    // Debug user fields to verify correct field names
    const debugUserFields = async () => {
      try {
        // Get a sample user to check field names
        const sampleUserSnapshot = await getDocs(collection(firestore, 'users'));
        if (!sampleUserSnapshot.empty) {
          console.log('Sample user fields:', Object.keys(sampleUserSnapshot.docs[0].data()));
        }
      } catch (error) {
        console.error('Debug error:', error);
      }
    };
    
    // Load users at venue
    const loadUsersAtVenue = async (venueId: string) => {
      try {
        const usersQuery = query(
          collection(firestore, 'users'),
          where('currentVenue', '==', venueId),
          where('isVisible', '==', true)
        );

        const usersSnapshot = await getDocs(usersQuery);
        setUserCount(usersSnapshot.size);

        return usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error('Error fetching users:', error);
        return [];
      }
    };

    debugUserFields();
    if (venue.id) {
      loadUsersAtVenue(venue.id);
    }
  }, [venue.id]);

  return (
    <div className="mb-6">
      {/* Existing JSX logic here */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-xl font-bold">{venue.name}</h1>
          <p className="text-gray-600 text-sm">
            {venue.address || venue.city || ''}
          </p>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Users className="w-4 h-4 mr-1" />
            {userCount} people here now
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Expires at {expiryTime}</div>
          <button 
            onClick={onCheckOut}
            className="text-red-500 text-sm font-medium mt-1"
          >
            Check Out
          </button>
        </div>
      </div>
      
      {/* Prominent Check-out Box */}
      <div className="bg-neutral-800 shadow-md rounded-lg p-4 mb-4 flex justify-between items-center border-l-4 border-indigo-500">
        <div>
          <span className="text-indigo-400 font-medium">You are checked in</span>
          <p className="text-xs text-neutral-400">Other users can see you here</p>
        </div>
        <button 
          onClick={onCheckOut}
          className="px-4 py-2 bg-coral-500 text-white rounded-lg shadow-sm hover:bg-coral-600 transition-colors"
        >
          Check Out
        </button>
      </div>
      
      {/* Specials & Offers Section */}
      <div className="mt-2 mb-3">
        <h3 className="text-sm font-medium text-gray-700 mb-1">Specials & Offers</h3>
        {venue.specials && venue.specials.length > 0 ? (
          <div className="bg-coral-50 p-2 rounded border border-coral-100 text-sm">
            {venue.specials.map((special, index) => (
              <div key={index} className={index > 0 ? "mt-1 pt-1 border-t border-coral-100" : ""}>
                <p className="font-medium text-coral-700">{special.title}</p>
                <p className="text-xs text-gray-600">{special.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic">No current specials</p>
        )}
      </div>
      
      {onToggleVisibility && (
        <div className="mt-4">
          <ToggleButton 
            isVisible={isVisible}
            onToggle={onToggleVisibility}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};

export default VenueDetails;