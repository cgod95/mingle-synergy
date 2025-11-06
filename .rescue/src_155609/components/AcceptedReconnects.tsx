import { useEffect, useState } from "react";
import { firestore } from "@/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { UserProfile } from "@/types/services";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SmallLoadingSpinner } from "@/components/FeedbackUtils";

const AcceptedReconnects = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccepted = async () => {
      if (!currentUser?.uid) return;

      setLoading(true);
      setError(null);

      try {
        const acceptedRef = collection(firestore, "users", currentUser.uid, "acceptedReconnects");
        const snapshot = await getDocs(acceptedRef);
        const userList: UserProfile[] = [];

        for (const docSnap of snapshot.docs) {
          const userDoc = await getDoc(doc(firestore, "users", docSnap.id));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            userList.push({ 
              ...(userData as UserProfile), 
              uid: docSnap.id,
              id: docSnap.id 
            });
          }
        }

        setUsers(userList);
      } catch (err) {
        console.error("Error fetching accepted reconnects:", err);
        setError("Failed to load reconnected users");
      } finally {
        setLoading(false);
      }
    };

    fetchAccepted();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="space-y-4 mt-6">
        <h3 className="text-lg font-semibold px-4">Reconnected Users</h3>
        <div className="flex justify-center py-8">
          <SmallLoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 mt-6">
        <h3 className="text-lg font-semibold px-4">Reconnected Users</h3>
        <div className="px-4">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) return null;

  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-lg font-semibold px-4">Reconnected Users</h3>
      <div className="grid grid-cols-2 gap-4 px-4">
        {users.map((user) => (
          <Card key={user.uid || user.id} className="p-4 flex flex-col items-center text-center">
            <Avatar className="w-20 h-20">
              <AvatarImage 
                src={user.photos?.[0] || ""} 
                alt={user.displayName || user.name || "User"} 
              />
              <AvatarFallback className="text-xl font-bold">
                {(user.displayName || user.name || "?").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="mt-2">
              <p className="text-base font-medium">
                {user.displayName || user.name || "Unknown User"}
              </p>
              {user.age && user.age > 0 && (
                <p className="text-sm text-muted-foreground">{user.age} yrs</p>
              )}
              <p className="text-sm text-muted-foreground">Reconnected</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AcceptedReconnects; 