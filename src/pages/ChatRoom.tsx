import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Optional demo match lookup (if present in your repo); safe-optional import.
let getMatch: undefined | ((id: string) => any);
try {
  // @ts-ignore
  const mod = require("../lib/demoMatches") as any;
  if (mod && typeof mod.getMatch === "function") getMatch = mod.getMatch;
} catch {}

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
  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const header = useMemo(() => {
    if (!matchId) return "Chat";
    const m = getMatch ? getMatch(matchId) : null;
    return m?.name ?? "Chat";
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
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center space-x-3 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white">
            {header.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-neutral-800 truncate">{header}</h2>
          <p className="text-xs text-neutral-500">Active now</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <AnimatePresence>
          {msgs.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${m.sender === "you" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  m.sender === "you"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                    : "bg-white border border-neutral-200 text-neutral-700 shadow-sm"
                }`}
              >
                <p className="text-sm leading-relaxed">{m.text}</p>
                <p className={`text-xs mt-1 opacity-70 ${m.sender === "you" ? "text-right" : "text-left"}`}>
                  {new Date(m.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-neutral-200 px-4 py-3">
        <form onSubmit={onSend} className="flex gap-2">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-neutral-50"
          />
          <Button
            type="submit"
            disabled={!text.trim()}
            className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            size="icon"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
