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
        // Correctly structured query to find all checked-in users
        const usersQuery = query(
          collection(firestore, 'users'),
          where('currentVenue', '==', venueId),
          where('isVisible', '==', true)
        );
        
        console.log('Fetching users for venue:', venueId); // Debug log
        
        const usersSnapshot = await getDocs(usersQuery);
        console.log('Users found:', usersSnapshot.size); // Debug log
        
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

    // Execute debugging and loading
    debugUserFields();
    if (venue.id) {
      loadUsersAtVenue(venue.id);
    }
  }, [venue.id]);

  return (
    <div className="mb-6">
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
