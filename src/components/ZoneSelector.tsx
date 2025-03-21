
import React from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ZoneSelectorProps {
  activeZone: string | null;
  zones: { id: string; name: string }[];
  onZoneSelect: (zoneName: string) => void;
  className?: string;
}

const ZoneSelector: React.FC<ZoneSelectorProps> = ({
  activeZone,
  zones,
  onZoneSelect,
  className
}) => {
  if (zones.length === 0) return null;
  
  return (
    <div className={cn("mb-6", className)}>
      <h3 className="text-lg font-medium mb-3">Where are you?</h3>
      <div className="flex flex-wrap gap-3">
        {zones.map((zone) => (
          <button
            key={zone.id}
            onClick={() => onZoneSelect(zone.name)}
            className={cn(
              "py-2 px-4 rounded-full text-sm flex items-center shadow-sm transition-all duration-300",
              activeZone === zone.name
                ? "bg-[#3A86FF] text-white shadow-[0_2px_10px_rgba(58,134,255,0.3)]"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-md"
            )}
          >
            <MapPin size={14} className="mr-2" />
            {zone.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ZoneSelector;
