
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, User, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <div 
            className="text-[#3A86FF] font-semibold text-xl cursor-pointer animate-fade-in"
            onClick={() => navigate('/')}
          >
            Proximity
          </div>
        </div>
        
        <nav className="flex items-center space-x-1">
          <button
            onClick={() => navigate('/')}
            className={cn(
              "p-3 rounded-full transition-all duration-300",
              location.pathname === '/' || location.pathname === '/venues' || location.pathname.startsWith('/venue/') 
                ? "text-[#3A86FF] bg-secondary" 
                : "text-foreground/70 hover:bg-secondary hover:text-foreground"
            )}
            aria-label="Home"
          >
            <MapPin size={20} />
          </button>
          
          <button
            onClick={() => navigate('/matches')}
            className={cn(
              "p-3 rounded-full transition-all duration-300 relative",
              location.pathname === '/matches' 
                ? "text-[#3A86FF] bg-secondary" 
                : "text-foreground/70 hover:bg-secondary hover:text-foreground"
            )}
            aria-label="Matches"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF5A5F] rounded-full"></span>
          </button>
          
          <button
            onClick={() => navigate('/profile')}
            className={cn(
              "p-3 rounded-full transition-all duration-300",
              location.pathname === '/profile' 
                ? "text-[#3A86FF] bg-secondary" 
                : "text-foreground/70 hover:bg-secondary hover:text-foreground"
            )}
            aria-label="Profile"
          >
            <User size={20} />
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
