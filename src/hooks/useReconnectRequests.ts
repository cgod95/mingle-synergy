import { useEffect, useState, useCallback } from "react";
import { fetchReconnectRequests } from "@/services/reconnectRequestsService";
import { UserProfile } from "@/types/services";
import { useAuth } from "@/context/AuthContext";
import config from "@/config";

export const useReconnectRequests = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshRequests = useCallback(() => {
    if (!currentUser?.uid) return;
    setLoading(true);
    fetchReconnectRequests(currentUser.uid)
      .then(userProfiles => {
        setRequests(userProfiles);
        setError(null);
      })
      .catch(err => {
        console.error("Failed to fetch reconnect requests:", err);
        setError("Failed to fetch reconnect requests.");
      })
      .finally(() => setLoading(false));
  }, [currentUser?.uid]);

  useEffect(() => {
    refreshRequests();
    // Disable polling in demo mode to prevent flickering
    if (!config.DEMO_MODE) {
      const interval = setInterval(refreshRequests, 30000);
      return () => clearInterval(interval);
    }
  }, [refreshRequests]);

  return { requests, loading, error, refreshRequests };
}; 