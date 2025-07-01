import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import matchService from "@/services/firebase/matchService";
import userService from "@/services/firebase/userService";
import { subscribeToMessages, Message, markMessagesAsRead } from "@/services/messageService";
import { useAuth } from "@/context/AuthContext";
import { SmallLoadingSpinner } from "@/components/FeedbackUtils";
import BottomNav from "@/components/BottomNav";
import { FirestoreMatch } from "@/types/match";
import { UserProfile } from "@/types/services";
import MessageInput from "@/components/MessageInput";
import MessageList from "@/components/MessageList";

export default function ChatThreadPage() {
  const { matchId } = useParams();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [partnerName, setPartnerName] = useState("");
  const [match, setMatch] = useState<FirestoreMatch | null>(null);
  const [partner, setPartner] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!matchId || !currentUser) return;

    const fetchData = async () => {
      try {
        const matchData = await matchService.getMatchById(matchId);
        if (!matchData) {
          console.error("Match not found");
          return;
        }
        
        setMatch(matchData);
        
        const partnerId = matchData.userId1 === currentUser.uid ? matchData.userId2 : matchData.userId1;
        const partnerData = await userService.getUserById(partnerId);
        
        if (partnerData) {
          setPartner(partnerData);
          setPartnerName(partnerData.displayName || partnerData.name || "Unknown User");
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching chat data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [matchId, currentUser]);

  // Real-time message subscription
  useEffect(() => {
    if (!matchId) return;

    const unsubscribe = subscribeToMessages(matchId, (newMessages) => {
      setMessages(newMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [matchId]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (matchId && currentUser?.uid) {
      markMessagesAsRead(matchId, currentUser.uid);
    }
  }, [matchId, currentUser?.uid]);

  const handleMessageSent = () => {
    // Message was sent successfully, the MessageList will auto-scroll
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <SmallLoadingSpinner />
        <p className="mt-2 text-muted-foreground">Loading chat...</p>
      </div>
    );
  }

  if (!match || !partner) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chat not found</h3>
          <p className="text-sm text-gray-500">
            This conversation may have expired or been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          <img
            src={partner.photos?.[0] || ""}
            alt={partnerName}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="w-full h-full bg-gray-300 items-center justify-center text-gray-600 font-medium text-sm hidden">
            {partnerName.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-gray-900 truncate">{partnerName}</h1>
          <p className="text-xs text-gray-500">Active now</p>
        </div>
      </div>

      {/* Messages */}
      <MessageList messages={messages} currentUserId={currentUser?.uid || ''} />

      {/* Message Input */}
      <MessageInput matchId={matchId!} onMessageSent={handleMessageSent} />
      
      <BottomNav />
    </div>
  );
} 