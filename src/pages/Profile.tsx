
import React, { useState } from 'react';
import Header from '@/components/Header';
import ToggleButton from '@/components/ToggleButton';
import { Plus, Edit, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const Profile = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [name, setName] = useState('Riley');
  const [isEditing, setIsEditing] = useState(false);
  const [photos, setPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80'
  ]);
  const [interests, setInterests] = useState<string[]>(['coffee', 'art', 'hiking']);
  const [newInterest, setNewInterest] = useState('');
  
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };
  
  const handleSaveProfile = () => {
    setIsEditing(false);
    // Here we would save to backend
  };
  
  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };
  
  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };
  
  return (
    <div className="min-h-screen bg-background text-foreground pt-16 pb-8">
      <Header />
      
      <main className="container mx-auto px-4 mt-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-semibold mb-6 animate-fade-in">Your Profile</h1>
          
          <div className="bg-card rounded-2xl border border-border overflow-hidden mb-6 animate-scale-in">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-background">
                    {photos.length > 0 ? (
                      <img
                        src={photos[0]}
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
                    {isEditing ? (
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="text-2xl font-semibold bg-transparent border-b border-border focus:outline-none focus:border-primary mb-1"
                      />
                    ) : (
                      <h2 className="text-2xl font-semibold mb-1">{name}</h2>
                    )}
                    <p className="text-muted-foreground">Sydney, Australia</p>
                  </div>
                </div>
                
                <button
                  onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  {isEditing ? 'Save' : (
                    <>
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </>
                  )}
                </button>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Photos</h3>
                <div className="grid grid-cols-3 gap-3">
                  {photos.map((photo, idx) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden">
                      <img
                        src={photo}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  
                  {Array.from({ length: 3 - photos.length }).map((_, idx) => (
                    <div 
                      key={`empty-${idx}`} 
                      className={cn(
                        "aspect-square rounded-lg flex items-center justify-center",
                        isEditing ? "bg-secondary cursor-pointer" : "bg-muted"
                      )}
                    >
                      <Plus className={cn(
                        "w-6 h-6",
                        isEditing ? "text-secondary-foreground" : "text-muted-foreground"
                      )} />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest, idx) => (
                    <div 
                      key={idx} 
                      className="px-3 py-1.5 bg-secondary rounded-full text-secondary-foreground text-sm flex items-center"
                    >
                      {interest}
                      {isEditing && (
                        <button
                          className="ml-2 text-muted-foreground hover:text-foreground"
                          onClick={() => handleRemoveInterest(interest)}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {isEditing && (
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        placeholder="Add interest"
                        className="px-3 py-1.5 bg-muted rounded-l-full text-foreground text-sm focus:outline-none"
                      />
                      <button
                        onClick={handleAddInterest}
                        className="px-3 py-1.5 bg-primary text-primary-foreground rounded-r-full text-sm"
                      >
                        Add
                      </button>
                    </div>
                  )}
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
                
                <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-secondary">
                  <div>
                    <h4 className="font-medium">Notifications</h4>
                    <p className="text-sm text-muted-foreground">Manage app notifications</p>
                  </div>
                  <div className="w-10 h-6 rounded-full bg-primary p-1">
                    <div className="w-4 h-4 rounded-full bg-white transform translate-x-4"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-secondary">
                  <div>
                    <h4 className="font-medium">Location Services</h4>
                    <p className="text-sm text-muted-foreground">Allow location access</p>
                  </div>
                  <div className="w-10 h-6 rounded-full bg-primary p-1">
                    <div className="w-4 h-4 rounded-full bg-white transform translate-x-4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="animate-scale-in" style={{ animationDelay: '200ms' }}>
            <button className="w-full py-3 flex items-center justify-center space-x-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
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
