import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { SmallLoadingSpinner } from "@/components/FeedbackUtils";
import BottomNav from "@/components/BottomNav";
import { ChatPreview as ChatPreviewComponent } from "@/components/ChatPreview";
import { getUserMatches, mockUsers, mockMessages } from "@/data/mock";

interface MockChatPreview {
  matchId: string;
  otherUser: {
    id: string;
    name: string;
    displayName?: string;
    photoUrl?: string;
  };
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

export default function MessagesPage() {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState<MockChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadChats = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        
        // Use mock data instead of Firebase
        const currentUserId = currentUser.uid || 'u1'; // Default to u1 for demo
        const userMatches = getUserMatches(currentUserId);
        
        const mockChats: MockChatPreview[] = userMatches.map((match) => {
          const matchedUserId = match.userId === currentUserId ? match.matchedUserId : match.userId;
          const matchedUser = mockUsers.find(user => user.id === matchedUserId);
          
          // Get messages for this match
          const matchMessages = mockMessages.filter(msg => 
            (msg.senderId === match.userId && msg.senderId === currentUserId) ||
            (msg.senderId === match.matchedUserId && msg.senderId === currentUserId)
          );
          
          const lastMessage = matchMessages[matchMessages.length - 1];
          
          return {
            matchId: match.id,
            otherUser: {
              id: matchedUserId,
              name: matchedUser?.name || "Unknown",
              displayName: matchedUser?.name,
              photoUrl: matchedUser?.photos?.[0]
            },
            lastMessage: lastMessage?.text || "Start a conversation!",
            lastMessageTime: lastMessage?.createdAt || new Date(),
            unreadCount: Math.floor(Math.random() * 3) // Random unread count for demo
          };
        });

        setChats(mockChats);
      } catch (err) {
        console.error(err);
        setError("Failed to load messages.");
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, [currentUser?.uid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <SmallLoadingSpinner />
        <p className="mt-2 text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-red-500 text-center">
          {error}
        </div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
        <p className="text-sm text-gray-500">
          When you match with someone and start chatting, your conversations will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 pt-6 pb-24">
        <h1 className="text-2xl font-semibold mb-4">Messages</h1>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {chats.map((chat) => (
            <ChatPreviewComponent 
              key={chat.matchId} 
              match={{
                id: chat.matchId,
                displayName: chat.otherUser.displayName || chat.otherUser.name || "Unknown User"
              }} 
            />
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
} 