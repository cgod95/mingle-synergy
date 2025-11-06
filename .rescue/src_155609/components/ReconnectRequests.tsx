import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "@/firebase";
import userService from "@/services/firebase/userService";
import { acceptReconnectRequest } from "@/services/reconnectService";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SmallLoadingSpinner } from "@/components/FeedbackUtils";
import { ErrorAlert } from "@/components/FeedbackUtils";
import { UserProfile } from "@/types/services";

const ReconnectRequests = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!currentUser?.uid) return;
      setLoading(true);
      setError(null);
      
      try {
        const requestIds = await userService.getReconnectRequests(currentUser.uid);
        
        // Fetch user profiles for each request ID
        const userProfiles = await Promise.all(
          requestIds.map(async (userId) => {
            try {
              const profile = await userService.getUserProfile(userId);
              return profile;
            } catch (err) {
              console.error(`Error fetching profile for ${userId}:`, err);
              // Return a fallback profile if we can't fetch the user
              return {
                id: userId,
                uid: userId,
                name: "Unknown User",
                displayName: "Unknown User",
                age: 0,
                bio: "Profile unavailable",
                photos: [],
                gender: "other",
                interestedIn: [],
                interests: [],
                isCheckedIn: false,
                isVisible: true,
                ageRangePreference: { min: 18, max: 100 },
                matches: [],
                likedUsers: [],
                blockedUsers: [],
              } as UserProfile;
            }
          })
        );
        
        // Filter out null profiles and set the requests
        setRequests(userProfiles.filter(profile => profile !== null) as UserProfile[]);
      } catch (err) {
        console.error('Error fetching reconnect requests:', err);
        setError('Failed to load reconnect requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [currentUser]);

  const handleAccept = async (targetUid: string) => {
    const currentUid = localStorage.getItem("uid");
    if (!currentUid) return;

    const matchDocRef = doc(
      firestore,
      "matches",
      [currentUid, targetUid].sort().join("_")
    );

    await updateDoc(matchDocRef, {
      reconnected: true,
      reconnectedAt: serverTimestamp(),
    });
  };

  const handleAcceptRequest = async (requesterId: string) => {
    if (!currentUser?.uid) return;
    setAccepting(requesterId);
    setError(null);
    
    try {
      // Use the new reconnect service to accept the request
      await acceptReconnectRequest(currentUser.uid, requesterId);
      
      // Also handle user service logic for cleanup
      await userService.acceptReconnectRequest(currentUser.uid, requesterId);
      setRequests((prev) => prev.filter((user) => (user.uid || user.id) !== requesterId));
    } catch (err) {
      console.error('Error accepting reconnect request:', err);
      setError('Failed to accept reconnect request');
    } finally {
      setAccepting(null);
    }
  };

  if (!currentUser?.uid) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Reconnect Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <ErrorAlert message={error} />}
        
        {loading ? (
          <div className="flex justify-center py-4">
            <SmallLoadingSpinner />
          </div>
        ) : requests.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No reconnect requests at the moment.
          </p>
        ) : (
          <ul className="space-y-3">
            {requests.map((user) => (
              <li key={user.uid || user.id} className="border p-4 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="font-bold text-lg">{user.displayName || user.name || "Unnamed User"}</h2>
                    <p className="text-sm text-gray-500">{user.bio || "No bio available."}</p>
                    {user.age > 0 && (
                      <p className="text-xs text-gray-400">{user.age} years old</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-2 ml-4">
                    <Link
                      to={`/profile/${user.uid || user.id}`}
                      className="text-blue-500 underline text-sm hover:text-blue-700"
                    >
                      View
                    </Link>
                    <Button
                      onClick={() => handleAcceptRequest(user.uid || user.id)}
                      disabled={accepting === (user.uid || user.id)}
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      {accepting === (user.uid || user.id) ? (
                        <SmallLoadingSpinner />
                      ) : (
                        'Accept'
                      )}
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default ReconnectRequests; 