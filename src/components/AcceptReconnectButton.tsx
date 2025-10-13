import { useState } from "react";
import { acceptReconnectRequest } from "@/services/reconnectRequestsService";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { SmallLoadingSpinner } from "@/components/FeedbackUtils";
import logger from '@/utils/Logger';

interface AcceptReconnectButtonProps {
  targetUid: string;
  onAccept?: () => void;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const AcceptReconnectButton = ({ 
  targetUid, 
  onAccept,
  className = "",
  variant = "default",
  size = "default"
}: AcceptReconnectButtonProps) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");

  const handleAccept = async () => {
    if (!currentUser?.uid) return;
    setLoading(true);
    setError("");
    
    try {
      await acceptReconnectRequest(currentUser.uid, targetUid);
      setAccepted(true);
      onAccept?.(); // Call optional callback
    } catch (err) {
      logger.error('Error accepting reconnect request:', err);
      setError("Failed to accept reconnect.");
    } finally {
      setLoading(false);
    }
  };

  if (accepted) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-green-600 font-semibold">✓ Reconnected!</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button 
        onClick={handleAccept} 
        disabled={loading || !currentUser?.uid}
        variant={variant}
        size={size}
        className={className}
      >
        {loading ? (
          <>
            <SmallLoadingSpinner />
            <span className="ml-2">Accepting...</span>
          </>
        ) : (
          "Accept Reconnect"
        )}
      </Button>
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  );
};

export default AcceptReconnectButton; 