import React, { useEffect, useRef, useState, useCallback } from "react";
import { useKeyboardHeight } from "@/hooks/useKeyboardHeight";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, MoreVertical, RefreshCw, ChevronDown, Loader2 } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BlockReportDialog } from "@/components/BlockReportDialog";

import { getAllMatches } from "@/lib/matchesCompat";
import { rematchUsers } from "@/services/firebase/matchService";
import {
  subscribeToMessages,
  sendMessage as firebaseSendMessage,
  canSendMessage as firebaseCanSendMessage,
  getRemainingMessages as firebaseGetRemaining,
  markMessagesAsRead,
  loadOlderMessages,
  setTypingStatus,
  subscribeToTypingStatus,
  type Message,
} from "@/services/messageService";
import MessageLimitModal from "@/components/ui/MessageLimitModal";
import { useToast } from "@/hooks/use-toast";
import { NetworkErrorBanner } from "@/components/ui/NetworkErrorBanner";
import { isNetworkError } from "@/utils/retry";
import { hapticLight } from "@/lib/haptics";
import { logError } from "@/utils/errorHandler";

type Msg = { sender: "you" | "them"; text: string; ts: number; id?: string };

export default function ChatRoom() {
  const { id } = useParams<{ id: string }>();
  const matchId = id;
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [olderMsgs, setOlderMsgs] = useState<Msg[]>([]);
  const [hasOlderMessages, setHasOlderMessages] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [matchName, setMatchName] = useState<string>("Chat");
  const [matchAvatar, setMatchAvatar] = useState<string>("");
  const [matchExpiresAt, setMatchExpiresAt] = useState<number>(0);
  const [otherUserId, setOtherUserId] = useState<string>("");
  const endRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [showMessageLimitModal, setShowMessageLimitModal] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState(10);
  const [canSendMsg, setCanSendMsg] = useState(true);
  const [sendError, setSendError] = useState<Error | null>(null);
  const [sending, setSending] = useState(false);
  const [isMatchExpired, setIsMatchExpired] = useState(false);
  const [matchVenueId, setMatchVenueId] = useState<string>("");
  const [rematching, setRematching] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const { toast } = useToast();
  const keyboardHeight = useKeyboardHeight();
  const prefersReducedMotion = useReducedMotion();

  const markReadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const isNearBottomRef = useRef(true);

  // Pull-to-refresh state
  const pullStartY = useRef<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const allMessages = (() => {
    const combined = [...olderMsgs, ...msgs];
    const seen = new Set<string>();
    return combined.filter(m => {
      if (!m.id || m.id.startsWith('optimistic-')) return true;
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  })();

  const isNearBottom = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 150;
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    endRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  const handleScroll = useCallback(() => {
    const near = isNearBottom();
    isNearBottomRef.current = near;
    setShowScrollButton(!near);
  }, [isNearBottom]);

  // Debounced markMessagesAsRead
  const debouncedMarkRead = useCallback((mId: string, uid: string) => {
    if (markReadTimerRef.current) clearTimeout(markReadTimerRef.current);
    markReadTimerRef.current = setTimeout(() => {
      markMessagesAsRead(mId, uid).catch(() => {});
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (markReadTimerRef.current) clearTimeout(markReadTimerRef.current);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, []);

  // Load match info
  useEffect(() => {
    const loadMatchInfo = async () => {
      if (!matchId || !currentUser?.uid) return;
      try {
        const matches = await getAllMatches(currentUser.uid);
        const match = matches.find(m => m.id === matchId);
        if (match) {
          setMatchName(match.displayName || "Chat");
          setMatchAvatar(match.avatarUrl || "");
          setMatchExpiresAt(match.expiresAt || 0);
          setOtherUserId(match.partnerId || "");
          setMatchVenueId(match.venueId || "");
          setIsMatchExpired(match.expiresAt < Date.now());
        }
      } catch (error) {
        logError(error as Error, { context: 'ChatRoom.loadMatchInfo', matchId });
      }
    };
    loadMatchInfo();
  }, [matchId, currentUser?.uid]);

  // Real-time Firestore message listener (latest 50)
  useEffect(() => {
    if (!matchId || !currentUser?.uid) return;

    debouncedMarkRead(matchId, currentUser.uid);

    const unsubscribe = subscribeToMessages(matchId, (firebaseMessages: Message[]) => {
      const mapped: Msg[] = firebaseMessages.map(m => ({
        id: m.id,
        sender: m.senderId === currentUser.uid ? "you" as const : "them" as const,
        text: m.text,
        ts: m.createdAt?.getTime?.() || Date.now(),
      }));
      setMsgs(mapped);

      if (firebaseMessages.some(m => !m.readBy?.includes(currentUser.uid) && m.senderId !== currentUser.uid)) {
        debouncedMarkRead(matchId, currentUser.uid);
      }
    }, 50);

    return () => unsubscribe();
  }, [matchId, currentUser?.uid, debouncedMarkRead]);

  // Typing indicator subscription
  useEffect(() => {
    if (!matchId || !currentUser?.uid) return;
    const unsub = subscribeToTypingStatus(matchId, currentUser.uid, (typingUid) => {
      setOtherUserTyping(!!typingUid);
    });
    return unsub;
  }, [matchId, currentUser?.uid]);

  // Clear typing status on unmount
  useEffect(() => {
    return () => {
      if (matchId && currentUser?.uid) {
        setTypingStatus(matchId, currentUser.uid, false);
      }
    };
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

  // Smart auto-scroll: only when near bottom or own message
  useEffect(() => {
    if (msgs.length === 0) return;
    const lastMsg = msgs[msgs.length - 1];
    if (isNearBottomRef.current || lastMsg?.sender === "you") {
      scrollToBottom();
    }
  }, [msgs, scrollToBottom]);

  useEffect(() => {
    if (keyboardHeight > 0 && isNearBottomRef.current) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [keyboardHeight, scrollToBottom]);

  // Load older messages
  const handleLoadOlder = useCallback(async () => {
    if (!matchId || loadingOlder || !hasOlderMessages) return;
    setLoadingOlder(true);

    const firstMsg = olderMsgs.length > 0 ? olderMsgs[0] : msgs[0];
    if (!firstMsg) { setLoadingOlder(false); return; }

    const scrollEl = scrollContainerRef.current;
    const prevScrollHeight = scrollEl?.scrollHeight || 0;

    try {
      const older = await loadOlderMessages(matchId, new Date(firstMsg.ts), 30);
      if (older.length === 0) {
        setHasOlderMessages(false);
      } else {
        const mapped: Msg[] = older.map(m => ({
          id: m.id,
          sender: m.senderId === currentUser?.uid ? "you" as const : "them" as const,
          text: m.text,
          ts: m.createdAt?.getTime?.() || Date.now(),
        }));
        setOlderMsgs(prev => [...mapped, ...prev]);

        requestAnimationFrame(() => {
          if (scrollEl) {
            scrollEl.scrollTop = scrollEl.scrollHeight - prevScrollHeight;
          }
        });
      }
    } catch (error) {
      logError(error as Error, { context: 'ChatRoom.loadOlder', matchId });
    } finally {
      setLoadingOlder(false);
    }
  }, [matchId, loadingOlder, hasOlderMessages, olderMsgs, msgs, currentUser?.uid]);

  // Typing handler
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (!matchId || !currentUser?.uid) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      setTypingStatus(matchId, currentUser.uid, true);
    }
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      setTypingStatus(matchId, currentUser.uid, false);
    }, 3000);
  }, [matchId, currentUser?.uid]);

  // Keyboard dismiss on tap
  const handleMessagesAreaClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'BUTTON' || target.closest('button')) return;
    inputRef.current?.blur();
  }, []);

  // Pull-to-refresh handlers
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const el = scrollContainerRef.current;
    if (el && el.scrollTop <= 0) {
      pullStartY.current = e.touches[0].clientY;
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (pullStartY.current === null) return;
    const diff = e.touches[0].clientY - pullStartY.current;
    if (diff > 0) {
      setPullDistance(Math.min(diff * 0.5, 80));
    }
  }, []);

  const onTouchEnd = useCallback(async () => {
    if (pullDistance > 50) {
      setIsRefreshing(true);
      hapticLight();
      try {
        if (matchId && currentUser?.uid) {
          const matches = await getAllMatches(currentUser.uid);
          const match = matches.find(m => m.id === matchId);
          if (match) {
            setMatchName(match.displayName || "Chat");
            setMatchAvatar(match.avatarUrl || "");
            setMatchExpiresAt(match.expiresAt || 0);
            setIsMatchExpired(match.expiresAt < Date.now());
          }
        }
      } catch (error) {
        logError(error as Error, { context: 'ChatRoom.pullRefresh' });
      } finally {
        setIsRefreshing(false);
      }
    }
    pullStartY.current = null;
    setPullDistance(0);
  }, [pullDistance, matchId, currentUser?.uid]);

  if (!matchId) {
    return (
      <div className="min-h-[100dvh] bg-neutral-900 p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-neutral-800 rounded-2xl shadow-lg p-6 text-center">
          <p className="text-neutral-300">Chat not found.</p>
          <Button 
            onClick={() => navigate(-1)} 
            className="mt-4 bg-gradient-to-r from-violet-600 to-violet-600 hover:from-violet-700 hover:to-violet-700 text-white"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const handleRematch = async () => {
    if (!currentUser?.uid || !otherUserId || !matchVenueId || rematching) return;
    setRematching(true);
    try {
      const newMatchId = await rematchUsers(currentUser.uid, otherUserId, matchVenueId);
      navigate(`/chat/${newMatchId}`, { replace: true });
    } catch (error) {
      logError(error as Error, { context: 'ChatRoom.handleRematch' });
      toast({ title: "Couldn't rematch", description: "Something went wrong. Try again.", variant: "destructive" });
    } finally {
      setRematching(false);
    }
  };

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || !matchId || !currentUser?.uid || sending) return;
    
    hapticLight();
    setSendError(null);
    setSending(true);
    setText("");

    if (matchId && currentUser.uid) {
      setTypingStatus(matchId, currentUser.uid, false);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    }

    const optimisticMsg: Msg = { id: `optimistic-${Date.now()}`, sender: "you", text: t, ts: Date.now() };
    setMsgs(prev => [...prev, optimisticMsg]);
    
    try {
      await firebaseSendMessage(matchId, currentUser.uid, t);
      inputRef.current?.focus();
    } catch (error) {
      logError(error as Error, { context: 'ChatRoom.onSend', matchId, userId: currentUser.uid });
      const errorObj = error instanceof Error ? error : new Error('Failed to send message');
      setSendError(errorObj);
      setText(t);
      setMsgs(prev => prev.filter(m => m.id !== optimisticMsg.id));
      
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
    <div
      className="fixed top-0 left-0 right-0 flex flex-col bg-neutral-900 z-50"
      style={{ bottom: keyboardHeight > 0 ? `${keyboardHeight}px` : '0px', transition: 'bottom 0.25s ease-out' }}
    >
      <div className="max-w-lg mx-auto w-full h-full flex flex-col bg-neutral-900">
        <NetworkErrorBanner error={sendError} onRetry={() => onSend(new Event('submit') as any)} />

        {/* Header */}
        <div 
          className={`bg-neutral-900 border-b border-neutral-800 px-4 flex items-center gap-3 flex-shrink-0 transition-all duration-200 ${keyboardHeight > 0 ? 'py-2' : 'py-3.5'}`}
          style={{ paddingTop: keyboardHeight > 0 ? undefined : 'max(0.875rem, env(safe-area-inset-top, 0px))' }}
        >
          <Button variant="ghost" size="icon" onClick={() => navigate('/matches')} className="rounded-full text-violet-400 hover:text-violet-300 hover:bg-violet-900/30 -ml-1">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Avatar className={`rounded-xl transition-all duration-200 ${keyboardHeight > 0 ? 'h-10 w-10' : 'h-14 w-14'}`}>
            {matchAvatar ? (
              <AvatarImage src={matchAvatar} alt={matchName} className="object-cover rounded-xl" />
            ) : null}
            <AvatarFallback className="bg-violet-600 text-white text-lg font-semibold rounded-xl">
              {matchName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-white text-lg truncate">{matchName}</h2>
              {isMatchExpired && (
                <span className="flex-shrink-0 px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white uppercase">
                  Expired
                </span>
              )}
            </div>
            {keyboardHeight === 0 && !isMatchExpired && matchExpiresAt && getRemainingTime() ? (
              <p className="text-sm text-neutral-400">
                {otherUserTyping ? (
                  <span className="text-violet-400">typing...</span>
                ) : (
                  `${getRemainingTime()} left`
                )}
              </p>
            ) : otherUserTyping && keyboardHeight === 0 ? (
              <p className="text-sm text-violet-400">typing...</p>
            ) : null}
          </div>
          {otherUserId && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(prev => !prev)}
                className="rounded-full text-neutral-400 hover:text-white h-10 w-10 flex items-center justify-center transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-[9998]" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 z-[9999] min-w-[200px] bg-neutral-800 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden">
                    <button
                      onClick={() => { setShowMenu(false); navigate(`/profile/${otherUserId}`); }}
                      className="w-full text-left px-4 py-3.5 text-base text-neutral-200 hover:bg-neutral-700 active:bg-neutral-700 transition-colors"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => { setShowMenu(false); setShowBlockDialog(true); }}
                      className="w-full text-left px-4 py-3.5 text-base text-red-400 hover:bg-neutral-700 active:bg-neutral-700 transition-colors"
                    >
                      Block User
                    </button>
                    <button
                      onClick={() => { setShowMenu(false); setShowReportDialog(true); }}
                      className="w-full text-left px-4 py-3.5 text-base text-neutral-300 hover:bg-neutral-700 active:bg-neutral-700 transition-colors"
                    >
                      Report
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Messages */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto scroll-ios px-4 sm:px-6 py-4 sm:py-6 space-y-4 bg-neutral-900 relative"
          aria-live="polite"
          onClick={handleMessagesAreaClick}
          onScroll={handleScroll}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Pull-to-refresh indicator */}
          {(pullDistance > 0 || isRefreshing) && (
            <div
              className="flex items-center justify-center overflow-hidden transition-all"
              style={{ height: isRefreshing ? 40 : pullDistance }}
            >
              <RefreshCw className={`w-5 h-5 text-violet-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </div>
          )}

          {/* Load older messages button */}
          {hasOlderMessages && allMessages.length >= 50 && (
            <div className="flex justify-center pb-2">
              <button
                onClick={handleLoadOlder}
                disabled={loadingOlder}
                className="text-sm text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800/60"
              >
                {loadingOlder ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : null}
                {loadingOlder ? 'Loading...' : 'Load earlier messages'}
              </button>
            </div>
          )}

          <AnimatePresence>
            {allMessages.map((m, i) => (
              <motion.div
                key={m.id || `msg-${i}`}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
                className={`flex ${m.sender === "you" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-3.5 ${
                    m.sender === "you"
                      ? "bg-violet-600 text-white rounded-br-md"
                      : "bg-neutral-800 text-neutral-200 rounded-bl-md"
                  }`}
                >
                  <p className="text-[17px] leading-relaxed break-words">{m.text}</p>
                  <p className={`text-xs mt-1 ${m.sender === "you" ? "text-violet-200/60 text-right" : "text-neutral-400"}`}>
                    {new Date(m.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator bubble */}
          {otherUserTyping && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="bg-neutral-800 rounded-2xl rounded-bl-md px-5 py-3.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}

          <div ref={endRef} />
        </div>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            onClick={() => scrollToBottom()}
            className="absolute bottom-28 right-6 z-10 bg-violet-600 hover:bg-violet-700 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-all"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        )}

        {/* Input */}
        <div
          className="bg-neutral-900 border-t border-neutral-800 px-4 py-3 flex-shrink-0"
          style={{ paddingBottom: keyboardHeight > 0 ? '0.5rem' : 'max(1rem, env(safe-area-inset-bottom, 0px))' }}
        >
          {isMatchExpired ? (
            <div className="text-center py-2 space-y-3">
              <p className="text-neutral-400 text-base">This match has expired</p>
              <Button
                onClick={handleRematch}
                disabled={rematching}
                className="w-full py-5 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white font-semibold rounded-xl text-base"
              >
                {rematching ? (
                  <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                ) : null}
                {rematching ? 'Rematching...' : 'Re-match'}
              </Button>
            </div>
          ) : (
            <>
              {remainingMessages === 0 && (
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-neutral-400">Message limit reached</span>
                  <button
                    onClick={() => setShowMessageLimitModal(true)}
                    className="text-violet-400 text-sm font-medium"
                  >
                    Options
                  </button>
                </div>
              )}

              <form onSubmit={onSend} className="flex gap-3 items-end">
                <div className="flex-1">
                  <input
                    ref={inputRef}
                    value={text}
                    onChange={handleTextChange}
                    enterKeyHint="send"
                    autoComplete="off"
                    autoCorrect="on"
                    placeholder={
                      !canSendMsg
                        ? "Message limit reached"
                        : "Type a message..."
                    }
                    disabled={!canSendMsg}
                    className={`w-full rounded-full px-6 py-3 text-lg focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                      !canSendMsg
                        ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed'
                        : 'bg-neutral-800 text-white placeholder:text-neutral-400'
                    }`}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!text.trim() || !canSendMsg || sending}
                  className="rounded-full bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-30 h-14 w-14 flex-shrink-0"
                  size="icon"
                >
                  <Send className="w-6 h-6" />
                </Button>
              </form>
            </>
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
