import { useParams } from "react-router-dom";
import { getVenue, getPeople } from "../lib/api";
import { likePerson, isMatched, isLiked } from "../lib/likesStore";
import { checkInAt, getCheckedVenueId, setCurrentZone } from "../lib/checkinStore";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MapPin, CheckCircle2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useDemoPresence } from "@/hooks/useDemoPresence";
import config from "@/config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function Toast({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 text-white text-sm shadow-lg z-50"
    >
      {text}
    </motion.div>
  );
}

export default function VenueDetails() {
  const { id } = useParams<{ id: string }>();
  const [venue, setVenue] = useState<any>(null);
  
  useEffect(() => {
    if (id) {
      getVenue(id)
        .then(venue => {
          console.log('[VenueDetails] Loaded venue:', id, venue ? venue.name : 'not found');
          setVenue(venue);
        })
        .catch(error => {
          console.error('[VenueDetails] Error loading venue:', id, error);
          setVenue(null);
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
  const [selectedZone, setSelectedZone] = useState<string>("");
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setCheckedIn(getCheckedVenueId());
    // Load current zone if checked in
    if (getCheckedVenueId() === venue?.id) {
      const savedZone = localStorage.getItem(`mingle:zone:${venue.id}`);
      if (savedZone) {
        setSelectedZone(savedZone);
      }
    }
  }, [venue?.id]);

  if (!venue) return <div className="p-4">Venue not found</div>;

  const handleCheckIn = async () => {
    // DEMO MODE: Photo requirement disabled for easier testing
    
    checkInAt(venue.id);
    setCheckedIn(venue.id);
    
    // Track user checked in event per spec section 9
    try {
      const { trackUserCheckedIn } = await import("@/services/specAnalytics");
      trackUserCheckedIn(venue.id, venue.name);
    } catch (error) {
      console.warn('Failed to track user_checked_in event:', error);
    }
    
    setToast(`Checked in to ${venue.name}`);
    setTimeout(() => setToast(null), 1600);
  };

  const handleLike = async (personId: string, personName: string) => {
    if (isLiking === personId) return;
    setIsLiking(personId);
    
    // Simulate API delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const matched = likePerson(personId);
    if (matched) {
      setToast(`Matched with ${personName} 🎉`);
    } else {
      setToast(`Like sent to ${personName}`);
    }
    setIsLiking(null);
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className="mb-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6">
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div className="flex-1">
              <h1 className="text-white text-3xl font-bold drop-shadow-lg mb-1">{venue.name}</h1>
              {venue.address && (
                <div className="flex items-center space-x-1 text-white/90 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{venue.address}</span>
                </div>
              )}
            </div>
            <Button
              onClick={handleCheckIn}
              className={`rounded-full px-6 py-2.5 font-medium shadow-lg transition-all ${
                checkedIn === venue.id
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-white hover:bg-white/95 text-indigo-600"
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

        {/* Venue Zones - Context only (not filter) */}
        {venue.zones && venue.zones.length > 0 && checkedIn === venue.id && (
          <div className="px-6 pb-4">
            <div className="bg-white rounded-xl border border-indigo-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Navigation className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-medium text-neutral-700">Your zone</span>
              </div>
              <Select
                value={selectedZone}
                onValueChange={(value) => {
                  setSelectedZone(value);
                  setCurrentZone(venue.id, value);
                  setToast(`Updated to ${value}`);
                  setTimeout(() => setToast(null), 1600);
                }}
              >
                <SelectTrigger className="w-full bg-white border-indigo-200">
                  <SelectValue placeholder="Select your zone (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No zone selected</SelectItem>
                  {venue.zones.map((zone) => (
                    <SelectItem key={zone} value={zone}>
                      {zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-neutral-500 mt-2">
                This helps others know where you are in the venue
              </p>
            </div>
          </div>
        )}

        <div className="p-6">
          <h2 className="font-bold text-2xl mb-6 text-neutral-800">People here now</h2>
          {people.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white rounded-2xl border border-neutral-200"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <Heart className="w-8 h-8 text-indigo-400" />
              </div>
              <p className="text-neutral-600 font-medium">No one here yet</p>
              <p className="text-sm text-neutral-500 mt-1">Be the first to check in!</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {people.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-md hover:shadow-xl transition-all"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100">
                    <img
                      src={p.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop"}
                      alt={p.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop";
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-base font-bold text-neutral-800 mb-1">{p.name}</div>
                    {p.bio && (
                      <p className="text-xs text-neutral-600 mb-2 line-clamp-2">{p.bio}</p>
                    )}
                    {/* Activity indicator */}
                    {p.lastActive && (
                      <div className="flex items-center gap-1 mb-2">
                        <div className={`w-2 h-2 rounded-full ${
                          Date.now() - p.lastActive < 300000 ? 'bg-green-500' : 
                          Date.now() - p.lastActive < 1800000 ? 'bg-yellow-500' : 
                          'bg-gray-400'
                        }`} />
                        <span className="text-xs text-neutral-500">
                          {Date.now() - p.lastActive < 300000 ? 'Active now' :
                           Date.now() - p.lastActive < 1800000 ? `Active ${Math.floor((Date.now() - p.lastActive) / 60000)}m ago` :
                           'Earlier'}
                        </span>
                        {p.zone && (
                          <span className="text-xs text-indigo-600 ml-1">• {p.zone}</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        {isMatched(p.id) ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs font-medium">
                            Matched
                          </Badge>
                        ) : isLiked(p.id) ? (
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs font-medium">
                            Liked
                          </Badge>
                        ) : (
                          <span className="text-xs text-neutral-400">—</span>
                        )}
                      </div>
                      <Button
                        onClick={() => handleLike(p.id, p.name)}
                        size="sm"
                        className={`rounded-full text-xs h-8 px-4 transition-all shadow-sm ${
                          isLiked(p.id) || isMatched(p.id)
                            ? "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                            : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                        }`}
                        disabled={isLiked(p.id) || isMatched(p.id) || isLiking === p.id}
                      >
                        <motion.div
                          animate={isLiking === p.id ? { rotate: 360 } : {}}
                          transition={{ duration: 0.5, repeat: isLiking === p.id ? Infinity : 0 }}
                          className="inline-flex items-center"
                        >
                          <Heart className={`w-3.5 h-3.5 mr-1.5 ${isLiked(p.id) || isMatched(p.id) ? "fill-current" : ""}`} />
                        </motion.div>
                        {isLiking === p.id ? "Liking..." : isMatched(p.id) ? "Matched" : isLiked(p.id) ? "Liked" : "Like"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {toast && <Toast text={toast} />}
      </AnimatePresence>
      <BottomNav />
    </div>
  );
}
