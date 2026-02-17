import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Clock, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { getAllMatches, getRemainingSeconds, isExpired, type Match } from "@/lib/matchesCompat";
import { getLastMessage } from "@/lib/chatStore";

function getLastMessageAny(matchId: string) {
  const fromStore = getLastMessage(matchId);
  if (fromStore) return fromStore;
  try {
    const raw = localStorage.getItem(`mingle:messages:${matchId}`);
    if (!raw) return undefined;
    const msgs = JSON.parse(raw) as { sender: string; text: string; ts: number }[];
    if (msgs.length === 0) return undefined;
    const last = msgs[msgs.length - 1];
    return { sender: last.sender === 'you' ? ('me' as const) : ('them' as const), text: last.text, ts: last.ts };
  } catch {
    return undefined;
  }
}

import { useAuth } from "@/context/AuthContext";
import config from "@/config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ErrorBoundary from "@/components/ErrorBoundary";
import { MatchListSkeleton } from "@/components/ui/LoadingStates";
import { EmptyState } from "@/components/ui/EmptyState";
import { logError } from "@/utils/errorHandler";
import { hapticLight } from "@/lib/haptics";

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
  const [showExpired, setShowExpired] = useState(false);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!currentUser?.uid) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const allMatches = await getAllMatches(currentUser.uid);
        const now = Date.now();
        const enrichedMatches: MatchWithPreview[] = allMatches.map((match) => {
          const lastMsg = getLastMessageAny(match.id);
          const isNew = !lastMsg && (now - match.createdAt < 60 * 60 * 1000);
          return {
            ...match,
            lastMessage: lastMsg?.text,
            lastMessageTime: lastMsg?.ts,
            isNew,
          };
        });

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
      }
    };

    fetchMatches();
    const interval = config.DEMO_MODE ? null : setInterval(fetchMatches, 30000);
    return () => { if (interval) clearInterval(interval); };
  }, [currentUser?.uid]);

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

  const activeMatchesList = matches.filter(m => !isExpired(m));
  const expiredMatchesList = matches.filter(m => isExpired(m));

  const MatchRow = ({ match, expired = false }: { match: MatchWithPreview; expired?: boolean }) => {
    const remainingTime = formatRemainingTime(match.expiresAt);
    const remainingSeconds = getRemainingSeconds(match);
    const isUrgent = remainingSeconds < 30 * 60 && !expired;
    
    return (
      <button
        onClick={() => handleMatchClick(match.id)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl active:scale-[0.98] transition-all text-left ${
          expired ? 'opacity-50' : 'hover:bg-neutral-800/50'
        }`}
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <Avatar className="h-14 w-14">
            {match.avatarUrl ? (
              <AvatarImage src={match.avatarUrl} alt={match.displayName || "Match"} />
            ) : null}
            <AvatarFallback className="bg-indigo-600 text-white font-bold text-lg">
              {(match.displayName || "M").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {match.unreadCount && match.unreadCount > 0 && !expired && (
            <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
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
            {/* Time */}
            <span className={`text-xs flex-shrink-0 ml-2 ${
              expired ? 'text-neutral-500' : isUrgent ? 'text-orange-400' : 'text-neutral-500'
            }`}>
              {expired ? 'Expired' : remainingTime}
            </span>
          </div>
          
          <p className={`text-sm truncate ${
            match.lastMessage
              ? match.unreadCount && match.unreadCount > 0 && !expired
                ? 'text-white font-medium'
                : 'text-neutral-400'
              : 'text-neutral-500 italic'
          }`}>
            {match.lastMessage || "Start a conversation..."}
          </p>
          
          {match.venueName && (
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 text-neutral-500" />
              <span className="text-xs text-neutral-500">{match.venueName}</span>
            </div>
          )}
        </div>
      </button>
    );
  };

  return (
    <ErrorBoundary>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-white">Matches</h1>
          {activeMatchesList.length > 0 && (
            <p className="text-sm text-neutral-400 mt-1">
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
            description="Check into a venue to start meeting people"
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
                  <MatchRow key={match.id} match={match} />
                ))}
              </div>
            )}

            {/* Expired matches */}
            {expiredMatchesList.length > 0 && (
              <div className="mt-6">
                <button
                  onClick={() => setShowExpired(!showExpired)}
                  className="flex items-center justify-between w-full px-4 py-2 text-neutral-500 text-sm"
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
