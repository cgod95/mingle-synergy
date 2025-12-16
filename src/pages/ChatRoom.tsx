import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Send, MoreVertical, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MingleMLogo from "@/components/ui/MingleMLogo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BlockReportDialog } from "@/components/BlockReportDialog";

import { getActiveMatches } from "@/lib/matchesCompat";
import { getMessageCount, canSendMessage, getRemainingMessages, incrementMessageCount } from "@/utils/messageLimitTracking";
import { getCheckedVenueId } from "@/lib/checkinStore";
import MessageLimitModal from "@/components/ui/MessageLimitModal";
import { useToast } from "@/hooks/use-toast";
import { NetworkErrorBanner } from "@/components/ui/NetworkErrorBanner";
import { retryWithMessage, isNetworkError } from "@/utils/retry";
import { logError } from "@/utils/errorHandler";
import config from "@/config";
import { sendMessageWithLimit, getMatchMessages, subscribeToMessages } from "@/services/messageService";

// Conversation starter prompts (Venue/IRL focused - aligned with Mingle mission)
const CONVERSATION_STARTERS = [
  "What brings you here tonight?",
  "Have you been to this venue before?",
  "What do you think of the vibe here?",
  "Are you here with friends?",
  "What's your favorite spot in this place?",
  "How's your night going?",
  "What do you think of the music?",
];

/** Local storage helpers */
const messagesKey = (id: string) => `mingle:messages:${id}`;
type Msg = { sender: "you" | "them"; text: string; ts: number };

function loadMessages(id: string): Msg[] {
  try {
    const raw = localStorage.getItem(messagesKey(id));
    return raw ? (JSON.parse(raw) as Msg[]) : [];
  } catch {
    return [];
  }
}
function saveMessages(id: string, msgs: Msg[]) {
  try {
    localStorage.setItem(messagesKey(id), JSON.stringify(msgs));
  } catch {}
}
function ensureThread(id: string): Msg[] {
  const cur = loadMessages(id);
  if (cur.length > 0) return cur;
  const starter: Msg[] = [
    { sender: "them", text: "Hey 👋", ts: Date.now() - 60_000 },
  ];
  saveMessages(id, starter);
  return starter;
}

export default function ChatRoom() {
  const { id } = useParams<{ id: string }>();
  const matchId = id; // Use id from params (ChatRoomGuard passes it as id)
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [matchName, setMatchName] = useState<string>("Chat");
  const [matchAvatar, setMatchAvatar] = useState<string>("");
  const [matchExpiresAt, setMatchExpiresAt] = useState<number>(0);
  const [venueName, setVenueName] = useState<string>("");
  const [showStarters, setShowStarters] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showMessageLimitModal, setShowMessageLimitModal] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState(3);
  const [canSendMsg, setCanSendMsg] = useState(true);
  const [sendError, setSendError] = useState<Error | null>(null);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  // Load match name, avatar, expiry, and venue from matchesCompat
  useEffect(() => {
    const loadMatchInfo = async () => {
      if (!matchId || !currentUser?.uid) return;
      try {
        const matches = await getActiveMatches(currentUser.uid);
        const match = matches.find(m => m.id === matchId);
        if (match) {
          setMatchName(match.displayName || "Chat");
          setMatchAvatar(match.avatarUrl || "");
          setMatchExpiresAt(match.expiresAt || 0);
          // Show conversation starters if this is a new conversation
          if (msgs.length <= 1) {
            setShowStarters(true);
          }
        }
      } catch (error) {
        logError(error as Error, { context: 'ChatRoom.loadMatchInfo', matchId });
      }
    };
    loadMatchInfo();
  }, [matchId, currentUser, msgs.length]);

  // Typing indicator logic
  // Note: In production, this would receive typing events from Firebase/WebSocket
  // For now, we simulate typing when user types (demo mode)
  // TODO: Integrate with real-time service to show when OTHER user is typing
  useEffect(() => {
    // Simulate other user typing occasionally (demo)
    // In production, this would be: onTypingEvent from Firebase/WebSocket
    if (text.length > 0 && Math.random() > 0.7) {
      setIsTyping(true);
      const timeout = setTimeout(() => {
        setIsTyping(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [msgs.length]); // Trigger on new messages (simulating response)

  // Calculate remaining time until match expires
  const getRemainingTime = () => {
    if (!matchExpiresAt) return null;
    const now = Date.now();
    const remaining = matchExpiresAt - now;
    if (remaining <= 0) return null;
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Get other user ID from match (for block/report)
  const otherUserId = useMemo(() => {
    // In a real implementation, fetch match data to get otherUserId
    // For now, use matchId as placeholder
    return matchId || "";
  }, [matchId]);

  useEffect(() => {
    if (!matchId || !currentUser?.uid) return;
    
    // In production mode, load and subscribe to Firebase messages
    if (!config.DEMO_MODE) {
      // Initial load
      getMatchMessages(matchId).then(firebaseMessages => {
        const formattedMsgs: Msg[] = firebaseMessages.map(m => ({
          sender: m.senderId === currentUser.uid ? 'you' : 'them',
          text: m.text,
          ts: m.createdAt.getTime()
        }));
        setMsgs(formattedMsgs);
        
        // Also save to localStorage for offline access
        saveMessages(matchId, formattedMsgs);
      }).catch(err => {
        logError(err instanceof Error ? err : new Error('Failed to load messages'), {
          context: 'ChatRoom.loadMessages',
          matchId
        });
        // Fallback to localStorage
        setMsgs(ensureThread(matchId));
      });
      
      // Subscribe to real-time updates
      const unsubscribe = subscribeToMessages(matchId, (firebaseMessages) => {
        const formattedMsgs: Msg[] = firebaseMessages.map(m => ({
          sender: m.senderId === currentUser.uid ? 'you' : 'them',
          text: m.text,
          ts: m.createdAt.getTime()
        }));
        setMsgs(formattedMsgs);
        saveMessages(matchId, formattedMsgs);
      });
      
      return () => unsubscribe();
    } else {
      // Demo mode: use localStorage
      const seeded = ensureThread(matchId);
      setMsgs(seeded);
    }
    
    // Update message limit tracking
    const updateLimits = async () => {
      const remaining = await getRemainingMessages(matchId, currentUser.uid);
      const canSend = await canSendMessage(matchId, currentUser.uid);
      setRemainingMessages(remaining);
      setCanSendMsg(canSend);
      
      // Show modal if limit reached (but not for premium users)
      if (!canSend && remaining === 0) {
        setShowMessageLimitModal(true);
      }
    };
    updateLimits();
  }, [matchId, currentUser?.uid]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs]);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  if (!matchId) {
    return (
      <div className="min-h-screen bg-neutral-900 p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-neutral-800 border-2 border-neutral-700 rounded-2xl shadow-lg p-6 text-center">
          <p className="text-neutral-300">Chat not found.</p>
          <Button 
            onClick={() => navigate(-1)} 
            className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || !currentUser?.uid || sending) return;
    
    setSendError(null);
    setSending(true);
    
    try {
      // Check message limit (premium users bypass)
      const canSend = await retryWithMessage(
        () => canSendMessage(matchId, currentUser.uid),
        { operationName: 'checking message limit', maxRetries: 2 }
      );
      
      if (!canSend) {
        toast({
          title: "Message limit reached",
          description: "You've sent all 5 messages. Wait for a reply or reconnect at a venue.",
          variant: "destructive",
        });
        setShowMessageLimitModal(true);
        return;
      }
      
      // In production, send via Firebase
      if (!config.DEMO_MODE) {
        await sendMessageWithLimit({
          matchId,
          senderId: currentUser.uid,
          message: t
        });
        // Messages will update via subscription, but add optimistically
        const optimisticMsg: Msg = { sender: "you" as const, text: t, ts: Date.now() };
        setMsgs(prev => [...prev, optimisticMsg]);
      } else {
        // Demo mode: save locally
        const next: Msg[] = [...msgs, { sender: "you" as const, text: t, ts: Date.now() }];
        setMsgs(next);
        saveMessages(matchId, next);
        
        // Increment message count (only for non-premium users in demo)
        const isPremium = await (async () => {
          try {
            const { subscriptionService } = await import("@/services");
            if (subscriptionService && typeof subscriptionService.getUserSubscription === 'function') {
              const subscription = subscriptionService.getUserSubscription(currentUser.uid);
              return subscription?.tierId === 'premium' || subscription?.tierId === 'pro';
            }
          } catch {}
          return false;
        })();
        
        if (!isPremium) {
          incrementMessageCount(matchId, currentUser.uid);
        }
      }
      
      const remaining = await getRemainingMessages(matchId, currentUser.uid);
      setRemainingMessages(remaining);
      setCanSendMsg(await canSendMessage(matchId, currentUser.uid));
      
      // Show toast if 1 message remaining (but not for premium)
      if (remaining === 1) {
        toast({
          title: "1 message remaining",
          description: "Make it count! Focus on meeting up in person.",
        });
      }
      
      setText("");
      setShowStarters(false); // Hide starters after first message
      inputRef.current?.focus();
    } catch (error) {
      logError(error as Error, { context: 'ChatRoom.onSend', matchId, userId: currentUser?.uid || 'unknown' });
      const errorObj = error instanceof Error ? error : new Error('Failed to send message');
      setSendError(errorObj);
      
      toast({
        title: "Failed to send message",
        description: isNetworkError(error)
          ? "Network error. Please check your connection and try again."
          : errorObj.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const sendStarter = (starter: string) => {
    const next: Msg[] = [...msgs, { sender: "you" as const, text: starter, ts: Date.now() }];
    setMsgs(next);
    saveMessages(matchId, next);
    setShowStarters(false);
    inputRef.current?.focus();
  };

      return (
        <div className="fixed inset-0 flex flex-col bg-neutral-900 z-50">
          <div className="max-w-4xl mx-auto w-full h-full flex flex-col bg-neutral-800 shadow-xl">
            <NetworkErrorBanner error={sendError} onRetry={() => onSend(new Event('submit') as any)} />
            {/* Mingle Branding */}
            <div className="bg-neutral-800/80 backdrop-blur-md border-b border-neutral-700 px-4 sm:px-6 py-2 flex items-center flex-shrink-0">
              <Link to="/matches" className="group">
                <MingleMLogo size="sm" showText={true} className="text-white" />
              </Link>
            </div>
          {/* Header */}
          <div className="bg-neutral-800 border-b border-neutral-700 px-4 sm:px-6 py-3 sm:py-4 flex items-center space-x-3 shadow-sm flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Avatar className="h-10 w-10 ring-2 ring-indigo-500/50 rounded-md">
          {matchAvatar ? (
            <AvatarImage src={matchAvatar} alt={matchName} className="object-cover rounded-md" />
          ) : null}
          <AvatarFallback className="bg-indigo-600 text-white rounded-md">
            {matchName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-white truncate">{matchName}</h2>
          <div className="flex items-center gap-2">
            {matchExpiresAt && getRemainingTime() && (
              <p className="text-xs text-indigo-400 font-medium">
                Active for {getRemainingTime()}
              </p>
            )}
          </div>
        </div>
        {/* Block/Report Menu */}
        {otherUserId && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowBlockDialog(true)}>
                <span className="text-red-600">Block User</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                <span>Report User</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-3 bg-neutral-900">
        {/* How Mingle Works Info Banner */}
        {msgs.length <= 1 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-indigo-900/50 rounded-xl border border-indigo-700 p-3"
          >
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-medium text-neutral-200 mb-1">You have 5 messages to make plans</p>
                <p className="text-xs text-neutral-300">Focus on meeting up in person - that's what Mingle is all about!</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Conversation Starters - Show when conversation is new */}
        {showStarters && msgs.length <= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="flex items-center gap-2 mb-3 px-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <p className="text-sm font-medium text-neutral-300">Try a conversation starter</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {CONVERSATION_STARTERS.slice(0, 3).map((starter, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setText(starter);
                    setShowStarters(false);
                    inputRef.current?.focus();
                  }}
                  className="px-4 py-2 text-sm bg-neutral-700 border-2 border-indigo-600 rounded-full text-neutral-200 hover:border-indigo-500 hover:bg-indigo-900/30 transition-all"
                >
                  {starter}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {msgs.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex items-end gap-2 ${m.sender === "you" ? "justify-end" : "justify-start"}`}
            >
              {/* Avatar for their messages */}
              {m.sender === "them" && (
                <Avatar className="h-8 w-8 flex-shrink-0 rounded-md">
                  {matchAvatar ? (
                    <AvatarImage src={matchAvatar} alt={matchName} className="object-cover rounded-md" />
                  ) : null}
                  <AvatarFallback className="bg-indigo-600 text-white text-xs rounded-md">
                    {matchName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={`max-w-[75%] sm:max-w-[70%] rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 shadow-sm ${
                  m.sender === "you"
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-neutral-700 border-2 border-neutral-600 text-neutral-200 rounded-bl-sm"
                }`}
              >
                <p className="text-sm sm:text-base leading-relaxed font-medium break-words">{m.text}</p>
                <p className={`text-xs mt-1.5 opacity-70 ${m.sender === "you" ? "text-right" : "text-left"}`}>
                  {new Date(m.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>

              {/* Avatar for your messages (smaller, optional) */}
              {m.sender === "you" && (
                <Avatar className="h-8 w-8 flex-shrink-0 rounded-md">
                  <AvatarFallback className="bg-purple-600 text-white text-xs rounded-md">
                    {currentUser?.name?.charAt(0) || "Y"}
                  </AvatarFallback>
                </Avatar>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-2"
          >
            <Avatar className="h-8 w-8 flex-shrink-0 rounded-md">
              {matchAvatar ? (
                <AvatarImage src={matchAvatar} alt={matchName} className="object-cover rounded-md" />
              ) : null}
              <AvatarFallback className="bg-indigo-600 text-white text-xs rounded-md">
                {matchName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="bg-neutral-700 border-2 border-neutral-600 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
              <div className="flex gap-1">
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  className="w-2 h-2 bg-neutral-400 rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 bg-neutral-400 rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 bg-neutral-400 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={endRef} />
      </div>

      {/* Input - Fixed at bottom */}
      <div 
        className="bg-neutral-800 border-t border-neutral-700 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        {/* Message limit indicator (hidden for premium users) */}
        {remainingMessages < 5 && remainingMessages < 999 && (
          <div className="mb-2 px-2">
            <div className="flex items-center justify-between text-xs">
              <span className={`font-medium ${
                remainingMessages === 0 ? 'text-red-400' : 
                remainingMessages === 1 ? 'text-orange-400' : 
                'text-neutral-400'
              }`}>
                {remainingMessages === 0 
                  ? "Make plans to meet up" 
                  : `Chat to coordinate meeting`}
              </span>
              {remainingMessages === 0 && (
                <button
                  onClick={() => setShowMessageLimitModal(true)}
                  className="text-indigo-400 hover:text-indigo-300 underline text-xs"
                >
                  Learn more
                </button>
              )}
            </div>
          </div>
        )}
        
        <form onSubmit={onSend} className="flex gap-2 sm:gap-3 items-end">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                !canSendMsg 
                  ? "Message limit reached" 
                  : remainingMessages < 5 
                  ? `Type a message... (${remainingMessages} left)`
                  : "Type a message..."
              }
              disabled={!canSendMsg}
              className={`w-full rounded-full border-2 px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm ${
                !canSendMsg 
                  ? 'border-red-700 bg-red-900/30 text-neutral-400 cursor-not-allowed' 
                  : 'border-neutral-600 bg-neutral-700 text-neutral-200'
              }`}
            />
            {!canSendMsg && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xs text-red-400 font-medium bg-red-900/90 px-2 py-1 rounded">
                  Limit reached
                </span>
              </div>
            )}
          </div>
          <Button
            type="submit"
            disabled={!text.trim() || !canSendMsg || sending}
            className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0"
            size="icon"
            title={!canSendMsg ? "Message limit reached. Reconnect at a venue to continue chatting." : sending ? "Sending..." : ""}
          >
            {sending ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.div>
            ) : (
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </Button>
        </form>
        
        {/* Helpful tip */}
        {remainingMessages > 0 && remainingMessages < 5 && (
          <p className="text-xs text-neutral-400 mt-2 px-2 text-center">
            💡 Tip: Focus on meeting up in person rather than long conversations
          </p>
        )}
      </div>
      
      {/* Message Limit Modal */}
      <MessageLimitModal
        open={showMessageLimitModal}
        onClose={() => setShowMessageLimitModal(false)}
        remainingMessages={remainingMessages}
      />

      {/* Block/Report Dialogs */}
      {otherUserId && (
        <>
          <BlockReportDialog
            userId={otherUserId}
            userName={matchName}
            open={showBlockDialog}
            onClose={() => setShowBlockDialog(false)}
            type="block"
          />
          <BlockReportDialog
            userId={otherUserId}
            userName={matchName}
            open={showReportDialog}
            onClose={() => setShowReportDialog(false)}
            type="report"
          />
        </>
      )}
          </div>
        </div>
      );
}
