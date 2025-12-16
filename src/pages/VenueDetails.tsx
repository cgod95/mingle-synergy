import { useParams } from "react-router-dom";
import { getVenue, getPeople } from "../lib/api";
import { checkInAt, getCheckedVenueId } from "../lib/checkinStore";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MapPin, CheckCircle2, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useDemoPresence } from "@/hooks/useDemoPresence";
import config from "@/config";
import { logError } from "@/utils/errorHandler";
import { likeUserWithMutualDetection } from "@/services/firebase/matchService";
import matchService from "@/services/firebase/matchService";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/firebase";

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
  
  // In demo mode, use dynamic presence hook; otherwise use static getPeople
  const demoPeople = useDemoPresence(config.DEMO_MODE ? id : undefined);
  const staticPeople = useMemo(() => id ? getPeople(id) : [], [id]);
  const people = config.DEMO_MODE && demoPeople.length > 0 ? demoPeople : staticPeople;
  
  const [toast, setToast] = useState<string | null>(null);
  const [checkedIn, setCheckedIn] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState<string | null>(null);
  const [likeNotification, setLikeNotification] = useState<{ personId: string; message: string } | null>(null);
  const [mutualConnections, setMutualConnections] = useState<number>(0);
  const [likedUsers, setLikedUsers] = useState<Set<string>>(new Set());
  const [matchedUsers, setMatchedUsers] = useState<Set<string>>(new Set());
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setCheckedIn(getCheckedVenueId());
    
    // Load mutual connections count and matches
    if (currentUser?.uid && venue?.id) {
      matchService.getMatches(currentUser.uid).then(matches => {
        const matchesAtVenue = matches.filter(m => m.venueId === venue.id);
        setMutualConnections(matchesAtVenue.length);
        
        // Update matched users set
        const matchedIds = new Set<string>();
        matches.forEach(m => {
          const partnerId = m.userId1 === currentUser.uid ? m.userId2 : m.userId1;
          matchedIds.add(partnerId);
        });
        setMatchedUsers(matchedIds);
      }).catch(() => {
        // Non-critical
      });
      
      // Load user's likes from Firestore
      const loadLikes = async () => {
        try {
          if (!firestore) return;
          const likesRef = doc(firestore, 'likes', currentUser.uid);
          const snap = await getDoc(likesRef);
          if (snap.exists()) {
            setLikedUsers(new Set(snap.data()?.likes || []));
          }
        } catch (error) {
          // Non-critical
        }
      };
      loadLikes();
    }
  }, [venue?.id, currentUser?.uid]);

  if (loadingVenue) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-neutral-300">Loading venue...</p>
        </div>
      </div>
    );
  }

  if (venueError || !venue) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-white mb-2">Venue Not Found</h2>
          <p className="text-neutral-300 mb-4">
            {venueError?.message || 'The venue you\'re looking for doesn\'t exist or has been removed.'}
          </p>
          <Button onClick={() => navigate('/checkin')} variant="default">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Venues
          </Button>
        </div>
      </div>
    );
  }

  const handleCheckIn = async () => {
    // Check location permission first
    const { canCheckInToVenues, getLocationExplanationMessage, requestLocationPermission } = await import("@/utils/locationPermission");
    const { isWithinCheckInDistance, getCheckInErrorMessage } = await import("@/utils/distanceCheck");
    
    if (!canCheckInToVenues()) {
      // Try to request permission if not granted
      const permissionGranted = await requestLocationPermission();
      if (!permissionGranted) {
        setToast("Location access required to check in. " + getLocationExplanationMessage());
        setTimeout(() => setToast(null), 3000);
        return;
      }
    }
    
    // Check if user is within 500m of venue
    if (venue.latitude && venue.longitude) {
      const distanceCheck = await isWithinCheckInDistance(venue.latitude, venue.longitude);
      
      if (!distanceCheck.withinDistance) {
        const errorMsg = distanceCheck.distanceMeters 
          ? getCheckInErrorMessage(distanceCheck.distanceMeters)
          : "Unable to verify location. Please ensure location access is enabled.";
        setToast(errorMsg);
        setTimeout(() => setToast(null), 3000);
        return;
      }
    }
    
    // DEMO MODE: Photo requirement disabled for easier testing
    
    checkInAt(venue.id);
    setCheckedIn(venue.id);
    
    // Track user checked in event per spec section 9
    try {
      const { trackUserCheckedIn } = await import("@/services/specAnalytics");
      trackUserCheckedIn(venue.id, venue.name);
    } catch (error) {
      // Failed to track check-in event - non-critical
    }
    
    setToast(`Checked in to ${venue.name}`);
    setTimeout(() => setToast(null), 1600);
  };

  const handleLike = async (personId: string) => {
    if (isLiking === personId || likedUsers.has(personId) || matchedUsers.has(personId)) return;
    if (!currentUser?.uid || !id) return;
    
    setIsLiking(personId);
    
    try {
      await likeUserWithMutualDetection(currentUser.uid, personId, id);
      
      // Check if it's now a match
      const matches = await matchService.getMatches(currentUser.uid);
      const isNowMatched = matches.some(m => 
        (m.userId1 === personId || m.userId2 === personId)
      );
      
      if (isNowMatched) {
        setMatchedUsers(prev => new Set([...prev, personId]));
        setLikeNotification({ personId, message: "It's a match! 🎉" });
      } else {
        setLikedUsers(prev => new Set([...prev, personId]));
        setLikeNotification({ personId, message: "Like sent! ❤️" });
      }
    } catch (error) {
      logError(error as Error, { context: 'VenueDetails.handleLike', personId });
      setToast("Failed to send like. Please try again.");
      setTimeout(() => setToast(null), 2000);
    } finally {
      setIsLiking(null);
      setTimeout(() => setLikeNotification(null), 2000);
    }
  };

  return (
    <div className="mb-20 bg-neutral-900 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/checkin')}
            className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Venues
          </Button>
        </div>
        <div className="relative rounded-2xl overflow-hidden shadow-xl mb-6">
          <img
            src={venue.image || "https://images.unsplash.com/photo-1559329007-40df8a9345d8?q=80&w=1200&auto=format&fit=crop"}
            alt={venue.name}
            className="h-80 w-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1559329007-40df8a9345d8?q=80&w=1200&auto=format&fit=crop";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg mb-1">{venue.name}</h1>
              {venue.address && (
                <div className="flex items-center space-x-1 text-white/90 text-sm mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>{venue.address}</span>
                </div>
              )}
              {(venue as any).description && (
                <p className="text-white/90 text-sm drop-shadow-md mb-1">
                  {(venue as any).description}
                </p>
              )}
              {((venue as any).openingHours || (venue as any).hours) && (
                <p className="text-white/80 text-xs drop-shadow-md">
                  {(venue as any).openingHours || (venue as any).hours}
                </p>
              )}
            </div>
            <Button
              onClick={handleCheckIn}
              className={`rounded-full px-6 py-2.5 font-medium shadow-lg transition-all ${
                checkedIn === venue.id
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {checkedIn === venue.id ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Checked In
                </>
              ) : (
                "Check In"
              )}
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* People here now section */}
          <div className="bg-neutral-800 rounded-xl border-2 border-neutral-700 p-6 shadow-lg">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-white whitespace-nowrap">Here Now</h2>
                {mutualConnections > 0 && (
                  <Badge className="bg-indigo-600 text-white px-3 py-1">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {mutualConnections} {mutualConnections === 1 ? 'match' : 'matches'} here
                  </Badge>
                )}
              </div>
              <p className="text-sm text-neutral-300 mb-3">
                💡 Like someone to start a conversation. If they like you back, you'll match and can chat!
              </p>
              
              {/* Activity Feed - Less specific for privacy */}
              {people.length > 0 && (
                <div className="mb-4 p-3 bg-indigo-900/20 rounded-lg border border-indigo-700/30">
                  <p className="text-xs text-indigo-300">
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    {people.length} {people.length === 1 ? 'person' : 'people'} checked in recently
                  </p>
                </div>
              )}
            </div>
          {people.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 px-4 bg-neutral-800 rounded-2xl border border-neutral-700 shadow-sm"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-indigo-900 flex items-center justify-center"
              >
                <Heart className="w-10 h-10 text-indigo-400" />
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">No one here yet</h3>
              <p className="text-sm text-neutral-300 mb-4">Be the first to check in and start meeting people!</p>
              <p className="text-xs text-neutral-400">
                💡 Share Mingle with friends at this venue to see them here
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {people.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  onClick={() => navigate(`/user/${p.id}`)}
                  className="bg-neutral-800 rounded-2xl border border-neutral-700 overflow-hidden shadow-md hover:shadow-xl transition-all relative cursor-pointer"
                >
                  <div className="relative aspect-square overflow-hidden bg-neutral-200">
                    <img
                      src={p.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop"}
                      alt={p.name}
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop";
                      }}
                    />
                    {/* Like notification on top right */}
                    {likeNotification && likeNotification.personId === p.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute top-2 right-2 bg-indigo-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg z-10"
                      >
                        {likeNotification.message}
                      </motion.div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="text-lg font-bold text-white mb-1">{p.name}</div>
                    <p className="text-xs text-neutral-500 mb-2">Tap to view profile</p>
                    {(p as any).bio && (
                      <p className="text-sm text-neutral-300 mb-2 line-clamp-2">{(p as any).bio}</p>
                    )}
                    {/* Activity indicator */}
                    {(p as any).lastActive && typeof (p as any).lastActive === 'number' && (
                      <div className="flex items-center gap-1 mb-2">
                        <div className={`w-2 h-2 rounded-full ${
                          Date.now() - (p as any).lastActive < 300000 ? 'bg-indigo-500' : 
                          Date.now() - (p as any).lastActive < 1800000 ? 'bg-yellow-500' : 
                          'bg-neutral-500'
                        }`} />
                        <span className="text-sm text-neutral-400">
                          {Date.now() - (p as any).lastActive < 300000 ? 'Active now' :
                           Date.now() - (p as any).lastActive < 1800000 ? `Active recently` :
                           'Earlier'}
                        </span>
                        {matchedUsers.has(p.id) && (
                          <Badge className="ml-2 bg-indigo-600 text-white text-xs px-2 py-0.5">
                            Matched
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        {matchedUsers.has(p.id) ? (
                          <Badge className="bg-indigo-900 text-indigo-300 border-indigo-700 text-xs font-medium">
                            Matched
                          </Badge>
                        ) : likedUsers.has(p.id) ? (
                          <Badge className="bg-blue-900 text-blue-300 border-blue-700 text-xs font-medium">
                            Liked
                          </Badge>
                        ) : (
                          <span className="text-xs text-neutral-500">—</span>
                        )}
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(p.id);
                        }}
                        size="sm"
                        className={`rounded-full text-xs h-8 px-4 transition-all shadow-sm ${
                          likedUsers.has(p.id) || matchedUsers.has(p.id)
                            ? "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }`}
                        disabled={likedUsers.has(p.id) || matchedUsers.has(p.id) || isLiking === p.id}
                      >
                        <motion.div
                          animate={isLiking === p.id ? { rotate: 360 } : {}}
                          transition={{ duration: 0.5, repeat: isLiking === p.id ? Infinity : 0 }}
                          className="inline-flex items-center"
                        >
                          <Heart className={`w-3.5 h-3.5 mr-1.5 ${likedUsers.has(p.id) || matchedUsers.has(p.id) ? "fill-current" : ""}`} />
                        </motion.div>
                        {isLiking === p.id ? "Liking..." : matchedUsers.has(p.id) ? "Matched" : likedUsers.has(p.id) ? "Liked" : "Like"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {toast && <Toast text={toast} />}
      </AnimatePresence>
      <BottomNav />
    </div>
  );
}
