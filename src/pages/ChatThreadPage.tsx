import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import config from "@/config";
import { SmallLoadingSpinner } from "@/components/FeedbackUtils";
import BottomNav from "@/components/BottomNav";
import { Match, User, Message } from "@/types";
import MessageInput from "@/components/MessageInput";
import MessageList from "@/components/MessageList";
import { mockMatches } from "@/data/mock";
import { mockUsers } from "@/data/mock";
import { mockMessages } from "@/data/mock";
import Layout from "@/components/Layout";

export default function ChatThreadPage() {
  const { matchId } = useParams();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [partnerName, setPartnerName] = useState("");
  const [match, setMatch] = useState<Match | null>(null);
  const [partner, setPartner] = useState<User | null>(null);

  useEffect(() => {
    if (!matchId || !currentUser) return;

    const fetchData = async () => {
      try {
        // Find match in mock data
        const matchData = mockMatches.find(m => m.id === matchId);
        if (!matchData) {
          console.error("Match not found");
          setLoading(false);
          return;
        }
        
        setMatch(matchData);
        
        const partnerId = matchData.userId === currentUser.uid ? matchData.matchedUserId : matchData.userId;
        const partnerData = mockUsers.find(u => u.id === partnerId);
        
        if (partnerData) {
          setPartner(partnerData);
          setPartnerName(partnerData.name || "Unknown User");
        }
        
        // Get messages for this match
        const matchMessages = mockMessages.filter(msg => msg.matchId === matchId);
        setMessages(matchMessages);
        
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

    // Simulate real-time updates
    // CRITICAL: Disabled in demo mode - messages are loaded from localStorage, no need for 1-second polling
    // This interval was causing constant re-renders
    if (config.DEMO_MODE) {
      // In demo mode, just load messages once
      const matchMessages = mockMessages.filter(msg => msg.matchId === matchId);
      setMessages(matchMessages);
      return;
    }
    
    const interval = setInterval(() => {
      const matchMessages = mockMessages.filter(msg => msg.matchId === matchId);
      setMessages(matchMessages);
    }, 1000);

    return () => clearInterval(interval);
  }, [matchId]);

  const handleMessageSent = () => {
    // Message was sent successfully, the MessageList will auto-scroll
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center pb-20">
          <SmallLoadingSpinner />
          <p className="mt-2 text-muted-foreground">Loading chat...</p>
        </div>
        <BottomNav />
      </Layout>
    );
  }

  if (!match || !partner) {
    return (
      <Layout>
        <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center pb-20">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chat not found</h3>
            <p className="text-sm text-gray-500">
              This conversation may have expired or been removed.
            </p>
          </div>
        </div>
        <BottomNav />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-neutral-900 flex flex-col pb-20">
        {/* Header */}
        <div className="bg-neutral-800 border-b border-neutral-700 px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-700 flex-shrink-0">
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
            <div className="w-full h-full bg-neutral-600 items-center justify-center text-neutral-300 font-medium text-sm hidden">
              {partnerName.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-white truncate">{partnerName}</h1>
            <p className="text-xs text-neutral-400">Active now</p>
          </div>
        </div>

        {/* Messages */}
        <MessageList messages={messages} currentUserId={currentUser?.uid || ''} />

        {/* Message Input */}
        <MessageInput matchId={matchId!} onMessageSent={handleMessageSent} />
      </div>
      <BottomNav />
    </Layout>
  );
} 