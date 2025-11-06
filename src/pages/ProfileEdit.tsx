
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useNotification } from "@/context/NotificationContext";
import PageTransition from '@/components/ui/PageTransition';

const ProfileEdit = () => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Save profile logic will go here
      
      // Mark profile as complete
      localStorage.setItem('profileComplete', 'true');
      
      toast({
        title: "Profile saved!",
        description: "Your profile has been updated.",
        variant: "default"
      });
      
      // Show notification
      showNotification('success', 'Profile saved successfully!');
      
      navigate('/venues');
    } catch (error) {
      console.error('Profile save error:', error);
      toast({
        title: "Failed to save profile",
        description: "Please try again.",
        variant: "destructive"
      });
      
      // Show error notification
      showNotification('error', 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <PageTransition>
      <div className="min-h-screen bg-bg-primary p-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-text-primary">Complete Your Profile</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-text-primary">Name</label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium text-text-primary">Bio</label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us a bit about yourself"
                rows={4}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Profile'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full mt-2"
              onClick={() => showNotification('info', 'This is a test notification', 8000)}
            >
              Test Notification
            </Button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
};

export default ProfileEdit;
