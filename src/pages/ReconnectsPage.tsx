import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { UserProfile } from "@/types/services";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { SmallLoadingSpinner } from "@/components/FeedbackUtils";
import { formatDistanceToNow } from "date-fns";
import BottomNav from "@/components/BottomNav";
import { fetchAcceptedReconnects } from "@/services/reconnectRequestsService";

interface ReconnectData {
  user: UserProfile;
  reconnectedAt: Date;
}

export default function ReconnectsPage() {
  const { currentUser } = useAuth();
  const [reconnects, setReconnects] = useState<ReconnectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser?.uid) return;
    
    const fetchReconnects = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const reconnectData = await fetchAcceptedReconnects(currentUser.uid);
        setReconnects(reconnectData);
      } catch (err) {
        console.error("Error fetching reconnects:", err);
        setError("Failed to load reconnections");
      } finally {
        setLoading(false);
      }
    };

    fetchReconnects();
  }, [currentUser?.uid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 pt-6 pb-24">
          <h1 className="text-xl font-bold mb-4">Reconnected</h1>
          <div className="flex justify-center py-8">
            <SmallLoadingSpinner />
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 pt-6 pb-24">
        <h1 className="text-xl font-bold mb-4">Reconnected</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {reconnects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No reconnections yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              When you accept reconnect requests, they'll appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reconnects.map((reconnect) => (
              <Card key={reconnect.user.uid || reconnect.user.id} className="flex items-center space-x-4 p-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage 
                    src={reconnect.user.photos?.[0] || ""} 
                    alt={reconnect.user.displayName || reconnect.user.name || "User"} 
                  />
                  <AvatarFallback className="text-sm font-bold">
                    {(reconnect.user.displayName || reconnect.user.name || "?").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <CardContent className="flex-1 p-0">
                  <p className="font-medium">
                    {reconnect.user.displayName || reconnect.user.name || "Unknown User"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Reconnected {formatDistanceToNow(reconnect.reconnectedAt, { addSuffix: true })}
                  </p>
                  {reconnect.user.age && reconnect.user.age > 0 && (
                    <p className="text-xs text-gray-400">{reconnect.user.age} years old</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
} 