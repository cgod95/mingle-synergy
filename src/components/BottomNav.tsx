
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Users, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t border-[#E5E7EB]">
      <div className="container mx-auto">
        <nav className="flex items-center justify-around">
          <button
            onClick={() => navigate('/venues')}
            className={cn(
              "nav-item",
              location.pathname === '/venues' || location.pathname.startsWith('/venue/') 
                ? "text-[#3A86FF] nav-item-active" 
                : "text-[#6B7280]"
            )}
            aria-label="Discover"
          >
            <div className="pt-1">
              <MapPin size={24} />
              <span className="text-caption mt-1 block">Discover</span>
            </div>
          </button>
          
          <button
            onClick={() => navigate(location.pathname.startsWith('/venue/') ? location.pathname : '/venues')}
            className={cn(
              "nav-item",
              location.pathname.startsWith('/venue/') && !location.pathname.includes('/venues')
                ? "text-[#3A86FF] nav-item-active" 
                : "text-[#6B7280]"
            )}
            aria-label="Active Venue"
          >
            <div className="pt-1">
              <Users size={24} />
              <span className="text-caption mt-1 block">Active</span>
            </div>
          </button>
          
          <button
            onClick={() => navigate('/matches')}
            className={cn(
              "nav-item relative",
              location.pathname === '/matches' 
                ? "text-[#3A86FF] nav-item-active" 
                : "text-[#6B7280]"
            )}
            aria-label="Matches"
          >
            <div className="pt-1">
              <MessageCircle size={24} />
              <span className="text-caption mt-1 block">Matches</span>
            </div>
          </button>
          
          <button
            onClick={() => navigate('/profile')}
            className={cn(
              "nav-item",
              location.pathname === '/profile' 
                ? "text-[#3A86FF] nav-item-active" 
                : "text-[#6B7280]"
            )}
            aria-label="You"
          >
            <div className="pt-1">
              <User size={24} />
              <span className="text-caption mt-1 block">You</span>
            </div>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default BottomNav;
