import { useParams } from "react-router-dom";
import { getVenue, getPeople } from "../lib/api";
import { likePerson, isMatched, isLiked } from "../lib/likesStore";
import { getAllMatches } from "@/lib/matchesCompat";
import { checkInAt, getCheckedVenueId } from "../lib/checkinStore";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useDemoPresence } from "@/hooks/useDemoPresence";
import config from "@/config";
import { canSeePeopleAtVenues } from "@/utils/locationPermission";
import { logError } from "@/utils/errorHandler";
import { hapticMedium, hapticSuccess } from "@/lib/haptics";

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
  
  const demoPeople = useDemoPresence(config.DEMO_MODE ? id : undefined);
  const staticPeople = useMemo(() => id ? getPeople(id) : [], [id]);
  const people = config.DEMO_MODE && demoPeople.length > 0 ? demoPeople : staticPeople;
  
  const [toast, setToast] = useState<string | null>(null);
  const [checkedIn, setCheckedIn] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

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
    const { canCheckInToVenues, getLocationExplanationMessage, requestLocationPermission } = await import("@/utils/locationPermission");
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
    
    checkInAt(venue.id);
    setCheckedIn(venue.id);
    
    try {
      const { trackUserCheckedIn } = await import("@/services/specAnalytics");
      trackUserCheckedIn(venue.id, venue.name);
    } catch (error) {}
    
    setToast(`Checked in to ${venue.name}`);
    setTimeout(() => setToast(null), 1600);
  };

  const handleLike = async (personId: string) => {
    if (isLiking === personId) return;
    setIsLiking(personId);
    hapticMedium();
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const matched = likePerson(personId);
    setIsLiking(null);
    
    if (matched) {
      hapticSuccess();
      setToast("It's a match! 🎉");
    } else {
      setToast("Like sent ❤️");
    }
    setTimeout(() => setToast(null), 1600);
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Venue Header — compact */}
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
            <div className="flex items-center gap-1.5 text-green-400 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Checked In</span>
            </div>
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
        ) : people.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-1">No one here yet</h3>
            <p className="text-sm text-neutral-500">Be the first to check in!</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-neutral-400 mb-3">
              {people.length} {people.length === 1 ? 'person' : 'people'} here
            </p>
            <div className="grid grid-cols-2 gap-3">
              {people.map((p) => {
                const personAge = (p as any).age;
                const matched = isMatched(p.id);
                const liked = isLiked(p.id);
                
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative rounded-xl overflow-hidden bg-neutral-800"
                  >
                    {/* Photo — portrait ratio, fills card */}
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img
                        src={p.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop"}
                        alt={p.name}
                        className="w-full h-full object-cover object-center"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop";
                        }}
                      />
                      {/* Gradient overlay for text */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      
                      {/* Name + age overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white font-semibold text-base leading-tight">
                          {p.name}{personAge ? `, ${personAge}` : ''}
                        </p>
                        {matched && (
                          <p className="text-indigo-300 text-xs font-medium mt-0.5">Matched</p>
                        )}
                      </div>

                      {/* Like button — floating */}
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
                            : 'bg-white/90 text-neutral-800 hover:bg-white'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${liked || matched ? 'fill-current' : ''}`} />
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
    </div>
  );
}
