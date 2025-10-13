import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SmallLoadingSpinner } from "@/components/FeedbackUtils";
import { useToast } from "@/components/ui/use-toast";
import { handleReconnectRequest, canReconnect } from "@/services/reconnectService";
import { useAuth } from "@/context/AuthContext";
import logger from '@/utils/Logger';

interface ReconnectButtonProps {
  targetUserId: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
}

const ReconnectButton: React.FC<ReconnectButtonProps> = ({
  targetUserId,
  className = "",
  variant = "default",
  size = "default",
  children = "Reconnect"
}) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [canReconnectState, setCanReconnectState] = useState<boolean | null>(null);

  // Check if reconnect is allowed when component mounts
  useEffect(() => {
    const checkReconnectStatus = async () => {
      if (!currentUser?.uid) return;
      
      try {
        const allowed = await canReconnect(currentUser.uid, targetUserId);
        setCanReconnectState(allowed);
      } catch (error) {
        logger.error("Error checking reconnect status:", error);
        setCanReconnectState(false);
      }
    };

    checkReconnectStatus();
  }, [currentUser?.uid, targetUserId]);

  const handleReconnect = async () => {
    if (!currentUser?.uid) {
      toast({
        title: "Authentication required",
        description: "Please sign in to reconnect with users.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Check if reconnect is allowed
      const allowed = await canReconnect(currentUser.uid, targetUserId);
      
      if (!allowed) {
        toast({
          title: "Reconnect not available",
          description: "This match cannot be reconnected at this time.",
          variant: "destructive",
        });
        return;
      }

      // Send the reconnect request
      await handleReconnectRequest(currentUser.uid, targetUserId);
      
      toast({
        title: "Reconnect request sent",
        description: "Your reconnect request has been sent successfully.",
      });

      setCanReconnectState(false);
    } catch (error) {
      logger.error("Error sending reconnect request:", error);
      toast({
        title: "Failed to send request",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Don't render button if reconnect is not allowed
  if (canReconnectState === false) {
    return null;
  }

  return (
    <Button
      onClick={handleReconnect}
      disabled={loading || !currentUser?.uid}
      variant={variant}
      size={size}
      className={className}
    >
      {loading ? (
        <>
          <SmallLoadingSpinner />
          <span className="ml-2">Sending...</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
};

export default ReconnectButton; 