import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMatches } from "../lib/matchStore";

type ChatMsg = { id: string; text: string; at: number; who: "me" | "them" };

const MSG_LIMIT = 20;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24h

export default function Chat() {
  // Demo chat limits (idempotent)
  const messageLimit = 3;
  const expiryHours = 3;
  const [timeLeft, setTimeLeft] = useState(expiryHours * 60 * 60 * 1000);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(t => Math.max(0, t - 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [startedAt, setStartedAt] = useState<number>(() => Date.now());
  const endRef = useRef<HTMLDivElement | null>(null);

  const match = useMemo(() => getMatches().find(m => m.id === id), [id]);

  // storage keys
  const keyBase = useMemo(() => `chat:${id}`, [id]);
  const keyMsgs = `${keyBase}:messages`;
  const keyStart = `${keyBase}:startedAt`;

  useEffect(() => {
    if (!id) return;
    try {
      const a = localStorage.getItem(keyStart);
      if (a) setStartedAt(parseInt(a, 10));
      else {
        const now = Date.now();
        localStorage.setItem(keyStart, String(now));
        setStartedAt(now);
      }
      const m = localStorage.getItem(keyMsgs);
      if (m) setMsgs(JSON.parse(m));
    } catch {}
  }, [id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  const remainingMs = Math.max(0, startedAt + WINDOW_MS - Date.now());
  const expired = remainingMs <= 0;

  const remaining = useMemo(() => {
    const s = Math.floor(remainingMs / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}h ${m}m ${sec}s`;
  }, [remainingMs]);

  useEffect(() => {
    if (expired) return;
    const t = setInterval(() => {
      // force re-render each second
       
      setText(t => t);
    }, 1000);
    return () => clearInterval(t);
  }, [expired]);

  const save = (list: ChatMsg[]) => {
    setMsgs(list);
    try { localStorage.setItem(keyMsgs, JSON.stringify(list)); } catch {}
  };

  const send = () => {
    if (!text.trim() || expired) return;
    const next = msgs.slice(-MSG_LIMIT + 1).concat({
      id: crypto.randomUUID(),
      text: text.trim(),
      at: Date.now(),
      who: "me",
    });
    save(next);
    setText("");
  };

  if (!match) {
    return (
      <main style={{ padding: 24 }}>
        <h2>Chat</h2>
        <p>Match not found.</p>
        <button onClick={() => navigate("/matches")}>Back to matches</button>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img
          src={match.photoUrl}
          alt={match.name}
          width={48}
          height={48}
          style={{ borderRadius: 8, objectFit: "cover" }}
        />
        <div>
          <h2 style={{ margin: 0 }}>{match.name}</h2>
          <div style={{ fontSize: 12, color: "#666" }}>
            {expired ? "Chat expired" : `Closes in ${remaining}`}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 12,
          minHeight: 280,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {msgs.length === 0 ? (
          <div style={{ color: "#777" }}>No messages yet.</div>
        ) : (
          msgs.map(m => (
            <div
              key={m.id}
              style={{
                alignSelf: m.who === "me" ? "flex-end" : "flex-start",
                background: m.who === "me" ? "#e7f3ff" : "#f4f4f4",
                padding: "8px 10px",
                borderRadius: 10,
                maxWidth: "80%",
              }}
            >
              {m.text}
              <div style={{ fontSize: 10, color: "#777", marginTop: 2 }}>
                {new Date(m.at).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={expired ? "Chat closed" : "Type a message…"}
          disabled={expired}
          style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc" }}
        />
        <button
          onClick={send}
          disabled={expired || !text.trim()}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            background: expired ? "#aaa" : "#2563eb",
            color: "white",
            cursor: expired ? "not-allowed" : "pointer",
          }}
        >
          Send
        </button>
      </div>

      <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
        Messages are capped at {MSG_LIMIT}. Oldest messages will roll off.
      </div>
    </main>
  );
}
