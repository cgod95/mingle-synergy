import React, { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { UserProfile } from "@/types/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, MapPin } from "lucide-react";
import logger from '@/utils/Logger';

interface AcceptedReconnect {
  user: UserProfile;
  reconnectedAt: Date;
}

const AcceptedReconnects: React.FC = () => {
  const { currentUser } = useAuth();
  const [acceptedReconnects, setAcceptedReconnects] = useState<AcceptedReconnect[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAcceptedReconnects = async () => {
      if (!currentUser?.email) return;

      // Use mock uid for development
      const mockUid = "mock-user-id";

      try {
        const acceptedRef = collection(db, "users", mockUid, "acceptedReconnects");
        const snapshot = await getDocs(acceptedRef);
        const userList: UserProfile[] = [];

        for (const docSnap of snapshot.docs) {
          const userDoc = await getDoc(doc(db, "users", docSnap.id));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            userList.push({
              id: userDoc.id,
              uid: userDoc.id,
              name: userData.name || "Unknown User",
              age: userData.age || 0,
              bio: userData.bio || "",
              photos: userData.photos || [],
              interests: userData.interests || [],
              isCheckedIn: userData.isCheckedIn || false,
              isVisible: userData.isVisible || true,
              gender: userData.gender || 'other',
              interestedIn: userData.interestedIn || [],
              ageRangePreference: userData.ageRangePreference || { min: 18, max: 100 },
              matches: userData.matches || [],
              likedUsers: userData.likedUsers || [],
              blockedUsers: userData.blockedUsers || [],
            });
          }
        }

        setAcceptedReconnects(
          userList.map((user) => ({
            user,
            reconnectedAt: new Date(), // This would come from the actual data
          }))
        );
      } catch (error) {
        logger.error("Error fetching accepted reconnects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAcceptedReconnects();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Accepted Reconnects</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (acceptedReconnects.length === 0) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Accepted Reconnects</h2>
        <div className="text-center py-8 text-gray-500">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No accepted reconnects yet.</p>
          <p className="text-sm">When you accept reconnect requests, they'll appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Accepted Reconnects</h2>
      <div className="space-y-4">
        {acceptedReconnects.map((reconnect) => (
          <Card key={reconnect.user.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={reconnect.user.photos[0]} alt={reconnect.user.name} />
                  <AvatarFallback>{reconnect.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">{reconnect.user.name}</h3>
                  <p className="text-sm text-gray-600">{reconnect.user.age} years old</p>
                  {reconnect.user.bio && (
                    <p className="text-sm text-gray-500 mt-1">{reconnect.user.bio}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Message
                  </Button>
                  <Button size="sm" variant="outline">
                    <MapPin className="w-4 h-4 mr-1" />
                    Venue
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AcceptedReconnects; 