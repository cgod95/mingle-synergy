import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import userService from "@/services/firebase/userService";
import { UserProfile } from "@/types/services";
import { SmallLoadingSpinner } from "@/components/FeedbackUtils";
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Edit, 
  Settings, 
  Heart, 
  Users,
  Camera,
  Shield,
  Star,
  Award,
  Menu,
  LogOut
} from "lucide-react";
import logger from "@/utils/Logger";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        setError(null);

        const profile = await userService.getUserProfile(currentUser.uid);
        if (!profile) {
          setError('Profile not found');
          setLoading(false);
          return;
        }

        setUserProfile(profile);
      } catch (err) {
        logger.error('Error fetching user profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <SmallLoadingSpinner />
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <User className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Error</h3>
          <p className="text-sm text-gray-500">{error || 'Profile not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with dropdown */}
      <div className="flex items-center justify-between">
        <div className="text-center space-y-2 flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Your account information</p>
        </div>
        <div className="relative">
          <button
            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
            onClick={() => setDropdownOpen((open) => !open)}
            aria-label="Open profile menu"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-20 border divide-y divide-gray-100">
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-800"
                onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
              >
                View Profile
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-800"
                onClick={() => { setDropdownOpen(false); navigate('/profile/edit'); }}
              >
                Edit Profile
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-800"
                onClick={() => { setDropdownOpen(false); navigate('/settings'); }}
              >
                Settings
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 flex items-center gap-2"
                onClick={() => { setDropdownOpen(false); logout(); }}
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-24"></div>
        <CardHeader className="text-center pb-4 relative">
          <div className="relative mx-auto mb-4 -mt-12">
            <Avatar className="w-28 h-28 mx-auto ring-4 ring-white shadow-lg">
              <AvatarImage 
                src={userProfile.photos?.[0] || "https://via.placeholder.com/150?text=?"} 
                alt="Profile photo"
              />
              <AvatarFallback className="text-3xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                {userProfile.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <input
              type="file"
              accept="image/*"
              id="profile-photo-input"
              className="hidden"
              onChange={async (e) => {
                if (!e.target.files || !e.target.files[0] || !currentUser) return;
                const file = e.target.files[0];
                try {
                  const url = await userService.uploadProfilePhoto(currentUser.uid, file);
                  setUserProfile((prev) => prev ? { ...prev, photos: [...(prev.photos || []), url] } : prev);
                } catch (err) {
                  logger.error('Photo upload error', err);
                }
              }}
            />
            <Button
              size="sm"
              variant="outline"
              className="absolute -bottom-2 -right-2 w-8 h-8 p-0 rounded-full bg-white border-2 border-blue-500 hover:bg-blue-50"
              onClick={() => document.getElementById('profile-photo-input')?.click()}
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">{userProfile.name || 'Unknown User'}</h2>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{userProfile.age || 'N/A'} years old</span>
              </div>
              {userProfile.gender && (
                <>
                  <span>•</span>
                  <span className="capitalize">{userProfile.gender}</span>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Bio Section */}
          {userProfile.bio && (
            <div className="text-center">
              <p className="text-gray-700 leading-relaxed italic">"{userProfile.bio}"</p>
            </div>
          )}

          <Separator />

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-xs text-gray-500">Matches</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-600">8</div>
              <div className="text-xs text-gray-500">Venues</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">4.8</div>
              <div className="text-xs text-gray-500">Rating</div>
            </div>
          </div>

          <Separator />

          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              Contact Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Email</span>
                <span className="font-medium">{currentUser?.email || 'N/A'}</span>
              </div>
              {userProfile.currentVenue && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current Venue</span>
                  <span className="font-medium flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {userProfile.currentVenue}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-3">
            <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" onClick={() => navigate('/profile/edit')}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate('/settings')}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>

          {/* Verification Status */}
          {userProfile.skippedPhotoUpload && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800 font-medium">
                  Photo verification pending
                </span>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                Upload a photo to unlock all features
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;