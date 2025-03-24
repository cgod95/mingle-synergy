
import React from 'react';
import { User } from '@/types';
import { MapPin } from 'lucide-react';

interface ZoneSelectorProps {
  zones: string[];
  selectedZone: string;
  onZoneSelect: (zone: string) => void;
  users: User[];
}

const ZoneSelector: React.FC<ZoneSelectorProps> = ({ zones, selectedZone, onZoneSelect, users }) => {
  const userCountByZone = zones.reduce((counts, zone) => {
    counts[zone] = users.filter(user => user.currentZone === zone).length;
    return counts;
  }, {} as Record<string, number>);
  
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Where are you?</h3>
      <div className="flex flex-wrap gap-2">
        {zones.map(zone => (
          <button
            key={zone}
            onClick={() => onZoneSelect(zone)}
            className={`px-3 py-1.5 rounded-full text-sm flex items-center ${
              selectedZone === zone ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <MapPin size={12} className="mr-1" />
            {zone}
            {userCountByZone[zone] > 0 && <span className="ml-1 text-xs">({userCountByZone[zone]})</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ZoneSelector;
