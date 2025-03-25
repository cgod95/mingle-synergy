
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OptimizedImage from '../components/shared/OptimizedImage';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Settings, Edit, LogOut } from "lucide-react";
import { toast } from "sonner";
import services from '@/services';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const currentUser = await services.auth.getCurrentUser();
        if (!currentUser) {
          navigate('/sign-in');
          return;
        }
        
        setLoading(true);
        setError(null);
        
        const userProfile = await services.user.getUserProfile(currentUser.uid);
        setProfile(userProfile);
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Unable to load profile data');
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [navigate]);
  
  const handleLogout = async () => {
    try {
      await services.auth.signOut();
      navigate('/sign-in');
      toast.success("Logged out successfully");
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error("Couldn't log out. Please try again.");
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-t-[#F3643E] border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive">{error}</p>
        <Button 
          onClick={() => window.location.reload()}
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }
  
  return (
    <div className="profile-page bg-background min-h-screen pb-20">
      <div className="bg-card p-4 border-b border-border">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Profile</h1>
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate('/profile/edit')}
              variant="outline"
              size="icon"
            >
              <Edit className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline"
              size="icon"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {/* Profile header */}
        <Card className="overflow-hidden mb-4">
          {profile?.photos && profile.photos.length > 0 ? (
            <div className="aspect-video bg-muted">
              <OptimizedImage
                src={profile.photos[0]}
                alt={profile.name || 'Profile photo'}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-video bg-muted flex items-center justify-center">
              <p className="text-muted-foreground">No profile photo</p>
            </div>
          )}
          
          <div className="p-4">
            <h2 className="text-xl font-bold mb-1">
              {profile?.name || 'Your Name'}{' '}
              {profile?.age && <span className="font-normal">{profile.age}</span>}
            </h2>
            
            {profile?.occupation && (
              <p className="text-muted-foreground mb-2">{profile.occupation}</p>
            )}
            
            {profile?.bio && (
              <p className="text-foreground mt-2">{profile.bio}</p>
            )}
          </div>
        </Card>
        
        {/* Gender & Preferences */}
        {(profile?.gender || (profile?.interestedIn && profile.interestedIn.length > 0)) && (
          <Card className="p-4 mb-4">
            <h3 className="text-lg font-semibold mb-3">Gender & Preferences</h3>
            
            {profile?.gender && (
              <div className="mb-2">
                <span className="text-muted-foreground">I am:</span>{' '}
                <span className="font-medium">{profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}</span>
              </div>
            )}
            
            {profile?.interestedIn && profile.interestedIn.length > 0 && (
              <div>
                <span className="text-muted-foreground">Interested in:</span>{' '}
                <span className="font-medium">
                  {profile.interestedIn.map((interest: string) => 
                    interest.charAt(0).toUpperCase() + interest.slice(1)
                  ).join(', ')}
                </span>
              </div>
            )}
          </Card>
        )}
        
        {/* Interests */}
        {profile?.interests && profile.interests.length > 0 && (
          <Card className="p-4 mb-4">
            <h3 className="text-lg font-semibold mb-3">Interests</h3>
            
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest: string, index: number) => (
                <div key={index} className="bg-muted px-3 py-1 rounded-full text-sm">
                  {interest}
                </div>
              ))}
            </div>
          </Card>
        )}
        
        {/* Photos */}
        {profile?.photos && profile.photos.length > 1 && (
          <Card className="p-4 mb-4">
            <h3 className="text-lg font-semibold mb-3">Photos</h3>
            
            <div className="grid grid-cols-3 gap-2">
              {profile.photos.slice(1).map((photo: string, index: number) => (
                <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <OptimizedImage
                    src={photo}
                    alt={`Photo ${index + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </Card>
        )}
        
        {/* Logout button */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full py-3 mt-6 flex items-center justify-center gap-2"
        >
          <LogOut className="h-5 w-5" />
          <span>Log Out</span>
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
