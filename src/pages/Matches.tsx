// 🧠 Purpose: Unified Matches & Chats page - like dating apps
// Shows all matches with last message preview and avatar

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Clock, ArrowRight, MapPin, Filter, Sparkles } from "lucide-react";
import { getAllMatches, getRemainingSeconds, isExpired, type Match } from "@/lib/matchesCompat";
import { getLastMessage } from "@/lib/chatStore";

/** Fallback: also check ChatRoom's direct localStorage if chatStore has no messages */
function getLastMessageAny(matchId: string) {
  // First try the canonical chatStore
  const fromStore = getLastMessage(matchId);
  if (fromStore) return fromStore;
  // Fallback: ChatRoom writes to mingle:messages:${id}
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
import { timeAgo } from "@/lib/timeago";
import { useAuth } from "@/context/AuthContext";
import config from "@/config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ErrorBoundary from "@/components/ErrorBoundary";
import { MatchListSkeleton } from "@/components/ui/LoadingStates";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { Search, ChevronDown, ChevronUp, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { logError } from "@/utils/errorHandler";
import { hapticLight, hapticMedium } from "@/lib/haptics";

type MatchWithPreview = Match & {
  lastMessage?: string;
  lastMessageTime?: number;
  isNew?: boolean;
};

type FilterType = 'all' | 'active' | 'expired';

export default function Matches() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [matches, setMatches] = useState<MatchWithPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showExpired, setShowExpired] = useState(false);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!currentUser?.uid) {
        setIsLoading(false);
        return;
      }
      
      // Demo data seeding removed for closed beta - using real Firebase data
      setIsLoading(true);
      try {
        // Get all matches (including expired) for display
        const allMatches = await getAllMatches(currentUser.uid);
        
        // Enrich with last message preview and new match indicator
        const now = Date.now();
        const enrichedMatches: MatchWithPreview[] = allMatches.map((match) => {
          const lastMsg = getLastMessageAny(match.id);
          // Consider match "new" if created within last hour and no messages yet
          const isNew = !lastMsg && (now - match.createdAt < 60 * 60 * 1000);
          return {
            ...match,
            lastMessage: lastMsg?.text,
            lastMessageTime: lastMsg?.ts,
            isNew,
          };
        });

        // Sort by last message time (most recent first), then by expiry (soonest first)
        enrichedMatches.sort((a, b) => {
          if (a.lastMessageTime && b.lastMessageTime) {
            return b.lastMessageTime - a.lastMessageTime;
          }
          if (a.lastMessageTime) return -1;
          if (b.lastMessageTime) return 1;
          return a.expiresAt - b.expiresAt; // Soonest expiry first
        });

        setMatches(enrichedMatches);
      } catch (error) {
        logError(error as Error, { context: 'Matches.fetchMatches', userId: currentUser?.uid || 'unknown' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
    // Refresh every 30 seconds
    // CRITICAL: Disabled in demo mode to prevent periodic re-renders
    // In demo mode, matches are loaded from localStorage and don't need polling
    const interval = config.DEMO_MODE ? null : setInterval(fetchMatches, 30000);
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentUser?.uid]); // CRITICAL: Only depend on user ID, not whole object


  const formatRemainingTime = (expiresAt: number): string => {
    const remaining = getRemainingSeconds({ expiresAt } as Match);
    if (remaining === 0) return "Expired";
    
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Get expiry color based on remaining time
  const getExpiryColor = (remainingSeconds: number): string => {
    if (remainingSeconds < 30 * 60) return 'text-red-400 border-red-500 bg-red-900/30'; // < 30 min - red
    if (remainingSeconds < 60 * 60) return 'text-orange-400 border-orange-500 bg-orange-900/30'; // < 1 hour - orange
    return 'text-green-400 border-green-500 bg-green-900/20'; // > 1 hour - green
  };

  const handleMatchClick = (matchId: string) => {
    hapticLight();
    navigate(`/chat/${matchId}`);
  };

  // Filter matches based on selected filter and search
  const filteredMatches = matches.filter(match => {
    // Filter by search query first
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const name = (match.displayName || '').toLowerCase();
      const venue = (match.venueName || '').toLowerCase();
      const message = (match.lastMessage || '').toLowerCase();
      if (!name.includes(query) && !venue.includes(query) && !message.includes(query)) {
        return false;
      }
    }
    
    return true;
  });

  // Separate active and expired matches based on filter
  const activeMatchesList = filteredMatches.filter(m => {
    if (filter === 'expired') return false;
    return !isExpired(m);
  });
  
  const expiredMatchesList = filteredMatches.filter(m => {
    if (filter === 'active') return false;
    return isExpired(m);
  });

  // Calculate stats
  const activeMatches = matches.filter(m => !isExpired(m)).length;
  const expiredMatches = matches.filter(m => isExpired(m)).length;
  const totalMatches = matches.length;

  return (
    <ErrorBoundary>
      <div>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Matches
                </h1>
                <p className="text-neutral-300 mt-2">Your conversations</p>
              </div>
              {totalMatches > 0 && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-indigo-600 text-white px-4 py-1.5 text-sm font-semibold shadow-lg">
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    {activeMatches} active
                  </Badge>
                </div>
              )}
            </div>

            {/* Search and Filter */}
            {totalMatches > 0 && (
              <div className="space-y-3 mb-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    type="text"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
                    aria-label="Search matches by name"
                  />
                </div>
                
                {/* Filter Buttons */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-neutral-400" />
                  <div className="flex gap-2">
                    {(['all', 'active', 'expired'] as FilterType[]).map((filterType) => (
                      <Button
                        key={filterType}
                        onClick={() => setFilter(filterType)}
                        variant={filter === filterType ? 'default' : 'outline'}
                        size="sm"
                        className={
                          filter === filterType
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-[0_0_8px_rgba(99,102,241,0.4)] focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-neutral-900'
                            : 'border-neutral-600 text-neutral-300 hover:bg-neutral-800 bg-neutral-800/50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-neutral-900'
                        }
                        aria-label={`Filter ${filterType} matches`}
                      >
                        {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
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
                label: "Check into a venue to start matching",
                onClick: () => navigate('/checkin')
              }}
            />
          ) : (
            <div className="space-y-4">
              {/* Active Matches */}
              {activeMatchesList.length > 0 && (
                <div className="space-y-3">
                  {activeMatchesList.map((match, index) => {
                  const remainingSeconds = getRemainingSeconds(match);
                  const remainingTime = formatRemainingTime(match.expiresAt);
                  const isExpiringSoon = remainingSeconds < 30 * 60; // Less than 30 minutes
                  const isExpiringVerySoon = remainingSeconds < 15 * 60; // Less than 15 minutes
                  const matchExpired = isExpired(match);
                  const expiryColor = getExpiryColor(remainingSeconds);
                  
                  return (
                    <div key={match.id}>
                      <Card
                        className={`cursor-pointer transition-all border overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-neutral-900 active:scale-[0.98] ${
                          matchExpired
                            ? "opacity-60 border-neutral-700 bg-neutral-800/50"
                            : isExpiringVerySoon
                            ? "border-red-500 bg-red-900/10 hover:shadow-lg hover:border-red-400"
                            : isExpiringSoon
                            ? "border-orange-500 bg-orange-900/10 hover:shadow-lg hover:border-orange-400"
                            : "border-neutral-700 bg-neutral-800 hover:shadow-xl hover:border-indigo-500"
                        }`}
                        onClick={() => handleMatchClick(match.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleMatchClick(match.id);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`Match with ${match.displayName || 'Match'}`}
                      >
                        <div className="flex items-start gap-3 px-4 py-3">
                          {/* Avatar — smaller on mobile */}
                          <div className="relative flex-shrink-0">
                            <Avatar className={`h-14 w-14 flex-shrink-0 ring-2 ring-offset-2 ring-offset-neutral-800 ${
                              match.unreadCount && match.unreadCount > 0 
                                ? 'ring-indigo-500' 
                                : 'ring-neutral-600'
                            }`}>
                            {match.avatarUrl ? (
                              <AvatarImage 
                                src={match.avatarUrl} 
                                alt={match.displayName || "Match"}
                              />
                            ) : null}
                            <AvatarFallback className="bg-indigo-600 text-white font-bold text-lg">
                              {(match.displayName || "M").charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                            {match.unreadCount && match.unreadCount > 0 && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-neutral-800">
                                <span className="text-[10px] font-bold text-white">{match.unreadCount}</span>
                              </div>
                            )}
                          </div>

                          {/* Content — vertical stacking, mobile-first */}
                          <div className="min-w-0 flex-1">
                            {/* Row 1: Name + New badge */}
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className={`font-bold text-base truncate ${
                                match.unreadCount && match.unreadCount > 0 
                                  ? 'text-white' 
                                  : 'text-neutral-200'
                              }`}>
                                {match.displayName || "Match"}
                              </h3>
                              {match.isNew && (
                                <Badge className="bg-purple-600 text-white text-[10px] px-1.5 py-0 flex-shrink-0">
                                  <Star className="w-2.5 h-2.5 mr-0.5" />
                                  New
                                </Badge>
                              )}
                            </div>
                            
                            {/* Row 2: Message preview — single truncated line */}
                            <p className={`text-sm truncate mb-1.5 ${
                              match.lastMessage
                                ? match.unreadCount && match.unreadCount > 0
                                  ? 'text-white font-semibold'
                                  : 'text-neutral-300'
                                : 'text-neutral-500 italic'
                            }`}>
                              {match.lastMessage || "Start the conversation..."}
                            </p>
                            
                            {/* Row 3: Metadata badges — wrapping allowed */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              {!matchExpired && (
                                <Badge className={`text-[10px] border px-1.5 py-0 ${expiryColor} ${
                                  isExpiringVerySoon ? 'animate-pulse' : ''
                                }`}>
                                  <Clock className="w-2.5 h-2.5 mr-0.5" />
                                  {remainingTime}
                                </Badge>
                              )}
                              {match.venueName && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-indigo-700/30 text-indigo-300/80 bg-indigo-900/10">
                                  <MapPin className="w-2.5 h-2.5 mr-0.5 flex-shrink-0" />
                                  {match.venueName}
                                </Badge>
                              )}
                              {matchExpired && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-neutral-500 border-neutral-600 bg-neutral-800">
                                  <Clock className="w-2.5 h-2.5 mr-0.5" />
                                  Expired
                                </Badge>
                              )}
                              {!matchExpired && !isExpiringSoon && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-green-400 border-green-600 bg-green-900/20">
                                  <Clock className="w-2.5 h-2.5 mr-0.5" />
                                  Active {remainingTime}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Arrow */}
                          <ArrowRight className={`w-4 h-4 flex-shrink-0 mt-1 ${
                            match.unreadCount && match.unreadCount > 0
                              ? 'text-indigo-400'
                              : 'text-neutral-500'
                          }`} />
                        </div>
                      </Card>
                    </div>
                  );
                    })}
                </div>
              )}

              {/* Expired Matches - Collapsible (only show when filter is 'all') */}
              {filter === 'all' && expiredMatchesList.length > 0 && (
                <div className="space-y-3">
                  <Button
                    variant="ghost"
                    onClick={() => setShowExpired(!showExpired)}
                    className="w-full justify-between text-neutral-400 hover:text-neutral-200"
                    aria-label={showExpired ? "Hide expired matches" : "Show expired matches"}
                  >
                    <span className="text-sm font-medium">
                      Expired ({expiredMatchesList.length})
                    </span>
                    {showExpired ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                  
                  {showExpired && (
                    <>
                      {expiredMatchesList.map((match, index) => {
                        const matchExpired = true;
                        
                        return (
                          <div key={match.id}>
                            <Card
                              className="cursor-pointer transition-all border overflow-hidden opacity-60 border-neutral-700 bg-neutral-800/50 active:scale-[0.98]"
                              onClick={() => handleMatchClick(match.id)}
                            >
                              <div className="flex items-start gap-3 px-4 py-3">
                                <Avatar className="h-14 w-14 flex-shrink-0 ring-2 ring-offset-2 ring-offset-neutral-800 ring-neutral-500">
                                  {match.avatarUrl ? (
                                    <AvatarImage 
                                      src={match.avatarUrl} 
                                      alt={match.displayName || "Match"}
                                    />
                                  ) : null}
                                  <AvatarFallback className="bg-neutral-600 text-white font-bold text-lg">
                                    {(match.displayName || "M").charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>

                                <div className="min-w-0 flex-1">
                                  <h3 className="font-bold text-base text-white truncate mb-0.5">
                                    {match.displayName || "Match"}
                                  </h3>
                                  
                                  {match.lastMessage && (
                                    <p className="text-sm text-neutral-400 truncate mb-1.5">
                                      {match.lastMessage}
                                    </p>
                                  )}
                                  
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-neutral-500 border-neutral-600 bg-neutral-800">
                                      <Clock className="w-2.5 h-2.5 mr-0.5" />
                                      Expired
                                    </Badge>
                                    {match.venueName && (
                                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-neutral-700/50 text-neutral-500">
                                        <MapPin className="w-2.5 h-2.5 mr-0.5" />
                                        {match.venueName}
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <ArrowRight className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-1" />
                              </div>
                            </Card>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

