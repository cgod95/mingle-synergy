import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Send, MoreVertical, Sparkles, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
        console.error('Error loading match info:', error);
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
    if (!matchId) return;
    const seeded = ensureThread(matchId);
    setMsgs(seeded);
  }, [matchId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs]);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  if (!matchId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 text-center">
          <p className="text-neutral-600">Chat not found.</p>
          <Button onClick={() => navigate(-1)} className="mt-4" variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const onSend = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    const next = [...msgs, { sender: "you", text: t, ts: Date.now() }];
    setMsgs(next);
    saveMessages(matchId, next);
    setText("");
    setShowStarters(false); // Hide starters after first message
    inputRef.current?.focus();
  };

  const sendStarter = (starter: string) => {
    const next = [...msgs, { sender: "you", text: starter, ts: Date.now() }];
    setMsgs(next);
    saveMessages(matchId, next);
    setShowStarters(false);
    inputRef.current?.focus();
  };

      return (
        <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50 z-50">
          {/* Mingle Branding */}
          <div className="bg-white/80 backdrop-blur-md border-b border-neutral-200 px-4 sm:px-6 py-2 flex items-center flex-shrink-0">
            <Link to="/matches" className="flex items-center space-x-2 group">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Mingle
              </span>
            </Link>
          </div>
          {/* Header */}
          <div className="bg-white border-b border-neutral-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center space-x-3 shadow-sm flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Avatar className="h-10 w-10 ring-2 ring-indigo-100">
          {matchAvatar ? (
            <AvatarImage src={matchAvatar} alt={matchName} />
          ) : null}
          <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white">
            {matchName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-neutral-800 truncate">{matchName}</h2>
          <div className="flex items-center gap-2">
            <p className="text-xs text-neutral-500">Active now</p>
            {matchExpiresAt && getRemainingTime() && (
              <>
                <span className="text-xs text-neutral-400">•</span>
                <p className="text-xs text-orange-600 font-medium">
                  Expires in {getRemainingTime()}
                </p>
              </>
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
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-3">
        {/* Conversation Starters - Show when conversation is new */}
        {showStarters && msgs.length <= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="flex items-center gap-2 mb-3 px-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <p className="text-sm font-medium text-neutral-600">Try a conversation starter</p>
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
                  className="px-4 py-2 text-sm bg-white border-2 border-indigo-200 rounded-full text-neutral-700 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
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
                <Avatar className="h-8 w-8 flex-shrink-0">
                  {matchAvatar ? (
                    <AvatarImage src={matchAvatar} alt={matchName} />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white text-xs">
                    {matchName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={`max-w-[75%] sm:max-w-[70%] rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 shadow-sm ${
                  m.sender === "you"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-sm"
                    : "bg-white border-2 border-neutral-200 text-neutral-700 rounded-bl-sm"
                }`}
              >
                <p className="text-sm sm:text-base leading-relaxed font-medium break-words">{m.text}</p>
                <p className={`text-xs mt-1.5 opacity-70 ${m.sender === "you" ? "text-right" : "text-left"}`}>
                  {new Date(m.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>

              {/* Avatar for your messages (smaller, optional) */}
              {m.sender === "you" && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-xs">
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
            <Avatar className="h-8 w-8 flex-shrink-0">
              {matchAvatar ? (
                <AvatarImage src={matchAvatar} alt={matchName} />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white text-xs">
                {matchName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="bg-white border-2 border-neutral-200 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
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
      <div className="bg-white border-t border-neutral-200 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0 safe-area-inset-bottom">
        <form onSubmit={onSend} className="flex gap-2 sm:gap-3 items-end">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              className="w-full rounded-full border-2 border-neutral-300 px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm"
            />
          </div>
          <Button
            type="submit"
            disabled={!text.trim()}
            className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0"
            size="icon"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </form>
      </div>

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
  );
}
