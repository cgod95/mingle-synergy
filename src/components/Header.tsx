
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  title = "Mingle",
  showBackButton = false
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
      </div>
    </header>
  );
};

export default Header;
