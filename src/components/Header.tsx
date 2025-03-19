
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  title = "Proximity",
  showBackButton = false
}) => {
  const navigate = useNavigate();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          {showBackButton ? (
            <button
              onClick={() => navigate(-1)} 
              className="mr-2 p-2 rounded-full hover:bg-secondary"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
          ) : null}
          
          <div className="text-[#3A86FF] font-semibold text-xl">
            {title}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
