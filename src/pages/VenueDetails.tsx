import { useParams } from "react-router-dom";
import { getVenue, getPeople } from "../lib/api";
import { likePerson, isMatched, isLiked } from "../lib/likesStore";
import { checkInAt, getCheckedVenueId } from "../lib/checkinStore";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MapPin, CheckCircle2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { hasRequiredPhotos, getPhotoRequirementMessage } from "../lib/photoRequirement";
import { useToast } from "@/hooks/use-toast";

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
  const venue = useMemo(() => getVenue(id || ""), [id]);
  const people = useMemo(() => id ? getPeople(id) : [], [id]);
  const [toast, setToast] = useState<string | null>(null);
  const [checkedIn, setCheckedIn] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast: toastHook } = useToast();

  useEffect(() => {
    setCheckedIn(getCheckedVenueId());
  }, []);

  if (!venue) return <div className="p-4">Venue not found</div>;

  const handleCheckIn = async () => {
    // Check photo requirement per spec
    // Try to get user profile photos (may need to fetch from service)
    let userPhotos: string[] = [];
    
    if (currentUser?.uid) {
      try {
        // Try to get photos from userService if available
        const { userService } = await import("@/services");
        const profile = await userService.getUserProfile(currentUser.uid);
        userPhotos = profile?.photos || [];
      } catch {
        // Fallback: check if photos exist in currentUser
        userPhotos = (currentUser as any)?.photos || [];
      }
    }
    
    if (!hasRequiredPhotos(userPhotos)) {
      toastHook({
        title: "Photo Required",
        description: getPhotoRequirementMessage(),
        duration: 4000,
      });
      navigate("/profile/edit");
      return;
    }

    checkInAt(venue.id);
    setCheckedIn(venue.id);
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
      <div className="relative">
        <img
          src={venue.image || "/default.jpg"}
          alt={venue.name}
          className="h-64 w-full object-cover"
          loading="lazy"
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

      <div className="p-4">
        <h2 className="font-semibold text-lg mb-4 text-neutral-800">People here now</h2>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {people.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100">
                  <img
                    src={p.photo || "/default-user.jpg"}
                    alt={p.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  <div className="text-sm font-semibold text-neutral-800 mb-2">{p.name}</div>

                  <div className="flex items-center justify-between">
                    <div>
                      {isMatched(p.id) ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                          Matched
                        </Badge>
                      ) : isLiked(p.id) ? (
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                          Liked
                        </Badge>
                      ) : (
                        <span className="text-xs text-neutral-400">—</span>
                      )}
                    </div>
                    <Button
                      onClick={() => handleLike(p.id, p.name)}
                      size="sm"
                      className={`rounded-full text-xs h-7 px-3 transition-all ${
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
                        <Heart className={`w-3 h-3 mr-1 ${isLiked(p.id) || isMatched(p.id) ? "fill-current" : ""}`} />
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

      <AnimatePresence>
        {toast && <Toast text={toast} />}
      </AnimatePresence>
    </div>
  );
}
