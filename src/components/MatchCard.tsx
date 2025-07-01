// src/components/MatchCard.tsx
import React, { useState } from "react";
import { DisplayMatch } from "@/types/match";
import { useAuth } from "@/context/AuthContext";
import { sendMessage, confirmWeMet } from "@/services/firebase/matchService";
import WeMetConfirmationModal from "@/components/WeMetConfirmationModal";
import { Button } from "@/components/ui/button";

type MatchCardProps = {
  match: DisplayMatch;
  isRematch?: boolean;
  onWeMetClick?: (matchId: string) => void;
};

const MatchCard: React.FC<MatchCardProps> = ({ match, isRematch = false, onWeMetClick }) => {
  const { currentUser } = useAuth();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [showWeMetModal, setShowWeMetModal] = useState(false);
  const [weMetStatus, setWeMetStatus] = useState<"idle" | "confirming" | "confirmed" | "error">("idle");

  const handleSendMessage = async () => {
    if (!currentUser || !message.trim()) return;
    setStatus("sending");

    try {
      await sendMessage(match.id, currentUser.uid, message.trim());
      setMessage("");
      setStatus("sent");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      console.error("Error sending message:", err);
      setStatus("error");
    }
  };

  const handleWeMetConfirm = async () => {
    if (!currentUser) return;
    
    if (onWeMetClick) {
      // Use centralized confirmation if provided
      onWeMetClick(match.id);
      setShowWeMetModal(false);
    } else {
      // Use local confirmation if no centralized handler
      setWeMetStatus("confirming");
      
      try {
        await confirmWeMet(match.id, currentUser.uid);
        setWeMetStatus("confirmed");
        setShowWeMetModal(false);
        setTimeout(() => setWeMetStatus("idle"), 2000);
      } catch (err) {
        console.error("Error confirming we met:", err);
        setWeMetStatus("error");
      }
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center space-y-3">
        {isRematch && (
          <div className="w-full bg-blue-100 border border-blue-300 rounded-lg p-2 mb-2">
            <p className="text-blue-800 text-sm text-center font-medium">
              🔄 Reconnected! You matched before
            </p>
          </div>
        )}
        
        <img
          src={match.photoUrl}
          alt={match.name}
          className="w-24 h-24 rounded-full object-cover"
        />
        <h2 className="text-lg font-semibold">{match.name}, {match.age}</h2>
        <p className="text-gray-600 text-center">{match.bio}</p>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Send a message..."
          className="w-full border rounded p-2 text-sm"
          rows={2}
        />

        <div className="flex gap-2 w-full">
          <button
            onClick={handleSendMessage}
            disabled={status === "sending" || status === "sent"}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded"
          >
            {status === "sending"
              ? "Sending..."
              : status === "sent"
              ? "Sent!"
              : "Send Message"}
          </button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowWeMetModal(true)}
            disabled={weMetStatus === "confirming" || weMetStatus === "confirmed"}
            className="text-green-600 border-green-300 hover:bg-green-50"
          >
            {weMetStatus === "confirming" 
              ? "Confirming..." 
              : weMetStatus === "confirmed" 
              ? "Confirmed!" 
              : "We Met"}
          </Button>
        </div>

        {status === "error" && (
          <p className="text-red-500 text-xs mt-1">Error sending message. Try again.</p>
        )}
        
        {weMetStatus === "error" && (
          <p className="text-red-500 text-xs mt-1">Error confirming we met. Try again.</p>
        )}
      </div>

      <WeMetConfirmationModal
        open={showWeMetModal}
        onConfirm={handleWeMetConfirm}
        onCancel={() => setShowWeMetModal(false)}
      />
    </>
  );
};

export default MatchCard;
