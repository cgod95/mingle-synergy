import React, { useState } from 'react';
import Header from '@/components/Header';
import ToggleButton from '@/components/ToggleButton';
import { User, LogOut, Plus, Camera, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Slider } from "@/components/ui/slider";
import usePerformance from '@/hooks/usePerformance';
import { withAnalytics } from '@/components/withAnalytics';
import { withErrorBoundary } from '@/components/ErrorBoundary';
import { logUserAction } from '@/utils/errorHandler';

const Profile = () => {
  usePerformance('ProfilePage');

  const [isVisible, setIsVisible] = useState(true);
  const [name, setName] = useState('Riley');
  const [photo, setPhoto] = useState('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80');
  const [ageRange, setAgeRange] = useState([21, 35]);
  const [interestedIn, setInterestedIn] = useState('Everyone');
  const [photos, setPhotos] = useState([
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80'
  ]);
  const navigate = useNavigate();
  
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
    logUserAction('toggle_profile_visibility', { visible: !isVisible });
  };
  
  const handleSignOut = () => {
    logUserAction('user_sign_out');
    navigate('/sign-in');
  };
  
  const handleAgeRangeChange = (values: number[]) => {
    setAgeRange(values);
    logUserAction('update_age_preference', { min: values[0], max: values[1] });
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
                
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <Settings size={20} className="text-gray-500" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="card bg-white rounded-xl shadow-sm mb-6 animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="heading-medium m-0">Photos</h2>
              <button className="text-[#3A86FF] text-sm font-medium">Edit</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {photos.map((photo, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden relative">
                  <img src={photo} className="w-full h-full object-cover" />
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-[#3A86FF] text-white text-xs px-2 py-0.5 rounded-full">
                      Primary
                    </div>
                  )}
                </div>
              ))}
              {photos.length < 6 && (
                <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <button className="text-gray-500">
                    <Plus size={24} />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="card bg-white rounded-xl shadow-sm mb-6 animate-scale-in" style={{ animationDelay: '100ms' }}>
            <h2 className="heading-medium">Preferences</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">{ageRange[0]}</span>
                  <span className="text-sm text-gray-500">{ageRange[1]}</span>
                </div>
                <Slider
                  defaultValue={ageRange}
                  min={18}
                  max={65}
                  step={1}
                  onValueChange={handleAgeRangeChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interested In</label>
                <div className="flex space-x-2">
                  {['Women', 'Men', 'Everyone'].map(option => (
                    <button 
                      key={option}
                      className={`px-4 py-2 rounded-full text-sm ${
                        interestedIn === option 
                          ? 'bg-[#3A86FF] text-white' 
                          : 'bg-gray-100 text-gray-700'
                      }`}
                      onClick={() => setInterestedIn(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-2xl border border-border overflow-hidden mb-6 animate-scale-in" style={{ animationDelay: '150ms' }}>
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

export default withErrorBoundary(
  withAnalytics(Profile, 'Profile'),
  <div className="flex flex-col items-center justify-center min-h-screen p-4">
    <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
    <p className="text-muted-foreground mb-4">We couldn't load your profile right now.</p>
    <button 
      onClick={() => window.location.href = '/venues'}
      className="px-4 py-2 bg-[#3A86FF] text-white rounded-lg"
    >
      Go to Venues
    </button>
  </div>
);
