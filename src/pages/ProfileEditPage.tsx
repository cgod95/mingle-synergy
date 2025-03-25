
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/UserService';
import OptimizedImage from '../components/shared/OptimizedImage';
import PhotoUploader from '../components/profile/PhotoUploader';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, X } from "lucide-react";
import services from '@/services';
import { toast } from "sonner";

const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [bio, setBio] = useState('');
  const [occupation, setOccupation] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');
  
  // Gender and preferences
  const [gender, setGender] = useState<string>('');
  const [interestedIn, setInterestedIn] = useState<string[]>([]);
  
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const currentUser = await services.auth.getCurrentUser();
        if (!currentUser) {
          navigate('/sign-in');
          return;
        }
        
        setUserId(currentUser.uid);
        
        setLoading(true);
        setError(null);
        
        const userProfile = await services.user.getUserProfile(currentUser.uid);
        
        if (userProfile) {
          setName(userProfile.name || '');
          setAge(userProfile.age || '');
          setBio(userProfile.bio || '');
          setOccupation(userProfile.occupation || '');
          setPhotos(userProfile.photos || []);
          setInterests(userProfile.interests || []);
          setGender(userProfile.gender || '');
          setInterestedIn(userProfile.interestedIn || []);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Unable to load profile data');
      } finally {
        setLoading(false);
      }
    };
    
    initializeUser();
  }, [navigate]);
  
  const handleAddInterest = () => {
    if (!newInterest.trim()) return;
    
    // Check if interest already exists
    if (!interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
    }
    
    setNewInterest('');
  };
  
  const handleRemoveInterest = (interestToRemove: string) => {
    setInterests(interests.filter(interest => interest !== interestToRemove));
  };
  
  const handleAddPhoto = (photoUrl: string) => {
    setPhotos([...photos, photoUrl]);
  };
  
  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };
  
  const handleSaveProfile = async () => {
    if (!userId) return;
    
    setSaving(true);
    setError(null);
    
    try {
      await services.user.updateUserProfile(userId, {
        name,
        age: age === '' ? undefined : Number(age),
        bio,
        occupation,
        photos,
        interests,
        gender: gender as any,
        interestedIn: interestedIn as any[],
      });
      
      toast.success("Profile updated successfully");
      navigate('/profile');
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile. Please try again.');
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };
  
  const handleToggleGenderPreference = (gender: string) => {
    if (interestedIn.includes(gender)) {
      setInterestedIn(interestedIn.filter(g => g !== gender));
    } else {
      setInterestedIn([...interestedIn, gender]);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-t-[#F3643E] border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="profile-edit bg-background min-h-screen pb-20">
      <div className="p-4 bg-card border-b border-border flex items-center sticky top-0 z-10">
        <button 
          onClick={() => navigate('/profile')}
          className="mr-4"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold">Edit Profile</h1>
      </div>
      
      <div className="p-4">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {/* Photo uploader */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Photos</h2>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo, index) => (
              <div key={index} className="relative aspect-square">
                <OptimizedImage
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={() => handleRemovePhoto(index)}
                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm"
                >
                  <X className="h-5 w-5 text-red-500" />
                </button>
              </div>
            ))}
            
            {photos.length < 6 && userId && (
              <PhotoUploader onPhotoUploaded={handleAddPhoto} userId={userId} />
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">Add up to 6 photos</p>
        </div>
        
        {/* Basic info */}
        <div className="bg-card rounded-lg shadow-sm p-4 mb-4">
          <h2 className="text-lg font-semibold mb-4">Basic Info</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-1">
              Name
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
              placeholder="Your name"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-1">
              Age
            </label>
            <Input
              type="number"
              value={age}
              onChange={(e) => {
                const val = e.target.value;
                setAge(val === '' ? '' : parseInt(val, 10));
              }}
              min="18"
              max="100"
              className="w-full"
              placeholder="Your age"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-1">
              Occupation
            </label>
            <Input
              type="text"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className="w-full"
              placeholder="Your occupation"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-2 border border-input bg-background rounded-md"
              rows={4}
              placeholder="Tell others about yourself..."
            />
          </div>
        </div>
        
        {/* Gender & Preferences */}
        <div className="bg-card rounded-lg shadow-sm p-4 mb-4">
          <h2 className="text-lg font-semibold mb-4">Gender & Preferences</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-1">
              I am
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-2 border border-input bg-background rounded-md"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Interested in
            </label>
            <div className="flex flex-wrap gap-2">
              {['male', 'female', 'non-binary', 'other'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleToggleGenderPreference(option)}
                  className={`px-4 py-2 rounded-full text-sm ${
                    interestedIn.includes(option)
                      ? 'bg-[#F3643E] text-white'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Interests */}
        <div className="bg-card rounded-lg shadow-sm p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">Interests</h2>
          
          <div className="flex mb-2">
            <Input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              className="flex-1 rounded-r-none"
              placeholder="Add an interest"
              onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
            />
            <Button
              onClick={handleAddInterest}
              className="rounded-l-none"
            >
              Add
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
            {interests.map((interest, index) => (
              <div
                key={index}
                className="bg-muted text-foreground px-3 py-1 rounded-full text-sm flex items-center"
              >
                <span>{interest}</span>
                <button
                  onClick={() => handleRemoveInterest(interest)}
                  className="ml-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Save button */}
        <Button
          onClick={handleSaveProfile}
          disabled={saving}
          className="w-full py-3"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </div>
  );
};

export default ProfileEditPage;
