import { useParams } from "react-router-dom";
import { getVenue } from "../lib/api";
import { checkInAt, getCheckedVenueId, clearCheckIn } from "../lib/checkinStore";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Heart, MapPin, CheckCircle2, User, ArrowLeft, LogOut, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { usePeopleAtVenue } from "@/hooks/usePeopleAtVenue";
import { canSeePeopleAtVenues } from "@/utils/locationPermission";
import { logError } from "@/utils/errorHandler";
import { hapticMedium, hapticSuccess } from "@/lib/haptics";
import { likeUserWithMutualDetection } from "@/services/firebase/matchService";
import { useRealtimeMatches } from "@/hooks/useRealtimeMatches";
import { useUserLikes } from "@/hooks/useUserLikes";
import { NewMatchModal } from "@/components/NewMatchModal";

function Toast({ text }: { text: string }) {
  return (
    <motion.div
      role="alert"
      aria-live="assertive"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-6 py-3 text-white text-sm shadow-lg z-50"
    >
      {text}
    </motion.div>
  );
}

function HeartBurst({ x, y }: { x: number; y: number }) {
  const hearts = Array.from({ length: 6 }, (_, i) => {
    const angle = (i / 6) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const distance = 40 + Math.random() * 30;
    return {
      id: i,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance - 30,
      scale: 0.6 + Math.random() * 0.6,
      delay: Math.random() * 0.1,
    };
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]" style={{ left: 0, top: 0 }}>
      {hearts.map((h) => (
        <motion.div
          key={h.id}
          initial={{ opacity: 1, scale: 0, x, y }}
          animate={{ opacity: 0, scale: h.scale, x: x + h.dx, y: y + h.dy }}
          transition={{ duration: 0.7, delay: h.delay, ease: "easeOut" }}
          className="absolute"
        >
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
        </motion.div>
      ))}
    </div>
  );
}

export default function VenueDetails() {
  const { id } = useParams<{ id: string }>();
  const [venue, setVenue] = useState<any>(null);
  const [loadingVenue, setLoadingVenue] = useState(true);
  const [venueError, setVenueError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (id) {
      setLoadingVenue(true);
      setVenueError(null);
      getVenue(id)
        .then(venue => {
          setVenue(venue);
          if (!venue) {
            setVenueError(new Error('Venue not found'));
          }
        })
        .catch(error => {
          logError(error instanceof Error ? error : new Error('Failed to load venue'), { 
            context: 'VenueDetails.loadVenue', 
            venueId: id 
          });
          setVenueError(error instanceof Error ? error : new Error('Failed to load venue'));
          setVenue(null);
        })
        .finally(() => {
          setLoadingVenue(false);
        });
    }
  }, [id]);

  const { people, loading: peopleLoading, error: peopleError, retry: retryPeople } = usePeopleAtVenue(id);
  
  const [toast, setToast] = useState<string | null>(null);
  const [checkedIn, setCheckedIn] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState<string | null>(null);
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
  const [matchModal, setMatchModal] = useState<{ matchId: string; partnerName: string; partnerPhoto?: string } | null>(null);
  const [heartBurst, setHeartBurst] = useState<{ x: number; y: number; key: number } | null>(null);
  const pendingLikeRef = useRef<string | null>(null);
  const shownMatchIds = useRef<Set<string>>(new Set());
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { matches: realtimeMatches } = useRealtimeMatches();
  const likedIds = useUserLikes();
  const prefersReducedMotion = useReducedMotion();

  const isMatchedWith = useCallback((userId: string) => {
    return realtimeMatches.some(
      m => m.userId1 === userId || m.userId2 === userId
    );
  }, [realtimeMatches]);

  useEffect(() => {
    setCheckedIn(getCheckedVenueId());
  }, [venue?.id, currentUser?.uid]);

  // Seed shownMatchIds with existing matches on first load so we never re-show their animation
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current || realtimeMatches.length === 0) return;
    seededRef.current = true;
    for (const m of realtimeMatches) {
      shownMatchIds.current.add(m.id);
    }
  }, [realtimeMatches]);

  // Watch realtimeMatches for new match after liking — open celebration modal
  useEffect(() => {
    if (!pendingLikeRef.current) return;
    const personId = pendingLikeRef.current;
    const match = realtimeMatches.find(
      m => m.userId1 === personId || m.userId2 === personId
    );
    if (match && !shownMatchIds.current.has(match.id)) {
      pendingLikeRef.current = null;
      shownMatchIds.current.add(match.id);
      const person = people.find(p => p.id === personId);
      const partnerName = (person as any)?.displayName || (person as any)?.name || 'Someone';
      const partnerPhoto = (person as any)?.photos?.[0] || (person as any)?.photo;
      setMatchModal({ matchId: match.id, partnerName, partnerPhoto });
    }
  }, [realtimeMatches, people]);

  // Retroactive mutual-like detection: when the venue page loads and we have
  // the user's likes + people at venue, check for any mutual likes that were
  // never converted into matches (e.g. from before the detection code was fixed).
  const mutualCheckDone = useRef(false);
  useEffect(() => {
    if (mutualCheckDone.current) return;
    if (!currentUser?.uid || !id || likedIds.size === 0 || people.length === 0) return;
    mutualCheckDone.current = true;

    const myUid = currentUser.uid;
    const likedPeopleAtVenue = people.filter(p => p.id !== myUid && likedIds.has(p.id));
    if (likedPeopleAtVenue.length === 0) return;

    for (const person of likedPeopleAtVenue) {
      const alreadyMatched = isMatchedWith(person.id);
      if (!alreadyMatched) {
        likeUserWithMutualDetection(myUid, person.id, id).catch(() => {});
      }
    }
  }, [currentUser?.uid, id, likedIds, people, isMatchedWith]);

  if (loadingVenue) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto"></div>
      </div>
    );
  }

  if (venueError || !venue) {
    return (
      <div className="flex items-center justify-center py-24 px-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-white mb-2">Venue Not Found</h2>
          <p className="text-neutral-400 mb-4">
            {venueError?.message || 'The venue you\'re looking for doesn\'t exist.'}
          </p>
          <Button onClick={() => navigate('/checkin')} className="bg-violet-600 hover:bg-violet-700 rounded-xl">
            Back to Venues
          </Button>
        </div>
      </div>
    );
  }

  const handleCheckIn = async () => {
    const { canCheckInToVenues, requestLocationPermission } = await import("@/utils/locationPermission");
    const { isWithinCheckInDistance, getCheckInErrorMessage } = await import("@/utils/distanceCheck");
    
    if (!canCheckInToVenues()) {
      const permissionGranted = await requestLocationPermission();
      if (!permissionGranted) {
        setToast("Location access required to check in.");
        setTimeout(() => setToast(null), 3000);
        return;
      }
    }
    
    if (venue.latitude && venue.longitude) {
      const distanceCheck = await isWithinCheckInDistance(venue.latitude, venue.longitude);
      if (!distanceCheck.withinDistance) {
        const errorMsg = distanceCheck.distanceMeters 
          ? getCheckInErrorMessage(distanceCheck.distanceMeters)
          : "Unable to verify location.";
        setToast(errorMsg);
        setTimeout(() => setToast(null), 3000);
        return;
      }
    }
    
    checkInAt(venue.id, currentUser?.uid);
    setCheckedIn(venue.id);
    
    try {
      const { trackUserCheckedIn } = await import("@/services/specAnalytics");
      trackUserCheckedIn(venue.id, venue.name);
    } catch (error) {}
    
    setToast(`Checked in to ${venue.name}`);
    setTimeout(() => setToast(null), 1600);
  };

  const handleCheckOut = () => {
    setShowCheckoutConfirm(true);
  };

  const confirmCheckOut = () => {
    clearCheckIn(currentUser?.uid);
    setCheckedIn(null);
    setShowCheckoutConfirm(false);
    navigate('/checkin', { replace: true });
  };

  const handleLike = async (personId: string, clickEvent?: React.MouseEvent) => {
    if (isLiking === personId || !currentUser?.uid || !id) return;
    if (isMatchedWith(personId)) return;
    setIsLiking(personId);
    hapticMedium();

    if (clickEvent) {
      setHeartBurst({ x: clickEvent.clientX, y: clickEvent.clientY, key: Date.now() });
      setTimeout(() => setHeartBurst(null), 800);
    }
    
    try {
      await likeUserWithMutualDetection(currentUser.uid, personId, id);
      pendingLikeRef.current = personId;

      if (!likedIds.has(personId)) {
        setToast("Like sent ❤️");
        setTimeout(() => setToast(null), 1600);
      }
    } catch (error) {
      logError(error instanceof Error ? error : new Error('Failed to like'), {
        context: 'VenueDetails.handleLike', userId: currentUser.uid, personId
      });
      setToast("Something went wrong. Try again.");
      setTimeout(() => setToast(null), 2000);
    } finally {
      setIsLiking(null);
    }
  };

  // Filter out current user from the people list
  const visiblePeople = people.filter(p => p.id !== currentUser?.uid);

  return (
    <div className="max-w-lg mx-auto">
      {/* Venue Header — compact */}
      <div className="relative h-36 overflow-hidden bg-neutral-800 rounded-b-xl">
        <img
          src={venue.image || "https://images.unsplash.com/photo-1559329007-40df8a9345d8?q=80&w=1200&auto=format&fit=crop"}
          alt={venue.name}
          className="h-full w-full object-contain"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1559329007-40df8a9345d8?q=80&w=1200&auto=format&fit=crop";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/50 to-transparent" />
        <div className="absolute bottom-2.5 left-3 right-3">
          <h1 className="text-xl font-bold text-white leading-tight truncate">{venue.name}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            {venue.address && (
              <div className="flex items-center gap-1 text-neutral-300 text-xs min-w-0">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{venue.address}</span>
              </div>
            )}
            {visiblePeople.length > 0 && (
              <span className="text-violet-300 text-sm font-medium flex-shrink-0">
                {visiblePeople.length} here
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action bar — Back to Venues + Check Out */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          onClick={() => navigate('/checkin?showAll=true')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-base font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All Venues
        </button>
        <div className="flex-1" />
        {checkedIn === venue.id ? (
          <button
            onClick={handleCheckOut}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-900/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 text-base font-medium transition-colors border border-red-800/50"
          >
            <LogOut className="w-4 h-4" />
            Check Out
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-900/30 text-green-400 text-base font-medium border border-green-800/40">
            <CheckCircle2 className="w-4 h-4" />
            Viewing
          </div>
        )}
      </div>

      {/* People Grid — tight */}
      <div className="px-3 pt-1 pb-2">
        {peopleLoading ? (
          <div className="grid grid-cols-2 min-[430px]:grid-cols-3 gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-lg overflow-hidden bg-neutral-800 skeleton-shimmer">
                <div className="aspect-[3/4] bg-neutral-800" />
              </div>
            ))}
          </div>
        ) : peopleError ? (
          <div className="text-center py-10">
            <MapPin className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
            <p className="text-neutral-300 font-medium text-sm mb-1">Couldn't load people</p>
            <p className="text-xs text-neutral-400 mb-3">Something went wrong. Tap to retry.</p>
            <Button onClick={retryPeople} size="sm" className="bg-violet-600 hover:bg-violet-700 rounded-xl">
              Retry
            </Button>
          </div>
        ) : !canSeePeopleAtVenues() ? (
          <div className="text-center py-10">
            <MapPin className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
            <p className="text-neutral-300 font-medium text-sm mb-1">Location access required</p>
            <p className="text-xs text-neutral-500 mb-3">Enable location to see people here</p>
            <Button
              onClick={async () => {
                const { requestLocationPermission } = await import("@/utils/locationPermission");
                const granted = await requestLocationPermission();
                if (granted) window.location.reload();
              }}
              size="sm"
              className="bg-violet-600 hover:bg-violet-700 rounded-xl"
            >
              Enable Location
            </Button>
          </div>
        ) : visiblePeople.length === 0 ? (
          <div className="text-center py-12">
            <motion.div
              animate={prefersReducedMotion ? undefined : { scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Heart className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            </motion.div>
            <h3 className="text-lg font-semibold text-white mb-1">No one here yet</h3>
            <p className="text-sm text-neutral-400">You're the first one here. Others will see you when they check in.</p>
          </div>
        ) : (
          <>
          <div className="grid grid-cols-2 min-[430px]:grid-cols-3 gap-2" aria-live="polite" aria-relevant="additions removals">
            {visiblePeople.map((p) => {
              const personAge = (p as any).age;
              const matched = isMatchedWith(p.id);
              const liked = likedIds.has(p.id);
              const personName = (p as any).displayName || (p as any).name || 'Someone';
              
              return (
                <motion.div
                  key={p.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                  className="relative rounded-lg overflow-hidden bg-neutral-800 active:scale-[0.97] transition-transform cursor-pointer"
                  onClick={() => navigate(`/profile/${p.id}`)}
                  role="button"
                  aria-label={`View ${personName}'s profile`}
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {matched && (
                      <div className="absolute top-1.5 right-1.5 z-10 bg-violet-500 rounded-full p-1 shadow-lg">
                        <Star className="w-3.5 h-3.5 text-white fill-white" />
                      </div>
                    )}
                    {(p as any).photos?.[0] || (p as any).photo ? (
                      <img
                        src={(p as any).photos?.[0] || (p as any).photo}
                        alt={personName}
                        className="w-full h-full object-cover object-center"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center">
                        <User className="w-12 h-12 text-white/60" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-white font-semibold text-base leading-tight">
                        {personName}{personAge ? `, ${personAge}` : ''}
                      </p>
                      {liked && !matched && (
                        <p className="text-rose-300 text-[10px] font-medium mt-0.5">Liked</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {toast && <Toast text={toast} />}
      </AnimatePresence>

      <AnimatePresence>
        {heartBurst && <HeartBurst key={heartBurst.key} x={heartBurst.x} y={heartBurst.y} />}
      </AnimatePresence>

      {/* Match celebration modal */}
      <NewMatchModal
        isOpen={!!matchModal}
        onClose={() => setMatchModal(null)}
        matchId={matchModal?.matchId || ''}
        partnerName={matchModal?.partnerName || ''}
        partnerPhoto={matchModal?.partnerPhoto}
        venueName={venue?.name}
      />

      <AlertDialog open={showCheckoutConfirm} onOpenChange={setShowCheckoutConfirm}>
        <AlertDialogContent className="bg-neutral-800 border-neutral-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Check out?</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400">
              You'll no longer appear at this venue. You can check back in anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-neutral-700 text-neutral-200 border-neutral-600 hover:bg-neutral-600">
              Stay
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmCheckOut} className="bg-red-600 hover:bg-red-700 text-white">
              Check Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
