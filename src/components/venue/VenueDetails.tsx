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

        return usersSnapshot.docs.map(doc => {
          const raw = doc.data();
          return {
            id: doc.id,
            displayName: raw.displayName ?? raw.name,
            name: raw.name,
            photos: Array.isArray(raw.photos) ? raw.photos : undefined,
            photo: typeof raw.photo === 'string' ? raw.photo : undefined,
            age: typeof raw.age === 'number' ? raw.age : undefined,
            bio: typeof raw.bio === 'string' ? raw.bio : undefined,
            isVisible: raw.isVisible,
          };
        });
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
    <div className="mb-6 space-y-4">
      {/* Venue header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{venue.name}</h1>
          <p className="text-neutral-300 text-sm">
            {venue.address || venue.city || ''}
          </p>
          <div className="flex items-center text-sm text-neutral-400 mt-1">
            <Users className="w-4 h-4 mr-1 text-violet-400" />
            {userCount} people here now
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-neutral-400">Expires at {expiryTime}</div>
        </div>
      </div>
      
      {/* Check-in status card */}
      <div className="bg-neutral-800 shadow-lg rounded-xl p-4 flex justify-between items-center border-l-4 border-violet-500">
        <div>
          <span className="text-violet-400 font-semibold">You are checked in</span>
          <p className="text-sm text-neutral-300 mt-0.5">Other users can see you here</p>
        </div>
        <button 
          onClick={onCheckOut}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors"
        >
          Check Out
        </button>
      </div>
      
      {/* Specials & Offers */}
      {venue.specials && venue.specials.length > 0 && (
        <div className="bg-neutral-800 shadow-lg rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-violet-500/10 via-violet-500/10 to-pink-500/10 border-b border-neutral-700 px-4 py-3">
            <h3 className="text-violet-400 font-semibold text-sm">Specials & Offers</h3>
          </div>
          <div className="p-4 space-y-3">
            {venue.specials.map((special, index) => (
              <div key={index} className={index > 0 ? "pt-3 border-t border-neutral-700" : ""}>
                <p className="font-semibold text-white text-base">{special.title}</p>
                <p className="text-sm text-neutral-300 mt-0.5">{special.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {onToggleVisibility && (
        <div className="mt-2">
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