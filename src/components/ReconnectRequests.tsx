import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import userService from "@/services/firebase/userService";
import reconnectService from "@/services/reconnectService";
import { UserProfile } from "@/types/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, Check, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import logger from '@/utils/Logger';

const ReconnectRequests: React.FC = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!currentUser?.email) return;

      // Use mock uid for development
      const mockUid = "mock-user-id";

      try {
        const requestIds = await userService.getReconnectRequests(mockUid);
        
        // Convert request IDs to user profiles
        const userProfiles = await Promise.all(
          requestIds.map(async (userId) => {
            try {
              const profile = await userService.getUserProfile(userId);
              return profile;
            } catch (error) {
              logger.error(`Error fetching profile for ${userId}:`, error);
              return null;
            }
          })
        );
        
        // Filter out null profiles
        setRequests(userProfiles.filter(profile => profile !== null) as UserProfile[]);
      } catch (error) {
        logger.error("Error fetching reconnect requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [currentUser]);

  const handleAccept = async (targetUid: string) => {
    if (!currentUser?.email) return;

    // Use mock uid for development
    const mockUid = "mock-user-id";

    try {
      // Update the match document to mark as reconnected
      const matchDocRef = doc(
        db,
        "matches",
        [mockUid, targetUid].sort().join("_")
      );

      await updateDoc(matchDocRef, {
        reconnectedAt: serverTimestamp(),
        isReconnected: true,
      });

      // Remove from requests list
      setRequests(prev => prev.filter(user => user.id !== targetUid));

      // You could also add to accepted reconnects collection here
      const acceptedRef = doc(db, "users", mockUid, "acceptedReconnects", targetUid);
      await updateDoc(acceptedRef, {
        reconnectedAt: serverTimestamp(),
      });

    } catch (error) {
      logger.error("Error accepting reconnect request:", error);
    }
  };

  const handleReject = async (targetUid: string) => {
    if (!currentUser?.email) return;

    // Use mock uid for development
    const mockUid = "mock-user-id";

    try {
      // Remove from requests list
      setRequests(prev => prev.filter(user => user.id !== targetUid));

      // You could also add to rejected reconnects collection here
      const rejectedRef = doc(db, "users", mockUid, "rejectedReconnects", targetUid);
      await updateDoc(rejectedRef, {
        rejectedAt: serverTimestamp(),
      });

    } catch (error) {
      logger.error("Error rejecting reconnect request:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Reconnect Requests</h2>
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

  if (requests.length === 0) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Reconnect Requests</h2>
        <div className="text-center py-8 text-gray-500">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No reconnect requests yet.</p>
          <p className="text-sm">When someone wants to reconnect, they'll appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Reconnect Requests</h2>
      <div className="space-y-4">
        {requests.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.photos[0]} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.age} years old</p>
                  {user.bio && (
                    <p className="text-sm text-gray-500 mt-1">{user.bio}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleAccept(user.id)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Accept
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleReject(user.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reject
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

export default ReconnectRequests; 