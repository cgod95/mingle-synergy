import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { goBackSafely } from "@/utils/navigation";
import { ArrowLeft, Send, MoreVertical } from "lucide-react";
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
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import BottomNav from "@/components/BottomNav";


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
  // Typing indicator removed - only show when real-time typing events are implemented
  // const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showMessageLimitModal, setShowMessageLimitModal] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState(10);
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
        }
      } catch (error) {
        logError(error as Error, { context: 'ChatRoom.loadMatchInfo', matchId });
      }
    };
    loadMatchInfo();
  }, [matchId, currentUser, msgs.length]);

  // Typing indicator removed - simulated typing was confusing users
  // TODO: Re-enable when real-time typing events are implemented via Firebase/WebSocket

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
  const [otherUserId, setOtherUserId] = useState<string>("");
  
  useEffect(() => {
    const fetchOtherUserId = async () => {
      if (!matchId || !currentUser?.uid) return;
      
      try {
        if (!config.DEMO_MODE) {
          // Production: Fetch match from Firebase
          const { matchService } = await import('@/services');
          const match = await matchService.getMatchById(matchId);
          if (match) {
            const otherId = match.userId1 === currentUser.uid ? match.userId2 : match.userId1;
            setOtherUserId(otherId);
          }
        } else {
          // Demo mode: Get from matchesCompat
          const matches = await getActiveMatches(currentUser.uid);
          const match = matches.find(m => m.id === matchId);
          if (match) {
            setOtherUserId(match.partnerId || "");
          }
        }
      } catch (error) {
        logError(error as Error, { context: 'ChatRoom.fetchOtherUserId', matchId });
      }
    };
    
    fetchOtherUserId();
  }, [matchId, currentUser?.uid]);

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
    return <LoadingSpinner variant="fullscreen" message="Loading chat..." />;
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
          description: "You've sent all 10 messages. Wait for a reply or reconnect at a venue.",
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
        });
      }
      
      setText("");
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

      return (
        <div 
          className="fixed inset-0 flex flex-col bg-[#0a0a0f] z-40 pb-16"
          style={{ height: '100dvh', minHeight: '-webkit-fill-available' }}
        >
          <div className="max-w-4xl mx-auto w-full h-full flex flex-col bg-neutral-800 shadow-xl overflow-hidden">
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
          onClick={() => goBackSafely(navigate, '/matches')}
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
            <DropdownMenuContent align="end" className="bg-neutral-800 border-neutral-700">
              <DropdownMenuItem onClick={() => setShowBlockDialog(true)} className="hover:bg-neutral-700 focus:bg-neutral-700">
                <span className="text-red-500">Block User</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowReportDialog(true)} className="hover:bg-neutral-700 focus:bg-neutral-700 text-neutral-200">
                <span>Report User</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Countdown Banner - Outside chat scroll area */}
      {matchExpiresAt && (
        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-t border-b border-indigo-500/30 px-4 py-2 flex-shrink-0">
          <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
            <span className="text-sm text-neutral-200">
              You have {remainingMessages} message{remainingMessages !== 1 ? 's' : ''} to make something happen
            </span>
            <span className="text-sm font-medium text-indigo-400">
              {getRemainingTime()} left
            </span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-3 bg-[#0a0a0f]">

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
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Typing Indicator - Removed (was showing randomly, confusing users)
            TODO: Re-enable when real-time typing events are implemented via Firebase/WebSocket */}
        
        <div ref={endRef} />
      </div>

      {/* Input - Fixed at bottom with safe area handling */}
      <div 
        className="bg-neutral-800 border-t border-neutral-700 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0"
        style={{ 
          paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
          WebkitTransform: 'translateZ(0)', // Force GPU layer for iOS
          transform: 'translateZ(0)'
        }}
      >
        {/* Message limit indicator (hidden for premium users) */}
        
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
          {/* Bottom Navigation */}
          <BottomNav />
        </div>
      );
}
