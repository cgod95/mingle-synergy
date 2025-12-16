import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SmallLoadingSpinner } from '@/components/FeedbackUtils';
import { ErrorAlert } from '@/components/FeedbackUtils';
import BottomNav from '@/components/BottomNav';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ArrowLeft, User as UserIcon, Calendar, MapPin } from 'lucide-react';
import { mockUsers } from '@/data/mock';
import Layout from '@/components/Layout';

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);
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
        // Find user in mock data
        const userProfile = mockUsers.find(u => u.id === userId);
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
      <Layout>
        <ErrorBoundary>
          <div className="pb-16 p-4 bg-neutral-900 min-h-screen">
            <div className="flex justify-center py-8">
              <SmallLoadingSpinner />
            </div>
          </div>
        </ErrorBoundary>
        <BottomNav />
      </Layout>
    );
  }

  if (error || !profile) {
    return (
      <Layout>
        <ErrorBoundary>
          <div className="pb-16 p-4 bg-neutral-900 min-h-screen">
            <div className="flex items-center mb-4">
              <button onClick={() => navigate(-1)} className="mr-2 text-indigo-400 hover:text-indigo-300">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-white">User Profile</h1>
            </div>
            <ErrorAlert message={error || 'User not found'} />
          </div>
        </ErrorBoundary>
        <BottomNav />
      </Layout>
    );
  }

  return (
    <Layout>
      <ErrorBoundary>
        <div className="pb-16 p-4 bg-neutral-900 min-h-screen">
          <div className="flex items-center mb-4">
            <button onClick={() => navigate(-1)} className="mr-2 text-indigo-400 hover:text-indigo-300">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-white">{profile.name}</h1>
          </div>

          <div className="space-y-4">
            {/* Profile Photo */}
            {profile.photos && profile.photos.length > 0 && (
              <Card className="bg-neutral-800 border-neutral-700">
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
            <Card className="bg-neutral-800 border-neutral-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <UserIcon className="w-5 h-5 mr-2 text-indigo-400" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg text-white">{profile.name}</h3>
                  {profile.age && profile.age > 0 && (
                    <p className="text-neutral-300 flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-indigo-400" />
                      {profile.age} years old
                    </p>
                  )}
                </div>
                
                {profile.bio && (
                  <div>
                    <h4 className="font-medium mb-1 text-neutral-200">About</h4>
                    <p className="text-neutral-300">{profile.bio}</p>
                  </div>
                )}

                {profile.occupation && (
                  <div>
                    <h4 className="font-medium mb-1 text-neutral-200">Occupation</h4>
                    <p className="text-neutral-300">{profile.occupation}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location Info */}
            {profile.currentVenue && (
              <Card className="bg-neutral-800 border-neutral-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <MapPin className="w-5 h-5 mr-2 text-indigo-400" />
                    Current Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-300">
                    {profile.isCheckedIn ? 'Currently checked in' : 'Recently visited'}
                  </p>
                  {profile.currentZone && (
                    <p className="text-sm text-neutral-400">Zone: {profile.currentZone}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <Card className="bg-neutral-800 border-neutral-700">
                <CardHeader>
                  <CardTitle className="text-white">Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="bg-indigo-900 text-indigo-300 px-2 py-1 rounded-full text-sm border border-indigo-700"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Back Button */}
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={() => navigate(-1)} className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </div>
      </ErrorBoundary>
      <BottomNav />
    </Layout>
  );
};

export default UserProfilePage; 