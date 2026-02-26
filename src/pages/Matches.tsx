import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MapPin, ChevronDown, RefreshCw, Trash2, CheckCircle, MessageCircle, Undo2, Loader2 } from "lucide-react";
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from "framer-motion";
import { getAllMatches, getRemainingSeconds, isExpired, type Match } from "@/lib/matchesCompat";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { firestore } from "@/firebase/config";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import ErrorBoundary from "@/components/ErrorBoundary";
import { MatchListSkeleton } from "@/components/ui/LoadingStates";
import { EmptyState } from "@/components/ui/EmptyState";
import { logError } from "@/utils/errorHandler";
import { hapticLight, hapticMedium } from "@/lib/haptics";
import { subscribeToUnreadCounts, type UnreadCounts } from "@/features/messaging/UnreadMessageService";
import { useToast } from "@/hooks/use-toast";

type MatchWithPreview = Match & {
  lastMessage?: string;
  lastMessageTime?: number;
  isNew?: boolean;
};

export default function Matches() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [matches, setMatches] = useState<MatchWithPreview[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [unreadExpanded, setUnreadExpanded] = useState(true);
  const [readExpanded, setReadExpanded] = useState(true);
  const [expiredExpanded, setExpiredExpanded] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('mingle_dismissed_matches');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [acceptingRematchId, setAcceptingRematchId] = useState<string | null>(null);
  const [requestingRematchId, setRequestingRematchId] = useState<string | null>(null);

  const handleAcceptRematch = useCallback(async (matchId: string) => {
    if (!currentUser?.uid) return;
    setAcceptingRematchId(matchId);
    try {
      const { matchService } = await import("@/services");
      await matchService.requestReconnect(matchId, currentUser.uid);
      await fetchMatches(true);
      toast({ title: "You're back in touch!", description: "Open your new chat from the list." });
    } catch (error) {
      logError(error as Error, { context: "Matches.handleAcceptRematch", matchId });
      toast({ title: "Couldn't accept rematch", description: "Please try again.", variant: "destructive" });
    } finally {
      setAcceptingRematchId(null);
    }
  }, [currentUser?.uid, fetchMatches, toast]);

  const handleRequestRematch = useCallback(async (matchId: string) => {
    if (!currentUser?.uid) return;
    setRequestingRematchId(matchId);
    try {
      const { matchService } = await import("@/services");
      await matchService.requestReconnect(matchId, currentUser.uid);
      await fetchMatches(true);
      toast({ title: "Rematch requested", description: "They'll see it in Matches. If they accept, you'll get a new chat." });
    } catch (error) {
      logError(error as Error, { context: "Matches.handleRequestRematch", matchId });
      toast({ title: "Couldn't request rematch", description: "Please try again.", variant: "destructive" });
    } finally {
      setRequestingRematchId(null);
    }
  }, [currentUser?.uid, fetchMatches, toast]);

  const persistDismissed = useCallback((ids: Set<string>) => {
    localStorage.setItem('mingle_dismissed_matches', JSON.stringify([...ids]));
  }, []);

  const dismissMatch = useCallback((matchId: string) => {
    hapticMedium();
    setDismissedIds(prev => new Set(prev).add(matchId));

    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);

    toast({
      title: "Match dismissed",
      description: "Tap undo to restore",
      action: (
        <button
          onClick={() => {
            if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
            setDismissedIds(prev => {
              const next = new Set(prev);
              next.delete(matchId);
              persistDismissed(next);
              return next;
            });
          }}
          className="flex items-center gap-1 text-violet-400 font-semibold text-sm"
        >
          <Undo2 className="w-4 h-4" /> Undo
        </button>
      ),
    });

    undoTimerRef.current = setTimeout(() => {
      setDismissedIds(prev => {
        persistDismissed(prev);
        return prev;
      });
    }, 5000);
  }, [toast, persistDismissed]);

  const pullStartY = useRef<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Subscribe to real-time unread counts
  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsub = subscribeToUnreadCounts(currentUser.uid, (counts) => {
      setUnreadCounts(counts);
    });
    return unsub;
  }, [currentUser?.uid]);

  const fetchMatches = useCallback(async (silent = false) => {
    if (!currentUser?.uid) {
      setIsLoading(false);
      return;
    }

    if (!silent) setIsLoading(true);
    try {
      const allMatches = await getAllMatches(currentUser.uid);
      const enrichedMatches: MatchWithPreview[] = await Promise.all(
        allMatches.map(async (match) => {
          let lastMsg: { text: string; ts: number } | null = null;
          if (firestore) {
            try {
              const snap = await getDocs(
                query(
                  collection(firestore, 'messages'),
                  where('matchId', '==', match.id),
                  orderBy('createdAt', 'desc'),
                  limit(1)
                )
              );
              if (!snap.empty) {
                const d = snap.docs[0].data();
                lastMsg = {
                  text: d.text || '',
                  ts: d.createdAt?.toDate?.()?.getTime?.() || Date.now(),
                };
              }
            } catch {
              try {
                const fallbackSnap = await getDocs(
                  query(
                    collection(firestore, 'messages'),
                    where('matchId', '==', match.id)
                  )
                );
                if (!fallbackSnap.empty) {
                  let latest: { text: string; ts: number } | null = null;
                  fallbackSnap.docs.forEach(doc => {
                    const d = doc.data();
                    const ts = d.createdAt?.toDate?.()?.getTime?.() || 0;
                    if (!latest || ts > latest.ts) {
                      latest = { text: d.text || '', ts };
                    }
                  });
                  lastMsg = latest;
                }
              } catch (fallbackErr) {
                console.error('[Matches] fallback query also failed for', match.id, fallbackErr);
              }
            }
          }
          const now = Date.now();
          const isNew = !lastMsg && (now - match.createdAt < 60 * 60 * 1000);
          return {
            ...match,
            lastMessage: lastMsg?.text,
            lastMessageTime: lastMsg?.ts,
            isNew,
          };
        })
      );

      enrichedMatches.sort((a, b) => {
        if (a.lastMessageTime && b.lastMessageTime) return b.lastMessageTime - a.lastMessageTime;
        if (a.lastMessageTime) return -1;
        if (b.lastMessageTime) return 1;
        return a.expiresAt - b.expiresAt;
      });

      setMatches(enrichedMatches);
    } catch (error) {
      logError(error as Error, { context: 'Matches.fetchMatches', userId: currentUser?.uid || 'unknown' });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(() => fetchMatches(true), 30000);
    return () => clearInterval(interval);
  }, [fetchMatches]);

  const handlePullRefresh = useCallback(async () => {
    setIsRefreshing(true);
    hapticLight();
    await fetchMatches(true);
  }, [fetchMatches]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.scrollTop <= 0) {
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

  const onTouchEnd = useCallback(() => {
    if (pullDistance > 50) {
      handlePullRefresh();
    }
    pullStartY.current = null;
    setPullDistance(0);
  }, [pullDistance, handlePullRefresh]);

  const formatRemainingTime = (expiresAt: number): string => {
    const remaining = getRemainingSeconds({ expiresAt } as Match);
    if (remaining === 0) return "Expired";
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleMatchClick = (matchId: string) => {
    hapticLight();
    navigate(`/chat/${matchId}`);
  };

  const activeNonDismissed = matches.filter(m => !isExpired(m) && !dismissedIds.has(m.id));
  const expiredMatchesList = matches.filter(m => isExpired(m));

  const unreadMatches = activeNonDismissed.filter(m => (unreadCounts[m.id] || 0) > 0);
  const readMatches = activeNonDismissed.filter(m => (unreadCounts[m.id] || 0) === 0);

  const MatchRow = ({
    match,
    expired = false,
    onAcceptRematch,
    onRequestRematch,
    acceptingRematchId,
    requestingRematchId,
  }: {
    match: MatchWithPreview;
    expired?: boolean;
    onAcceptRematch?: (matchId: string) => void;
    onRequestRematch?: (matchId: string) => void;
    acceptingRematchId?: string | null;
    requestingRematchId?: string | null;
  }) => {
    const remainingTime = formatRemainingTime(match.expiresAt);
    const remainingSeconds = getRemainingSeconds(match);
    const isUrgent = remainingSeconds < 30 * 60 && !expired;
    const matchUnread = !expired && (unreadCounts[match.id] || 0) > 0;
    const otherWantsRematch = expired && match.otherUserRequestedReconnect;
    const iRequestedRematch = expired && match.iRequestedReconnect;
    const canRequestRematch = expired && !match.iRequestedReconnect;
    const isAccepting = acceptingRematchId === match.id;
    const isRequesting = requestingRematchId === match.id;

    const rowContent = (
      <>
        <div className="relative flex-shrink-0">
          <div className="h-14 w-14 rounded-xl overflow-hidden bg-neutral-700">
            {match.avatarUrl ? (
              <img src={match.avatarUrl} alt={match.displayName || "Match"} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-violet-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">{(match.displayName || "M").charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between mb-0.5">
            <h3 className={`truncate text-base ${
              matchUnread ? 'font-bold text-white' : expired ? 'font-semibold text-neutral-400' : 'font-semibold text-neutral-200'
            }`}>
              {match.displayName || "Match"}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <span className={`text-sm ${
                expired ? 'text-red-400 font-medium' : isUrgent ? 'text-orange-400' : 'text-neutral-400'
              }`}>
                {expired ? 'Expired' : remainingTime}
              </span>
              {matchUnread && (
                <div className="w-2.5 h-2.5 rounded-full bg-violet-500 flex-shrink-0" />
              )}
            </div>
          </div>

          {expired && otherWantsRematch ? (
            <p className="text-sm text-violet-300 mt-0.5">
              {match.displayName ? `${match.displayName} wants` : "They want"} to rematch – accept within 24 hours
            </p>
          ) : expired && iRequestedRematch ? (
            <p className="text-sm text-neutral-500 italic mt-0.5">Rematch requested – waiting for them</p>
          ) : (
            <p className={`text-base truncate ${
              match.lastMessage
                ? matchUnread
                  ? 'text-white font-semibold'
                  : expired ? 'text-neutral-500' : 'text-neutral-400'
                : expired ? 'text-neutral-500 italic' : 'text-neutral-400 italic'
            }`}>
              {match.lastMessage || "Say hello..."}
            </p>
          )}

          {expired && (otherWantsRematch || canRequestRematch) && (onAcceptRematch || onRequestRematch) && (
            <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
              {otherWantsRematch && onAcceptRematch && (
                <Button
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onAcceptRematch(match.id); }}
                  disabled={!!isAccepting}
                  className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm"
                >
                  {isAccepting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isAccepting ? "Accepting…" : "Accept"}
                </Button>
              )}
              {canRequestRematch && onRequestRematch && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => { e.stopPropagation(); onRequestRematch(match.id); }}
                  disabled={!!isRequesting}
                  className="border-neutral-600 text-neutral-300 rounded-lg text-sm"
                >
                  {isRequesting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isRequesting ? "Sending…" : "Request rematch"}
                </Button>
              )}
            </div>
          )}

          {match.venueName && (
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-violet-400/60" />
              <span className="text-sm text-neutral-400">{match.venueName}</span>
            </div>
          )}
        </div>
      </>
    );

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => handleMatchClick(match.id)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleMatchClick(match.id); } }}
        aria-label={`Chat with ${match.displayName || 'Match'}`}
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl active:scale-[0.98] transition-all text-left cursor-pointer ${
          expired
            ? 'bg-neutral-800/20 hover:bg-neutral-800/40'
            : matchUnread
              ? 'bg-neutral-800/50 border border-violet-500/30 border-l-2 border-l-violet-500 hover:bg-neutral-800/70'
              : 'bg-neutral-800/30 border border-neutral-700/20 hover:bg-neutral-800/50'
        }`}
      >
        {rowContent}
      </div>
    );
  };

  const SwipeableMatchRow = ({ match, expired = false }: { match: MatchWithPreview; expired?: boolean }) => {
    const x = useMotionValue(0);
    const bgOpacity = useTransform(x, [-120, -60, 0], [1, 0.5, 0]);

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const intentionalSwipe = info.offset.x < -120 || (info.offset.x < -60 && info.velocity.x < -300);
      if (intentionalSwipe) {
        dismissMatch(match.id);
      }
    };

    if (expired) {
      return <MatchRow match={match} expired />;
    }

    return (
      <div className="relative overflow-hidden rounded-xl">
        <motion.div
          className="absolute inset-0 flex items-center justify-end pr-5 bg-red-600/90 rounded-xl"
          style={{ opacity: bgOpacity }}
        >
          <Trash2 className="w-5 h-5 text-white" />
        </motion.div>
        <motion.div
          drag="x"
          dragDirectionLock
          dragConstraints={{ left: -140, right: 0 }}
          dragElastic={0.1}
          dragSnapToOrigin
          onDragEnd={handleDragEnd}
          style={{ x }}
          className="relative bg-neutral-900"
        >
          <MatchRow match={match} />
        </motion.div>
      </div>
    );
  };

  const SectionHeader = ({
    label,
    count,
    expanded,
    onToggle,
    accentColor,
  }: {
    label: string;
    count: number;
    expanded: boolean;
    onToggle: () => void;
    accentColor?: string;
  }) => (
    <button
      onClick={() => { hapticLight(); onToggle(); }}
      className="flex items-center justify-between w-full px-1 py-3 group"
    >
      <div className="flex items-center gap-2">
        <span className="text-base font-semibold text-neutral-200">{label}</span>
        {count > 0 && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            accentColor || 'bg-neutral-700 text-neutral-300'
          }`}>
            {count}
          </span>
        )}
      </div>
      <ChevronDown
        className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
      />
    </button>
  );

  return (
    <ErrorBoundary>
      <div
        ref={scrollRef}
        className="max-w-lg mx-auto"
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

        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 via-violet-500 to-pink-500 bg-clip-text text-transparent">Matches</h1>
          {activeNonDismissed.length > 0 && (
            <p className="text-base text-neutral-300 font-medium mt-1">
              {activeNonDismissed.length} active {activeNonDismissed.length === 1 ? 'conversation' : 'conversations'}
            </p>
          )}
        </div>

        {isLoading ? (
          <MatchListSkeleton />
        ) : matches.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No matches yet"
            description="Your matches will appear here. Head to a venue to start meeting people."
            action={{
              label: "Find Venues",
              onClick: () => navigate('/checkin')
            }}
          />
        ) : (
          <div className="space-y-2">
            {/* Unread section */}
            {(unreadMatches.length > 0 || readMatches.length > 0) && (
              <div>
                <SectionHeader
                  label="Unread"
                  count={unreadMatches.length}
                  expanded={unreadExpanded}
                  onToggle={() => setUnreadExpanded(prev => !prev)}
                  accentColor="bg-violet-500/20 text-violet-400"
                />
                <AnimatePresence initial={false}>
                  {unreadExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      {unreadMatches.length > 0 ? (
                        <div className="space-y-2 pb-2">
                          {unreadMatches.map((match) => (
                            <SwipeableMatchRow key={match.id} match={match} />
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-4 text-neutral-400">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span className="text-sm">All caught up!</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Read section */}
            {(unreadMatches.length > 0 || readMatches.length > 0) && (
              <div>
                <SectionHeader
                  label="Read"
                  count={readMatches.length}
                  expanded={readExpanded}
                  onToggle={() => setReadExpanded(prev => !prev)}
                />
                <AnimatePresence initial={false}>
                  {readExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      {readMatches.length > 0 ? (
                        <div className="space-y-2 pb-2">
                          {readMatches.map((match) => (
                            <SwipeableMatchRow key={match.id} match={match} />
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-4 text-neutral-500">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm">No previous conversations</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Expired section */}
            {expiredMatchesList.length > 0 && (
              <div className="mt-2">
                <SectionHeader
                  label="Expired"
                  count={expiredMatchesList.length}
                  expanded={expiredExpanded}
                  onToggle={() => setExpiredExpanded(prev => !prev)}
                  accentColor="bg-red-500/15 text-red-400"
                />
                <AnimatePresence initial={false}>
                  {expiredExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2 pb-2">
                        {expiredMatchesList.map((match) => (
                          <MatchRow
                            key={match.id}
                            match={match}
                            expired
                            onAcceptRematch={handleAcceptRematch}
                            onRequestRematch={handleRequestRematch}
                            acceptingRematchId={acceptingRematchId}
                            requestingRematchId={requestingRematchId}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* No active matches fallback */}
            {activeNonDismissed.length === 0 && expiredMatchesList.length > 0 && (
              <div className="text-center py-6 rounded-xl bg-gradient-to-r from-violet-500/5 to-pink-500/5 border border-neutral-700/30">
                <Heart className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                <p className="text-neutral-300 text-base font-medium">No active matches right now</p>
                <p className="text-neutral-400 text-sm mt-1">Check in to a venue to meet new people</p>
              </div>
            )}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
