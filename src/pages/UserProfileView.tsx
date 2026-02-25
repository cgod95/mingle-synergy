import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Heart, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { logError } from "@/utils/errorHandler";
import { useAuth } from "@/context/AuthContext";
import { getCheckedVenueId } from "@/lib/checkinStore";
import { likeUserWithMutualDetection } from "@/services/firebase/matchService";
import { useRealtimeMatches } from "@/hooks/useRealtimeMatches";
import { useUserLikes } from "@/hooks/useUserLikes";
import { NewMatchModal } from "@/components/NewMatchModal";
import { hapticMedium, hapticSuccess } from "@/lib/haptics";
import { useToast } from "@/hooks/use-toast";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";

interface ProfileData {
  displayName?: string;
  name?: string;
  bio?: string;
  photos?: string[];
  age?: number;
}

function PhotoCarousel({ photos, alt }: { photos: string[]; alt: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, dragFree: false });
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
        <p className="text-neutral-400 font-medium">No photo</p>
      </div>
    );
  }

  if (photos.length === 1) {
    return (
      <img src={photos[0]} alt={alt} className="w-full h-full object-cover" />
    );
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
              <img src={photo} alt={`${alt} photo ${i + 1}`} className="w-full h-full object-cover" />
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
      {/* Dot indicators */}
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

export default function UserProfileView() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { matches: realtimeMatches } = useRealtimeMatches();
  const firestoreLikedIds = useUserLikes();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const [heartBurst, setHeartBurst] = useState<{ x: number; y: number; key: number } | null>(null);
  const [matchModal, setMatchModal] = useState<{ matchId: string; partnerName: string; partnerPhoto?: string } | null>(null);
  const prevMatchedRef = useState(false);

  const liked = userId ? firestoreLikedIds.has(userId) : false;
  const isMatched = userId ? realtimeMatches.some(
    m => m.userId1 === userId || m.userId2 === userId
  ) : false;
  const venueId = getCheckedVenueId();

  const handleLike = async (clickEvent?: React.MouseEvent) => {
    if (!currentUser?.uid || !userId || !venueId || isLiking || isMatched) return;
    setIsLiking(true);
    hapticMedium();

    if (clickEvent) {
      setHeartBurst({ x: clickEvent.clientX, y: clickEvent.clientY, key: Date.now() });
      setTimeout(() => setHeartBurst(null), 800);
    }

    try {
      await likeUserWithMutualDetection(currentUser.uid, userId, venueId);
      if (!liked) {
        toast({ title: "Like sent ❤️" });
      }
    } catch (error) {
      logError(error instanceof Error ? error : new Error('Failed to like'), {
        context: 'UserProfileView.handleLike', userId
      });
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setIsLiking(false);
    }
  };

  useEffect(() => {
    if (isMatched && liked && !matchModal) {
      hapticSuccess();
      const match = realtimeMatches.find(
        m => m.userId1 === userId || m.userId2 === userId
      );
      if (match) {
        const displayName = profile?.displayName || profile?.name || 'Someone';
        const partnerPhoto = profile?.photos?.[0];
        setMatchModal({ matchId: match.id, partnerName: displayName, partnerPhoto });
      }
    }
  }, [isMatched]);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    (async () => {
      try {
        const { userService } = await import("@/services");
        const data = await userService.getUserProfile(userId);
        setProfile(data as ProfileData | null);
      } catch (error) {
        logError(error as Error, { context: "UserProfileView", userId });
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-white mb-2">Profile Not Found</h2>
          <p className="text-neutral-400 mb-4">This user doesn't exist or their profile is unavailable.</p>
          <Button onClick={() => navigate(-1)} className="bg-violet-600 hover:bg-violet-700 rounded-xl">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const displayName = profile.displayName || profile.name || "User";
  const photos = profile.photos || [];

  return (
    <div className="max-w-lg mx-auto">
      {/* Back button */}
      <div className="px-3 pt-2 pb-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full text-neutral-300 hover:text-white -ml-1"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Profile Card with swipeable photos */}
      <div className="relative rounded-2xl overflow-hidden bg-neutral-800 mx-3">
        <div className="relative aspect-[3/4] max-h-[460px] overflow-hidden bg-neutral-700">
          <PhotoCarousel photos={photos} alt={displayName} />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
            <h1 className="text-2xl font-bold text-white">
              {displayName}{profile.age ? `, ${profile.age}` : ""}
            </h1>
          </div>
        </div>

        {profile.bio && (
          <div className="p-4">
            <p className="text-base text-neutral-300 leading-relaxed">{profile.bio}</p>
          </div>
        )}
      </div>

      {/* Like / Matched action button */}
      {currentUser?.uid && userId !== currentUser.uid && venueId && (
        <div className="mx-3 mt-4 mb-8">
          {isMatched ? (
            <Button
              onClick={() => {
                const match = realtimeMatches.find(
                  m => m.userId1 === userId || m.userId2 === userId
                );
                if (match) navigate(`/chat/${match.id}`);
              }}
              className="w-full rounded-xl bg-violet-600 hover:bg-violet-700 text-white py-3 text-base font-semibold"
              aria-label={`Chat with ${displayName}`}
            >
              Chat with {displayName}
            </Button>
          ) : (
            <Button
              onClick={(e) => handleLike(e)}
              disabled={isLiking}
              aria-label={liked ? `Liked ${displayName}` : `Like ${displayName}`}
              className={`w-full rounded-xl py-3 text-base font-semibold ${
                liked
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white'
              }`}
            >
              {isLiking ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Heart className={`w-5 h-5 mr-2 ${liked ? 'fill-current' : ''}`} />
              )}
              {liked ? 'Liked' : `Like ${displayName}`}
            </Button>
          )}
        </div>
      )}

      <AnimatePresence>
        {heartBurst && (
          <div className="fixed inset-0 pointer-events-none z-[100]">
            {Array.from({ length: 6 }, (_, i) => {
              const angle = (i / 6) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
              const distance = 40 + Math.random() * 30;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 1, scale: 0, x: heartBurst.x, y: heartBurst.y }}
                  animate={{
                    opacity: 0,
                    scale: 0.6 + Math.random() * 0.6,
                    x: heartBurst.x + Math.cos(angle) * distance,
                    y: heartBurst.y + Math.sin(angle) * distance - 30,
                  }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="absolute"
                >
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      <NewMatchModal
        isOpen={!!matchModal}
        onClose={() => setMatchModal(null)}
        matchId={matchModal?.matchId || ''}
        partnerName={matchModal?.partnerName || ''}
        partnerPhoto={matchModal?.partnerPhoto}
      />
    </div>
  );
}
