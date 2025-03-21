
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t border-border">
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center justify-around">
          <button
            onClick={() => navigate('/venues')}
            className={cn(
              "flex flex-col items-center gap-1 px-4 py-2",
              location.pathname === '/venues' || location.pathname.startsWith('/venue/') 
                ? "text-[#3A86FF]" 
                : "text-foreground/70"
            )}
            aria-label="Discover"
          >
            <MapPin size={24} />
            <span className="text-xs">Discover</span>
          </button>
          
          <button
            onClick={() => navigate('/matches')}
            className={cn(
              "flex flex-col items-center gap-1 px-4 py-2 relative",
              location.pathname === '/matches' 
                ? "text-[#3A86FF]" 
                : "text-foreground/70"
            )}
            aria-label="Matches"
          >
            <Bell size={24} />
            <span className="text-xs">Matches</span>
          </button>
          
          <button
            onClick={() => navigate('/profile')}
            className={cn(
              "flex flex-col items-center gap-1 px-4 py-2",
              location.pathname === '/profile' 
                ? "text-[#3A86FF]" 
                : "text-foreground/70"
            )}
            aria-label="You"
          >
            <User size={24} />
            <span className="text-xs">You</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default BottomNav;
