
import React, { useState } from 'react';
import Header from '@/components/Header';
import ToggleButton from '@/components/ToggleButton';
import { User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [name, setName] = useState('Riley');
  const [photo, setPhoto] = useState('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80');
  const navigate = useNavigate();
  
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };
  
  const handleSignOut = () => {
    // This would typically call your auth service to sign out
    navigate('/sign-in');
  };
  
  return (
    <div className="min-h-screen bg-background text-foreground pt-16 pb-8">
      <Header />
      
      <main className="container mx-auto px-4 mt-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-2xl border border-border overflow-hidden mb-6 animate-scale-in">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-background">
                    {photo ? (
                      <img
                        src={photo}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <User className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-semibold mb-1">{name}</h2>
                    <p className="text-muted-foreground">Sydney, Australia</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-2xl border border-border overflow-hidden mb-6 animate-scale-in" style={{ animationDelay: '100ms' }}>
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Settings</h3>
              
              <div className="space-y-4">
                <ToggleButton 
                  isVisible={isVisible} 
                  onToggle={toggleVisibility}
                />
              </div>
            </div>
          </div>
          
          <div className="animate-scale-in" style={{ animationDelay: '200ms' }}>
            <button 
              onClick={handleSignOut}
              className="w-full py-3 flex items-center justify-center space-x-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
