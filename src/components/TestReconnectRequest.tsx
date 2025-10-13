import { useState } from "react";
import { Button } from "@/components/ui/button";
import { sendReconnectRequest } from "@/services/reconnectRequestsService";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import logger from '@/utils/Logger';

interface TestReconnectRequestProps {
  targetUserId: string;
}

export const TestReconnectRequest = ({ targetUserId }: TestReconnectRequestProps) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSendRequest = async () => {
    if (!currentUser?.uid) {
      toast({
        title: "Error",
        description: "You must be logged in to send reconnect requests",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await sendReconnectRequest(currentUser.uid, targetUserId);
      toast({
        title: "Success",
        description: "Reconnect request sent successfully!",
      });
    } catch (error) {
      logger.error("Failed to send reconnect request:", error);
      toast({
        title: "Error",
        description: "Failed to send reconnect request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-medium mb-2">Test Reconnect Request</h3>
      <p className="text-sm text-gray-600 mb-3">
        Send a reconnect request to user: {targetUserId}
      </p>
      <Button 
        onClick={handleSendRequest} 
        disabled={loading}
        size="sm"
      >
        {loading ? "Sending..." : "Send Reconnect Request"}
      </Button>
    </div>
  );
}; 