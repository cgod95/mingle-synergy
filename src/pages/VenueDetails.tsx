import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getVenue, getPeople } from "../lib/api";
// Firebase-based liking (for real multi-user connections)
import { likeUserWithMutualDetection, isLiked as isLikedFirebase, isMatched as isMatchedFirebase, getMatchBetweenUsers } from "@/services/firebase/matchService";
// Demo mode fallbacks (localStorage-based, single user only)
import { likePerson as likeDemoLocal, isMatched as isMatchedLocal, isLiked as isLikedLocal } from "../lib/likesStore";
import { getAllMatches } from "@/lib/matchesCompat";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MapPin, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useDemoPresence } from "@/hooks/useDemoPresence";
import config from "@/config";
import { useLocationPermission } from "@/hooks/useLocationPermission";
import { logError } from "@/utils/errorHandler";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore } from "@/firebase/config";

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
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { hasPermission, requestLocationPermission, isRequesting: isRequestingLocation } = useLocationPermission();
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
  
  // Load people at venue - from Firebase in production, demo data in demo mode
  const [people, setPeople] = useState<any[]>([]);
  const [loadingPeople, setLoadingPeople] = useState(true);
  
  // Demo mode: use demo presence hook
  const demoPeople = useDemoPresence(config.DEMO_MODE ? id : undefined);
  const staticPeople = useMemo(() => id ? getPeople(id) : [], [id]);
  
  useEffect(() => {
    if (!id) {
      setPeople([]);
      setLoadingPeople(false);
      return;
    }

    if (config.DEMO_MODE) {
      // Demo mode: use demo data
      setPeople(demoPeople.length > 0 ? demoPeople : staticPeople);
      setLoadingPeople(false);
    } else {
      // Production: set up real-time listener for users at venue
      if (!firestore) {
        setPeople([]);
        setLoadingPeople(false);
        return;
      }

      setLoadingPeople(true);
      
      try {
        // Set up real-time listener for users at this venue
        const usersRef = collection(firestore, 'users');
        const q = query(
          usersRef, 
          where('currentVenue', '==', id),
          where('isVisible', '==', true)
        );
        
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const users = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data
              } as any;
            });
            
            // Transform UserProfile[] to Person[] format
            const transformedPeople: any[] = users
              .filter(user => user.id !== currentUser?.uid) // Exclude current user
              .map(user => ({
                id: user.id,
                name: user.name || user.displayName || 'Unknown',
                photo: user.photos?.[0] || '',
                bio: user.bio || '',
                age: user.age,
                currentVenue: user.currentVenue || id,
                zone: user.currentZone,
                lastActive: user.lastActive || Date.now(),
                checkedInAt: user.checkInTime
              }));
            
            setPeople(transformedPeople);
            setLoadingPeople(false);
          },
          (error) => {
            logError(error instanceof Error ? error : new Error(String(error)), {
              source: 'VenueDetails',
              action: 'loadUsersRealtime',
              venueId: id
            });
            setPeople([]);
            setLoadingPeople(false);
          }
        );
        
        // Cleanup listener on unmount or venue change
        return () => unsubscribe();
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)), {
          source: 'VenueDetails',
          action: 'setupFirestoreListener',
          venueId: id
        });
        setPeople([]);
        setLoadingPeople(false);
      }
    }
  }, [id, currentUser?.uid, config.DEMO_MODE, demoPeople, staticPeople]);
  
  const [toast, setToast] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState<string | null>(null);
  const [likeNotification, setLikeNotification] = useState<{ personId: string; message: string } | null>(null);
  const [mutualConnections, setMutualConnections] = useState<number>(0);
  
  // Track like/match status per person (Firebase is async, so we cache results)
  const [likedUsers, setLikedUsers] = useState<Set<string>>(new Set());
  const [matchedUsers, setMatchedUsers] = useState<Set<string>>(new Set());

  // Load like/match status for all people at venue
  useEffect(() => {
    const loadLikeMatchStatus = async () => {
      if (!currentUser?.uid || people.length === 0) return;
      
      const newLiked = new Set<string>();
      const newMatched = new Set<string>();
      
      // In demo mode, use localStorage; in production, use Firebase
      if (config.DEMO_MODE) {
        people.forEach(person => {
          if (isLikedLocal(person.id)) newLiked.add(person.id);
          if (isMatchedLocal(person.id)) newMatched.add(person.id);
        });
      } else {
        // Load from Firebase in parallel
        await Promise.all(people.map(async (person) => {
          try {
            const [liked, matched] = await Promise.all([
              isLikedFirebase(currentUser.uid, person.id),
              isMatchedFirebase(currentUser.uid, person.id)
            ]);
            if (liked) newLiked.add(person.id);
            if (matched) newMatched.add(person.id);
          } catch (error) {
            // Ignore individual errors
          }
        }));
      }
      
      setLikedUsers(newLiked);
      setMatchedUsers(newMatched);
    };
    
    loadLikeMatchStatus();
  }, [people, currentUser?.uid]);

  useEffect(() => {
    // Load mutual connections count
    if (currentUser?.uid && venue?.id) {
      getAllMatches(currentUser.uid).then(matches => {
        const matchesAtVenue = matches.filter(m => m.venueId === venue.id);
        setMutualConnections(matchesAtVenue.length);
      }).catch(() => {
        // Non-critical
      });
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
          <Button onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/checkin');
            }
          }} variant="default">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Venues
          </Button>
        </div>
      </div>
    );
  }


  const handleLike = async (personId: string) => {
    // Prevent spam: already liking, already liked, already matched, or no auth
    if (isLiking === personId || likedUsers.has(personId) || matchedUsers.has(personId) || !currentUser?.uid || !id) return;
    setIsLiking(personId);
    
    try {
      let matched = false;
      
      if (config.DEMO_MODE) {
        // Demo mode: use localStorage (single user only)
        matched = await likeDemoLocal(personId);
      } else {
        // Production: use Firebase (real multi-user connections)
        await likeUserWithMutualDetection(currentUser.uid, personId, id);
        
        // Check if it resulted in a match
        const matchId = await getMatchBetweenUsers(currentUser.uid, personId);
        matched = !!matchId;
      }
      
      // Update local state
      setLikedUsers(prev => new Set([...prev, personId]));
      if (matched) {
        setMatchedUsers(prev => new Set([...prev, personId]));
      }
      
      setIsLiking(null);
      
      // Show notification on card
      if (matched) {
        setLikeNotification({ personId, message: "It's a match! 🎉" });
        setToast("You matched! Check your messages to chat.");
        setTimeout(() => setToast(null), 3000);
      } else {
        setLikeNotification({ personId, message: "Like sent! ❤️" });
      }
      
      // Clear notification after 2 seconds
      setTimeout(() => setLikeNotification(null), 2000);
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), {
        source: 'VenueDetails',
        action: 'handleLike',
        personId,
        venueId: id
      });
      setIsLiking(null);
      setToast("Failed to send like. Please try again.");
      setTimeout(() => setToast(null), 3000);
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
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/checkin');
                }
              }}
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
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* People here now section */}
          <div className="bg-neutral-800 rounded-xl border-2 border-neutral-700 p-6 shadow-lg">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-heading-2 text-white">People here now</h2>
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
          {!hasPermission ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-neutral-800 rounded-2xl border border-neutral-700"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-900 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-indigo-400" />
              </div>
              <p className="text-neutral-200 font-medium mb-2">Location access required</p>
              <p className="text-sm text-neutral-300 mb-4">
                Enable location access to see people at this venue. You can still browse venues without location.
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={async () => {
                    const granted = await requestLocationPermission();
                    if (granted) {
                      setToast("Location enabled! You can now see people at venues.");
                      setTimeout(() => setToast(null), 2000);
                      // State will update automatically via hook, triggering re-render
                    } else {
                      setToast("Location permission denied. Please enable it in browser settings.");
                      setTimeout(() => setToast(null), 3000);
                    }
                  }}
                  disabled={isRequestingLocation}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRequestingLocation ? "Requesting..." : "Enable Location Now"}
                </Button>
                <Button
                  onClick={() => navigate('/settings')}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Go to Settings
                </Button>
              </div>
            </motion.div>
          ) : people.length === 0 ? (
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
                  className="bg-neutral-800 rounded-2xl border border-neutral-700 overflow-hidden shadow-md hover:shadow-xl transition-all relative"
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
                        onClick={() => handleLike(p.id)}
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
