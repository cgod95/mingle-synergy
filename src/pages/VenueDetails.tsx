import { useParams } from "react-router-dom";
import { getVenue } from "../lib/api";
import { checkInAt, getCheckedVenueId, clearCheckIn } from "../lib/checkinStore";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MapPin, CheckCircle2, User, Loader2 } from "lucide-react";
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

function Toast({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-6 py-3 text-white text-sm shadow-lg z-50"
    >
      {text}
    </motion.div>
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

  const people = usePeopleAtVenue(id);
  
  const [toast, setToast] = useState<string | null>(null);
  const [checkedIn, setCheckedIn] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
  const pendingLikeRef = useRef<string | null>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const realtimeMatches = useRealtimeMatches();

  const isMatchedWith = useCallback((userId: string) => {
    return realtimeMatches.some(
      m => m.userId1 === userId || m.userId2 === userId
    );
  }, [realtimeMatches]);

  useEffect(() => {
    setCheckedIn(getCheckedVenueId());
  }, [venue?.id, currentUser?.uid]);

  if (loadingVenue) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
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
          <Button onClick={() => navigate('/checkin')} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl">
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
    setToast("Checked out");
    setTimeout(() => setToast(null), 1600);
  };

  // Watch realtimeMatches for new match after liking
  useEffect(() => {
    if (!pendingLikeRef.current) return;
    const personId = pendingLikeRef.current;
    const matched = realtimeMatches.some(
      m => m.userId1 === personId || m.userId2 === personId
    );
    if (matched) {
      pendingLikeRef.current = null;
      hapticSuccess();
      setToast("It's a match! 🎉");
      setTimeout(() => setToast(null), 2500);
    }
  }, [realtimeMatches]);

  const handleLike = async (personId: string) => {
    if (isLiking === personId || !currentUser?.uid || !id) return;
    setIsLiking(personId);
    hapticMedium();
    
    try {
      await likeUserWithMutualDetection(currentUser.uid, personId, id);
      setLikedIds(prev => new Set(prev).add(personId));
      pendingLikeRef.current = personId;

      // Show "Like sent" immediately; if a match arrives via realtimeMatches,
      // the useEffect above will override with the match toast
      setToast("Like sent ❤️");
      setTimeout(() => setToast(null), 1600);
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
      {/* Venue Header */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={venue.image || "https://images.unsplash.com/photo-1559329007-40df8a9345d8?q=80&w=1200&auto=format&fit=crop"}
          alt={venue.name}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1559329007-40df8a9345d8?q=80&w=1200&auto=format&fit=crop";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/50 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-0.5">{venue.name}</h1>
            {venue.address && (
              <div className="flex items-center gap-1 text-neutral-300 text-sm">
                <MapPin className="w-3.5 h-3.5" />
                <span>{venue.address}</span>
              </div>
            )}
          </div>
          {checkedIn !== venue.id && (
            <Button
              onClick={handleCheckIn}
              className="rounded-full px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
              size="sm"
            >
              Check In
            </Button>
          )}
          {checkedIn === venue.id && (
            <button onClick={handleCheckOut} className="flex items-center gap-1.5 text-green-400 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Checked In</span>
            </button>
          )}
        </div>
      </div>

      {/* People Grid */}
      <div className="px-4 pt-4 pb-2">
        {!canSeePeopleAtVenues() ? (
          <div className="text-center py-12">
            <MapPin className="w-10 h-10 text-neutral-500 mx-auto mb-3" />
            <p className="text-neutral-300 font-medium mb-1">Location access required</p>
            <p className="text-sm text-neutral-500 mb-4">Enable location to see people here</p>
            <Button
              onClick={async () => {
                const { requestLocationPermission } = await import("@/utils/locationPermission");
                const granted = await requestLocationPermission();
                if (granted) window.location.reload();
              }}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 rounded-xl"
            >
              Enable Location
            </Button>
          </div>
        ) : visiblePeople.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-1">No one here yet</h3>
            <p className="text-sm text-neutral-500">Be the first to check in!</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-neutral-400 mb-3">
              {visiblePeople.length} {visiblePeople.length === 1 ? 'person' : 'people'} here
            </p>
            <div className="grid grid-cols-2 gap-3">
              {visiblePeople.map((p) => {
                const personAge = (p as any).age;
                const matched = isMatchedWith(p.id);
                const liked = likedIds.has(p.id);
                
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative rounded-xl overflow-hidden bg-neutral-800"
                    onClick={() => navigate(`/profile/${p.id}`)}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden">
                      {(p as any).photos?.[0] || (p as any).photo ? (
                        <img
                          src={(p as any).photos?.[0] || (p as any).photo}
                          alt={(p as any).displayName || (p as any).name || 'Someone'}
                          className="w-full h-full object-cover object-center"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
                          <User className="w-16 h-16 text-white/60" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white font-semibold text-base leading-tight">
                          {(p as any).displayName || (p as any).name || 'Someone'}{personAge ? `, ${personAge}` : ''}
                        </p>
                        {matched && (
                          <p className="text-indigo-300 text-xs font-medium mt-0.5">Matched</p>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(p.id);
                        }}
                        disabled={liked || matched || isLiking === p.id}
                        className={`absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 ${
                          matched
                            ? 'bg-indigo-500 text-white'
                            : liked
                            ? 'bg-neutral-600 text-neutral-300'
                            : isLiking === p.id
                            ? 'bg-white/70 text-neutral-500'
                            : 'bg-white/90 text-neutral-800 hover:bg-white'
                        }`}
                      >
                        {isLiking === p.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Heart className={`w-5 h-5 ${liked || matched ? 'fill-current' : ''}`} />
                        )}
                      </button>
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
