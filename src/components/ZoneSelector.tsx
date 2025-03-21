
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
    <div className={cn("", className)}>
      <p className="text-sm font-medium mb-2 text-muted-foreground">Where are you?</p>
      <div className="flex flex-wrap gap-2">
        {zones.map((zone) => (
          <button
            key={zone.id}
            onClick={() => onZoneSelect(zone.name)}
            className={cn(
              "py-1.5 px-3 rounded-full text-xs flex items-center shadow-sm transition-all duration-300",
              activeZone === zone.name
                ? "bg-[#3A86FF] text-white shadow-[0_2px_10px_rgba(58,134,255,0.3)]"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-md"
            )}
          >
            <MapPin size={12} className="mr-1" />
            {zone.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ZoneSelector;
