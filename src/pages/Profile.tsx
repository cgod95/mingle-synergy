import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, Edit, Camera } from 'lucide-react';
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
        <Camera className="w-16 h-16 text-neutral-500 mb-3" />
        <p className="text-neutral-400 font-medium">Add a photo</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onUpload}
          className="mt-2 text-indigo-400 hover:text-indigo-300"
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
    <div>
      <div className="max-w-4xl mx-auto">
        <div className="space-y-3">
          {/* Profile Card with swipeable photos */}
          <div className="relative rounded-2xl overflow-hidden bg-neutral-800">
            <div className="relative aspect-[3/4] max-h-[340px] overflow-hidden bg-neutral-700">
              <ProfilePhotoCarousel
                photos={photos}
                name={displayName}
                onUpload={() => navigate('/photo-upload', { state: { from: 'profile' } })}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                <h1 className="text-2xl font-bold text-white">{displayName}</h1>
              </div>
            </div>

            <div className="p-4">
              {profileData?.bio ? (
                <p className="text-base text-neutral-300 leading-relaxed">{profileData.bio}</p>
              ) : (
                <button 
                  onClick={() => navigate('/profile/edit')}
                  className="text-sm text-indigo-400 hover:text-indigo-300"
                >
                  + Add a bio
                </button>
              )}
            </div>
          </div>

          {/* Actions — tighter spacing */}
          <div className="space-y-1.5">
            <Button
              onClick={() => navigate('/profile/edit')}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
              variant="default"
              aria-label="Edit profile"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/photo-upload', { state: { from: 'profile' } })}
              className="w-full h-10 text-neutral-300 hover:bg-neutral-800 hover:text-white rounded-xl"
              aria-label="Edit photos"
            >
              <Camera className="w-4 h-4 mr-2" />
              Edit Photos
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/settings')}
              className="w-full h-10 text-neutral-300 hover:bg-neutral-800 hover:text-white rounded-xl"
              aria-label="Open settings"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="ghost"
              onClick={signOut}
              className="w-full h-10 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-xl"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
