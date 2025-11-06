import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const endRef = useRef<HTMLDivElement | null>(null);

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

  if (!matchId) {
    return (
      <div className="p-4">
        <button onClick={() => navigate(-1)} className="rounded-lg border px-3 py-1 mr-2">← Back</button>
        <div className="mt-3 rounded-xl border bg-white p-4">Chat not found.</div>
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
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="rounded-lg border px-3 py-1">← Back</button>
        <div className="text-sm text-neutral-600">
          <span className="font-medium">{header}</span>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 min-h-[280px]">
        <div className="space-y-2">
          {msgs.map((m, i) => (
            <div key={i} className={m.sender === "you" ? "text-right" : "text-left"}>
              <span
                className={
                  "inline-block rounded-2xl px-3 py-2 " +
                  (m.sender === "you"
                    ? "bg-indigo-600 text-white"
                    : "bg-neutral-100 text-neutral-900")
                }
              >
                {m.text}
              </span>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>

      <form onSubmit={onSend} className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
          className="flex-1 rounded-xl border px-3 py-2"
        />
        <button
          type="submit"
          className="rounded-xl bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500"
        >
          Send
        </button>
      </form>
    </div>
  );
}
