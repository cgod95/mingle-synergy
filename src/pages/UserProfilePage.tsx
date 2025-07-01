import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import userService from '@/services/firebase/userService';
import { UserProfile } from '@/types/services';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SmallLoadingSpinner } from '@/components/FeedbackUtils';
import { ErrorAlert } from '@/components/FeedbackUtils';
import { SectionHeader } from '@/components/LayoutUtils';
import BottomNav from '@/components/BottomNav';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ArrowLeft, User, Calendar, MapPin } from 'lucide-react';

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setError('No user ID provided');
        setLoading(false);
        return;
      }

      try {
        const userProfile = await userService.getUserProfile(userId);
        if (userProfile) {
          setProfile(userProfile);
        } else {
          setError('User profile not found');
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <ErrorBoundary>
        <div className="pb-16 p-4">
          <div className="flex justify-center py-8">
            <SmallLoadingSpinner />
          </div>
        </div>
        <BottomNav />
      </ErrorBoundary>
    );
  }

  if (error || !profile) {
    return (
      <ErrorBoundary>
        <div className="pb-16 p-4">
          <div className="flex items-center mb-4">
            <Link to="/requests" className="mr-2">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-semibold">User Profile</h1>
          </div>
          <ErrorAlert message={error || 'User not found'} />
        </div>
        <BottomNav />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="pb-16 p-4">
        <div className="flex items-center mb-4">
          <Link to="/requests" className="mr-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-semibold">{profile.name}</h1>
        </div>

        <div className="space-y-4">
          {/* Profile Photo */}
          {profile.photos && profile.photos.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <img
                  src={profile.photos[0]}
                  alt={profile.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </CardContent>
            </Card>
          )}

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg">{profile.name}</h3>
                {profile.age > 0 && (
                  <p className="text-gray-600 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {profile.age} years old
                  </p>
                )}
              </div>
              
              {profile.bio && (
                <div>
                  <h4 className="font-medium mb-1">About</h4>
                  <p className="text-gray-700">{profile.bio}</p>
                </div>
              )}

              {profile.occupation && (
                <div>
                  <h4 className="font-medium mb-1">Occupation</h4>
                  <p className="text-gray-700">{profile.occupation}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location Info */}
          {profile.currentVenue && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Current Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  {profile.isCheckedIn ? 'Currently checked in' : 'Recently visited'}
                </p>
                {profile.currentZone && (
                  <p className="text-sm text-gray-500">Zone: {profile.currentZone}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Interests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Back to Requests */}
          <div className="flex justify-center pt-4">
            <Link to="/requests">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Requests
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <BottomNav />
    </ErrorBoundary>
  );
};

export default UserProfilePage; 