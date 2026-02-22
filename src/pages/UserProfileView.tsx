import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logError } from "@/utils/errorHandler";
import { useAuth } from "@/context/AuthContext";
import { getCheckedVenueId } from "@/lib/checkinStore";
import { likeUserWithMutualDetection } from "@/services/firebase/matchService";
import { useRealtimeMatches } from "@/hooks/useRealtimeMatches";
import { hapticMedium, hapticSuccess } from "@/lib/haptics";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
  displayName?: string;
  name?: string;
  bio?: string;
  photos?: string[];
  age?: number;
}

export default function UserProfileView() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const realtimeMatches = useRealtimeMatches();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const [liked, setLiked] = useState(false);

  const isMatched = userId ? realtimeMatches.some(
    m => m.userId1 === userId || m.userId2 === userId
  ) : false;
  const venueId = getCheckedVenueId();

  const handleLike = async () => {
    if (!currentUser?.uid || !userId || !venueId || isLiking || liked || isMatched) return;
    setIsLiking(true);
    hapticMedium();
    try {
      await likeUserWithMutualDetection(currentUser.uid, userId, venueId);
      setLiked(true);
      toast({ title: "Like sent ❤️" });
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
    if (isMatched && liked) {
      hapticSuccess();
      toast({ title: "It's a match! 🎉", description: "You can now chat with this person" });
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-white mb-2">Profile Not Found</h2>
          <p className="text-neutral-400 mb-4">This user doesn't exist or their profile is unavailable.</p>
          <Button onClick={() => navigate(-1)} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const displayName = profile.displayName || profile.name || "User";
  const mainPhoto = profile.photos?.[0];

  return (
    <div className="max-w-lg mx-auto">
      {/* Back button */}
      <div className="px-4 pt-3 pb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full text-neutral-300 hover:text-white -ml-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Profile Card */}
      <div className="relative rounded-2xl overflow-hidden bg-neutral-800 mx-4">
        <div className="relative aspect-[3/4] max-h-[480px] overflow-hidden bg-neutral-700">
          {mainPhoto ? (
            <img
              src={mainPhoto}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-800">
              <Camera className="w-16 h-16 text-neutral-500 mb-3" />
              <p className="text-neutral-400 font-medium">No photo</p>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5">
            <h1 className="text-2xl font-bold text-white">
              {displayName}{profile.age ? `, ${profile.age}` : ""}
            </h1>
          </div>
        </div>

        {profile.bio && (
          <div className="p-5">
            <p className="text-base text-neutral-300 leading-relaxed">{profile.bio}</p>
          </div>
        )}
      </div>

      {/* Additional photos */}
      {profile.photos && profile.photos.length > 1 && (
        <div className="grid grid-cols-3 gap-2 mx-4 mt-3">
          {profile.photos.slice(1).map((photo, index) => (
            <div key={index} className="relative aspect-square rounded-xl overflow-hidden">
              <img
                src={photo}
                alt={`Photo ${index + 2}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Like / Matched action button */}
      {currentUser?.uid && userId !== currentUser.uid && venueId && (
        <div className="mx-4 mt-5 mb-8">
          {isMatched ? (
            <Button
              onClick={() => {
                const match = realtimeMatches.find(
                  m => m.userId1 === userId || m.userId2 === userId
                );
                if (match) navigate(`/chat/${match.id}`);
              }}
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-base font-semibold"
            >
              Chat with {displayName}
            </Button>
          ) : (
            <Button
              onClick={handleLike}
              disabled={isLiking || liked}
              className={`w-full rounded-xl py-3 text-base font-semibold ${
                liked
                  ? 'bg-neutral-700 text-neutral-400'
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
    </div>
  );
}
