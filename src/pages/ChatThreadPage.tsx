import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import config from "@/config";
import { SmallLoadingSpinner } from "@/components/FeedbackUtils";
import BottomNav from "@/components/BottomNav";
import { Match, User, Message } from "@/types";
import MessageInput from "@/components/MessageInput";
import MessageList from "@/components/MessageList";
// Demo mode fallbacks
import { mockMatches, mockUsers, mockMessages } from "@/data/mock";
import Layout from "@/components/Layout";
import { logError } from "@/utils/errorHandler";
// Firebase services for production
import { subscribeToMessages, Message as FirebaseMessage } from "@/services/messageService";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { firestore } from "@/firebase/config";
import { FirestoreMatch } from "@/types/match";

export default function ChatThreadPage() {
  const { matchId } = useParams();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [partnerName, setPartnerName] = useState("");
  const [match, setMatch] = useState<Match | null>(null);
  const [partner, setPartner] = useState<User | null>(null);
  const [partnerPhoto, setPartnerPhoto] = useState<string>("");

  useEffect(() => {
    if (!matchId || !currentUser) return;

    const fetchData = async () => {
      try {
        if (config.DEMO_MODE) {
          // Demo mode: use mock data
          const matchData = mockMatches.find(m => m.id === matchId);
          if (!matchData) {
            logError(new Error("Match not found"), {
              source: 'ChatThreadPage',
              action: 'loadChatData',
              matchId: matchId || 'unknown'
            });
            setLoading(false);
            return;
          }
          
          setMatch(matchData);
          
          const partnerId = matchData.userId === currentUser.uid ? matchData.matchedUserId : matchData.userId;
          const partnerData = mockUsers.find(u => u.id === partnerId);
          
          if (partnerData) {
            setPartner(partnerData);
            setPartnerName(partnerData.name || "Unknown User");
            setPartnerPhoto(partnerData.photos?.[0] || "");
          }
          
          const matchMessages = mockMessages.filter(msg => msg.matchId === matchId);
          setMessages(matchMessages);
          setLoading(false);
        } else {
          // Production: use Firebase
          if (!firestore) {
            setLoading(false);
            return;
          }
          
          // Get match from Firestore
          const matchDoc = await getDoc(doc(firestore, 'matches', matchId));
          if (!matchDoc.exists()) {
            logError(new Error("Match not found in Firebase"), {
              source: 'ChatThreadPage',
              action: 'loadChatData',
              matchId
            });
            setLoading(false);
            return;
          }
          
          const matchData = { id: matchDoc.id, ...matchDoc.data() } as FirestoreMatch;
          
          // Transform to Match type for compatibility
          const transformedMatch: Match = {
            id: matchData.id,
            userId: matchData.userId1,
            matchedUserId: matchData.userId2,
            timestamp: matchData.timestamp,
            venueId: matchData.venueId,
            status: matchData.matchExpired ? 'expired' : 'active',
            messages: [],
          };
          setMatch(transformedMatch);
          
          // Get partner's profile
          const partnerId = matchData.userId1 === currentUser.uid ? matchData.userId2 : matchData.userId1;
          const userDoc = await getDoc(doc(firestore, 'users', partnerId));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setPartnerName(userData.name || userData.displayName || "Unknown User");
            setPartnerPhoto(userData.photos?.[0] || "");
            setPartner({
              id: partnerId,
              name: userData.name || userData.displayName || "Unknown User",
              photos: userData.photos || [],
              bio: userData.bio || "",
              age: userData.age,
            } as User);
          }
          
          // Initial messages from match document
          const initialMessages: Message[] = (matchData.messages || []).map((msg, idx) => ({
            id: `${matchId}_${idx}`,
            matchId: matchId,
            senderId: msg.senderId,
            text: msg.text,
            createdAt: new Date(msg.timestamp),
            readBy: [],
          }));
          setMessages(initialMessages);
          
          setLoading(false);
        }
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)), {
          source: 'ChatThreadPage',
          action: 'loadChatData',
          matchId: matchId || 'unknown'
        });
        setLoading(false);
      }
    };

    fetchData();
  }, [matchId, currentUser]);

  // Real-time message subscription
  useEffect(() => {
    if (!matchId || !currentUser) return;

    if (config.DEMO_MODE) {
      // In demo mode, just load messages once
      const matchMessages = mockMessages.filter(msg => msg.matchId === matchId);
      setMessages(matchMessages);
      return;
    }
    
    // Production: subscribe to real-time messages from Firebase
    if (!firestore) return;
    
    // Subscribe to match document for message updates
    const unsubscribe = onSnapshot(
      doc(firestore, 'matches', matchId),
      (docSnap) => {
        if (docSnap.exists()) {
          const matchData = docSnap.data() as FirestoreMatch;
          const updatedMessages: Message[] = (matchData.messages || []).map((msg, idx) => ({
            id: `${matchId}_${idx}`,
            matchId: matchId,
            senderId: msg.senderId,
            text: msg.text,
            createdAt: new Date(msg.timestamp),
            readBy: [],
          }));
          setMessages(updatedMessages);
        }
      },
      (error) => {
        logError(error, {
          source: 'ChatThreadPage',
          action: 'subscribeToMessages',
          matchId
        });
      }
    );

    return () => unsubscribe();
  }, [matchId, currentUser]);

  const handleMessageSent = () => {
    // Message was sent successfully, real-time subscription will update messages
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
            {partnerPhoto ? (
              <img
                src={partnerPhoto}
                alt={partnerName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full bg-neutral-600 flex items-center justify-center text-neutral-300 font-medium text-sm">
                {partnerName.charAt(0).toUpperCase()}
              </div>
            )}
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