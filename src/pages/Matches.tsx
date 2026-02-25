import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MapPin, ChevronDown, ChevronUp, RefreshCw, Trash2 } from "lucide-react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
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

type MatchWithPreview = Match & {
  lastMessage?: string;
  lastMessageTime?: number;
  isNew?: boolean;
};

export default function Matches() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<MatchWithPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showExpired, setShowExpired] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('mingle_dismissed_matches');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  const dismissMatch = useCallback((matchId: string) => {
    hapticMedium();
    setDismissedIds(prev => {
      const next = new Set(prev).add(matchId);
      localStorage.setItem('mingle_dismissed_matches', JSON.stringify([...next]));
      return next;
    });
  }, []);
  const pullStartY = useRef<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMatches = useCallback(async (silent = false) => {
    if (!currentUser?.uid) {
      setIsLoading(false);
      return;
    }
    
    if (!silent) setIsLoading(true);
    try {
      const allMatches = await getAllMatches(currentUser.uid);
        const now = Date.now();

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
              } catch (err) {
                console.error('[Matches] messages query failed for', match.id, err);
              }
            }
            // Fallback: use embedded messages from the match document itself
            if (!lastMsg && match._embeddedMessages && match._embeddedMessages.length > 0) {
              const last = match._embeddedMessages[match._embeddedMessages.length - 1];
              lastMsg = { text: last.text || '', ts: last.timestamp || match.createdAt };
            }
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

  const activeMatchesList = matches.filter(m => !isExpired(m) && !dismissedIds.has(m.id));
  const expiredMatchesList = matches.filter(m => isExpired(m));

  const MatchRow = ({ match, expired = false }: { match: MatchWithPreview; expired?: boolean }) => {
    const remainingTime = formatRemainingTime(match.expiresAt);
    const remainingSeconds = getRemainingSeconds(match);
    const isUrgent = remainingSeconds < 30 * 60 && !expired;
    
    return (
      <button
        onClick={() => handleMatchClick(match.id)}
        aria-label={`Chat with ${match.displayName || 'Match'}`}
        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl active:scale-[0.98] transition-all text-left ${
          expired ? 'opacity-50' : 'hover:bg-neutral-800/50'
        }`}
      >
        {/* Photo thumbnail — rounded rectangle */}
        <div className="relative flex-shrink-0">
          <div className="h-16 w-16 rounded-xl overflow-hidden bg-neutral-700">
            {match.avatarUrl ? (
              <img src={match.avatarUrl} alt={match.displayName || "Match"} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-violet-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">{(match.displayName || "M").charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
          {match.unreadCount && match.unreadCount > 0 && !expired && (
            <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">{match.unreadCount > 9 ? '9+' : match.unreadCount}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between mb-0.5">
            <h3 className={`font-semibold text-base truncate ${
              match.unreadCount && match.unreadCount > 0 && !expired ? 'text-white' : 'text-neutral-200'
            }`}>
              {match.displayName || "Match"}
            </h3>
            <span className={`text-xs flex-shrink-0 ml-2 ${
              expired ? 'text-neutral-400' : isUrgent ? 'text-orange-400' : 'text-neutral-400'
            }`}>
              {expired ? 'Expired' : remainingTime}
            </span>
          </div>
          
          <p className={`text-sm truncate ${
            match.lastMessage
              ? match.unreadCount && match.unreadCount > 0 && !expired
                ? 'text-white font-medium'
                : 'text-neutral-400'
              : 'text-neutral-400 italic'
          }`}>
            {match.lastMessage || "Start a conversation..."}
          </p>
          
          {match.venueName && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-neutral-400" />
              <span className="text-xs text-neutral-400">{match.venueName}</span>
            </div>
          )}
        </div>
      </button>
    );
  };

  const SwipeableMatchRow = ({ match, expired = false }: { match: MatchWithPreview; expired?: boolean }) => {
    const x = useMotionValue(0);
    const bgOpacity = useTransform(x, [-80, -40, 0], [1, 0.5, 0]);

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.x < -60) {
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
          dragConstraints={{ left: -80, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          style={{ x }}
          className="relative bg-neutral-900"
        >
          <MatchRow match={match} />
        </motion.div>
      </div>
    );
  };

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
          <h1 className="text-page-title">Matches</h1>
          {activeMatchesList.length > 0 && (
            <p className="text-sm text-neutral-300 mt-1">
              {activeMatchesList.length} active {activeMatchesList.length === 1 ? 'conversation' : 'conversations'}
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
          <div>
            {/* Active matches */}
            {activeMatchesList.length > 0 && (
              <div className="space-y-1">
                {activeMatchesList.map((match) => (
                  <SwipeableMatchRow key={match.id} match={match} />
                ))}
              </div>
            )}

            {/* Expired matches */}
            {expiredMatchesList.length > 0 && (
              <div className="mt-6">
                <button
                  onClick={() => setShowExpired(!showExpired)}
                  className="flex items-center justify-between w-full px-4 py-2 text-neutral-400 text-sm"
                >
                  <span>Expired ({expiredMatchesList.length})</span>
                  {showExpired ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                {showExpired && (
                  <div className="space-y-1">
                    {expiredMatchesList.map((match) => (
                      <MatchRow key={match.id} match={match} expired />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
