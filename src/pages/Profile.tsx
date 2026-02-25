import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, Edit, Camera, ChevronRight, User } from 'lucide-react';
import { logError } from '@/utils/errorHandler';
import { UserProfileSkeleton } from '@/components/ui/LoadingStates';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';

function ProfilePhotoCarousel({ photos, name, onUpload }: { photos: string[]; name: string; onUpload: () => void }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!emblaApi) return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); emblaApi.scrollPrev(); }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); emblaApi.scrollNext(); }
  }, [emblaApi]);

  if (photos.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-800">
        <Camera className="w-16 h-16 text-neutral-400 mb-3" />
        <p className="text-neutral-400 font-medium">Add a photo</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onUpload}
          className="mt-2 text-violet-400 hover:text-violet-300"
        >
          Upload Photo
        </Button>
      </div>
    );
  }

  if (photos.length === 1) {
    return <img src={photos[0]} alt={name} className="w-full h-full object-cover" />;
  }

  return (
    <div
      className="relative w-full h-full"
      role="region"
      aria-roledescription="carousel"
      aria-label={`Photo ${selectedIndex + 1} of ${photos.length}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div ref={emblaRef} className="overflow-hidden w-full h-full">
        <div className="flex h-full">
          {photos.map((photo, i) => (
            <div key={i} className="flex-[0_0_100%] min-w-0 h-full">
              <img src={photo} alt={`${name} photo ${i + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
      {/* Tap-to-advance zones */}
      <div
        className="absolute left-0 top-0 bottom-14 w-[30%] z-10 cursor-pointer"
        onClick={() => emblaApi?.scrollPrev()}
        aria-label="Previous photo"
        role="button"
      />
      <div
        className="absolute right-0 top-0 bottom-14 w-[30%] z-10 cursor-pointer"
        onClick={() => emblaApi?.scrollNext()}
        aria-label="Next photo"
        role="button"
      />
      <div className="absolute bottom-14 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
        {photos.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all duration-200",
              i === selectedIndex ? "bg-white w-4" : "bg-white/40 w-1.5"
            )}
          />
        ))}
      </div>
    </div>
  );
}

export default function Profile() {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<{ displayName?: string; name?: string; bio?: string; photos?: string[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const { userService } = await import('@/services');
        const profile = await userService.getUserProfile(currentUser.uid);
        if (profile) {
          const data: { displayName?: string; name?: string; bio?: string; photos?: string[] } = {};
          if (profile.displayName !== undefined) data.displayName = profile.displayName;
          if (profile.name !== undefined) data.name = profile.name;
          if (profile.bio !== undefined) data.bio = profile.bio;
          if (profile.photos !== undefined) data.photos = profile.photos;
          setProfileData(data);
        }
      } catch (error) {
        logError(error as Error, { context: 'Profile.loadProfile', userId: currentUser?.uid || 'unknown' });
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [currentUser]);

  if (!currentUser) return null;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <UserProfileSkeleton />
      </div>
    );
  }

  const photos = profileData?.photos || [];
  const displayName = profileData?.displayName || profileData?.name || currentUser?.name || 'User';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header — gradient title matching Settings */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 via-violet-500 to-pink-500 bg-clip-text text-transparent">
          Profile
        </h1>
        <p className="text-neutral-300 mt-2">{displayName}</p>
      </div>

      <div className="space-y-4">
        {/* Profile Card with swipeable photos */}
        <Card className="bg-neutral-800 shadow-lg overflow-hidden">
          <div className="relative aspect-[3/4] overflow-hidden bg-neutral-700">
            <ProfilePhotoCarousel
              photos={photos}
              name={displayName}
              onUpload={() => navigate('/photo-upload', { state: { from: 'profile' } })}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
              <h2 className="text-2xl font-bold text-white">{displayName}</h2>
            </div>
          </div>

          <CardContent className="pt-4">
            {profileData?.bio ? (
              <p className="text-base text-neutral-300 leading-relaxed">{profileData.bio}</p>
            ) : (
              <button 
                onClick={() => navigate('/profile/edit')}
                className="text-sm text-violet-400 hover:text-violet-300"
              >
                + Add a bio
              </button>
            )}
          </CardContent>
        </Card>

        {/* Actions — styled as a Settings-like card */}
        <Card className="bg-neutral-800 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-violet-500/10 via-violet-500/10 to-pink-500/10 border-b border-neutral-700">
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2 text-violet-400" />
              <span className="text-violet-400 font-semibold">Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-1">
              {[
                { label: 'Edit Profile', description: 'Update your name, bio and details', icon: Edit, action: () => navigate('/profile/edit') },
                { label: 'Edit Photos', description: 'Add or change your photos', icon: Camera, action: () => navigate('/photo-upload', { state: { from: 'profile' } }) },
                { label: 'Settings', description: 'Manage preferences and account', icon: Settings, action: () => navigate('/settings') },
              ].map((item, i, arr) => (
                <React.Fragment key={item.label}>
                  <div
                    className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-violet-900/30 transition-colors cursor-pointer"
                    onClick={item.action}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') item.action(); }}
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="p-2 rounded-lg mr-3 bg-violet-900/50 text-violet-400">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-base text-white">{item.label}</span>
                        <p className="text-sm text-neutral-300 mt-0.5">{item.description}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-violet-400 hover:text-violet-300 hover:bg-violet-900/30">
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="border-b border-neutral-700 my-1" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sign Out — styled like Settings logout */}
        <Card className="border border-red-700 bg-red-900/30">
          <CardContent className="pt-6">
            <Button
              variant="outline"
              onClick={signOut}
              className="w-full text-red-400 border-red-700 hover:bg-red-900/50 hover:border-red-600 font-semibold"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
