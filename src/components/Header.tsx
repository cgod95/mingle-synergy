
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  isCheckedIn?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  title = "Mingle",
  showBackButton = false,
  isCheckedIn = false
}) => {
  const navigate = useNavigate();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-black/5">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center">
          {showBackButton ? (
            <button
              onClick={() => navigate(-1)} 
              className="mr-2 p-2 rounded-full hover:bg-black/5 active:scale-[0.98] transition-all duration-100"
              aria-label="Go back"
            >
              <ArrowLeft size={20} className="text-[#202020]" />
            </button>
          ) : null}
          
          <div className="text-[#3A86FF] text-heading">
            {title}
          </div>
        </div>
        
        {/* Check-in status indicator */}
        {isCheckedIn && (
          <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></div>
            Checked in
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
