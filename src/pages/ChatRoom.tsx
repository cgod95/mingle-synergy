import React, { useEffect, useMemo, useRef, useState } from "react";
import { useKeyboardHeight } from "@/hooks/useKeyboardHeight";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, MoreVertical, Sparkles } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BlockReportDialog } from "@/components/BlockReportDialog";

import { getActiveMatches } from "@/lib/matchesCompat";
import { subscribeToMessages, sendMessage as firebaseSendMessage, canSendMessage as firebaseCanSendMessage, getRemainingMessages as firebaseGetRemaining, markMessagesAsRead, type Message } from "@/services/messageService";
import MessageLimitModal from "@/components/ui/MessageLimitModal";
import { useToast } from "@/hooks/use-toast";
import { NetworkErrorBanner } from "@/components/ui/NetworkErrorBanner";
import { isNetworkError } from "@/utils/retry";
import { hapticLight } from "@/lib/haptics";
import { logError } from "@/utils/errorHandler";
import { FEATURE_FLAGS } from "@/lib/flags";

const CONVERSATION_STARTERS = [
  "What brings you here tonight?",
  "Have you been to this venue before?",
  "What do you think of the vibe here?",
  "Are you here with friends?",
  "What's your favorite spot in this place?",
  "How's your night going?",
  "What do you think of the music?",
];

type Msg = { sender: "you" | "them"; text: string; ts: number; id?: string };

export default function ChatRoom() {
  const { id } = useParams<{ id: string }>();
  const matchId = id;
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [matchName, setMatchName] = useState<string>("Chat");
  const [matchAvatar, setMatchAvatar] = useState<string>("");
  const [matchExpiresAt, setMatchExpiresAt] = useState<number>(0);
  const [otherUserId, setOtherUserId] = useState<string>("");
  const [showStarters, setShowStarters] = useState(false);
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
  const keyboardHeight = useKeyboardHeight();
  const prefersReducedMotion = useReducedMotion();

  // Load match info (partner name, avatar, expiry)
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
          setOtherUserId(match.partnerId || "");
          if (msgs.length === 0) {
            setShowStarters(true);
          }
        }
      } catch (error) {
        logError(error as Error, { context: 'ChatRoom.loadMatchInfo', matchId });
      }
    };
    loadMatchInfo();
  }, [matchId, currentUser?.uid]);

  // Real-time Firestore message listener
  useEffect(() => {
    if (!matchId || !currentUser?.uid) return;

    // Mark messages as read when entering the chat
    markMessagesAsRead(matchId, currentUser.uid).catch(() => {});

    const unsubscribe = subscribeToMessages(matchId, (firebaseMessages: Message[]) => {
      const mapped: Msg[] = firebaseMessages.map(m => ({
        id: m.id,
        sender: m.senderId === currentUser.uid ? "you" as const : "them" as const,
        text: m.text,
        ts: m.createdAt?.getTime?.() || Date.now(),
      }));
      setMsgs(mapped);
      if (mapped.length === 0) {
        setShowStarters(true);
      }
      // Mark new messages as read as they arrive
      if (firebaseMessages.some(m => m.senderId !== currentUser.uid)) {
        markMessagesAsRead(matchId, currentUser.uid).catch(() => {});
      }
    });

    return () => unsubscribe();
  }, [matchId, currentUser?.uid]);

  // Update message limits
  useEffect(() => {
    if (!matchId || !currentUser?.uid) return;
    const updateLimits = async () => {
      const remaining = await firebaseGetRemaining(matchId, currentUser.uid);
      const canSend = await firebaseCanSendMessage(matchId, currentUser.uid);
      setRemainingMessages(remaining);
      setCanSendMsg(canSend);
      if (!canSend && remaining === 0) {
        setShowMessageLimitModal(true);
      }
    };
    updateLimits();
  }, [matchId, currentUser?.uid, msgs.length]);

  const getRemainingTime = () => {
    if (!matchExpiresAt) return null;
    const remaining = matchExpiresAt - Date.now();
    if (remaining <= 0) return null;
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs]);

  useEffect(() => {
    if (keyboardHeight > 0) {
      setTimeout(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 100);
    }
  }, [keyboardHeight]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  if (!matchId) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-neutral-900 p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-neutral-800 rounded-2xl shadow-lg p-6 text-center">
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
    
    hapticLight();
    setSendError(null);
    setSending(true);
    setText("");
    
    try {
      await firebaseSendMessage(matchId, currentUser.uid, t);
      setShowStarters(false);
      inputRef.current?.focus();
    } catch (error) {
      logError(error as Error, { context: 'ChatRoom.onSend', matchId, userId: currentUser.uid });
      const errorObj = error instanceof Error ? error : new Error('Failed to send message');
      setSendError(errorObj);
      setText(t); // Restore text on failure
      
      if (errorObj.message.includes('limit')) {
        setShowMessageLimitModal(true);
      }
      
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
    <div className="fixed inset-0 flex flex-col bg-neutral-900 z-50">
      {/* Capacitor Keyboard plugin with resize:'native' already shrinks the
          WebView when the keyboard opens — no manual bottom offset needed. */}
      <div className="max-w-lg mx-auto w-full h-full flex flex-col bg-neutral-900">
        <NetworkErrorBanner error={sendError} onRetry={() => onSend(new Event('submit') as any)} />

        {/* Header — single clean bar */}
        <div 
          className="bg-neutral-900 px-3 py-2.5 flex items-center gap-3 flex-shrink-0"
          style={{ paddingTop: 'max(0.625rem, env(safe-area-inset-top, 0px))' }}
        >
          <Button variant="ghost" size="icon" onClick={() => navigate('/matches')} className="rounded-full text-neutral-300 hover:text-white -ml-1">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Avatar className="h-9 w-9 rounded-full">
            {matchAvatar ? (
              <AvatarImage src={matchAvatar} alt={matchName} className="object-cover rounded-full" />
            ) : null}
            <AvatarFallback className="bg-indigo-600 text-white text-sm rounded-full">
              {matchName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-white text-sm truncate">{matchName}</h2>
            {matchExpiresAt && getRemainingTime() && (
              <p className="text-xs text-neutral-400">
                {getRemainingTime()} left
              </p>
            )}
          </div>
          {otherUserId && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full text-neutral-400 hover:text-white">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-neutral-800 border-neutral-700">
                <DropdownMenuItem 
                  onClick={() => navigate(`/profile/${otherUserId}`)}
                  className="text-neutral-200 focus:bg-neutral-700"
                >
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowBlockDialog(true)}
                  className="text-red-400 focus:bg-neutral-700"
                >
                  Block User
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowReportDialog(true)}
                  className="text-neutral-300 focus:bg-neutral-700"
                >
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scroll-ios px-4 sm:px-6 py-4 sm:py-6 space-y-3 bg-neutral-900" aria-live="polite">
          {/* How Mingle Works Info Banner */}
          {msgs.length <= 1 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-indigo-900/30 rounded-xl p-3"
            >
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-neutral-200 mb-1">You have {typeof FEATURE_FLAGS.LIMIT_MESSAGES_PER_USER === 'number' && FEATURE_FLAGS.LIMIT_MESSAGES_PER_USER > 0 ? FEATURE_FLAGS.LIMIT_MESSAGES_PER_USER : 5} messages to make plans</p>
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
              <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-hide">
                {CONVERSATION_STARTERS.slice(0, 4).map((starter, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                      if (!currentUser?.uid || !matchId || sending) return;
                      setShowStarters(false);
                      setSending(true);
                      try {
                        await firebaseSendMessage(matchId, currentUser.uid, starter);
                      } catch (error) {
                        logError(error as Error, { context: 'ChatRoom.conversationStarter', matchId });
                        setText(starter);
                      } finally {
                        setSending(false);
                      }
                    }}
                    className="px-4 py-2 text-sm bg-neutral-800 rounded-full text-neutral-200 hover:bg-indigo-900/30 transition-all whitespace-nowrap flex-shrink-0 snap-start"
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
                key={m.id || i}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
                className={`flex ${m.sender === "you" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    m.sender === "you"
                      ? "bg-indigo-600 text-white rounded-br-md"
                      : "bg-neutral-800 text-neutral-200 rounded-bl-md"
                  }`}
                >
                  <p className="text-[15px] leading-relaxed break-words">{m.text}</p>
                  <p className={`text-[11px] mt-1 ${m.sender === "you" ? "text-indigo-200/60 text-right" : "text-neutral-400"}`}>
                    {new Date(m.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div ref={endRef} />
        </div>

        {/* Input */}
        <div
          className="bg-neutral-900 px-4 py-3 flex-shrink-0"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
        >
          {/* Message limit indicator */}
          {remainingMessages === 0 && (
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-neutral-500">Message limit reached</span>
              <button
                onClick={() => setShowMessageLimitModal(true)}
                className="text-indigo-400 text-xs font-medium"
              >
                Options
              </button>
            </div>
          )}

          <form onSubmit={onSend} className="flex gap-2 items-end">
            <div className="flex-1">
              <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  !canSendMsg
                    ? "Message limit reached"
                    : "Type a message..."
                }
                disabled={!canSendMsg}
                className={`w-full rounded-full px-4 py-2.5 text-[15px] focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                  !canSendMsg
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : 'bg-neutral-800 text-white placeholder:text-neutral-500'
                }`}
              />
            </div>
            <Button
              type="submit"
              disabled={!text.trim() || !canSendMsg || sending}
              className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-30 h-10 w-10 flex-shrink-0"
              size="icon"
            >
              <Send className="w-4 h-4" />
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
    </div>
  );
}
