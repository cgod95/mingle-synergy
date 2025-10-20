import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { clearThread, getCurrentPairId, listMessages, sendMessage, setCurrentPairId } from "../lib/demoChat";

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [messages, setMessages] = useState(() => (id ? listMessages(id) : []));
  const [text, setText] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    // ensure current pair is this id
    setCurrentPairId(id);
    const i = setInterval(() => setMessages(listMessages(id)), 400);
    return () => clearInterval(i);
  }, [id]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 999999, behavior: "smooth" });
  }, [messages.length]);

  if (!id) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Chat</h1>
        <p>Missing pair id.</p>
      </main>
    );
  }

  const sendMe = () => {
    const t = text.trim();
    if (!t) return;
    sendMessage(id, "me", t);
    setText("");
  };

  const simulateReply = () => {
    sendMessage(id, "peer", "Sounds good! 👋");
  };

  const leave = () => {
    setCurrentPairId(null);
    nav("/pair");
  };

  const wipe = () => {
    clearThread(id);
    setMessages(listMessages(id));
  };

  return (
    <main style={{ padding: 24, display: "grid", gap: 12, height: "calc(100dvh - 64px)" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>Chat · {id}</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={simulateReply}>Simulate reply</button>
          <button onClick={wipe}>Clear thread</button>
          <button onClick={leave}>Leave</button>
        </div>
      </header>

      <div ref={scroller} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, overflowY: "auto" }}>
        {messages.length === 0 ? (
          <div style={{ color: "#666" }}>No messages yet</div>
        ) : (
          messages.map(m => (
            <div key={m.id} style={{ display: "flex", margin: "8px 0", justifyContent: m.sender === "me" ? "flex-end" : "flex-start" }}>
              <div style={{
                background: m.sender === "me" ? "#e8f0ff" : "#f2f2f2",
                padding: "8px 12px",
                borderRadius: 12,
                maxWidth: 360
              }}>
                {m.text}
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={text}
          onChange={e=>setText(e.target.value)}
          onKeyDown={e=>{ if(e.key==="Enter") sendMe(); }}
          placeholder="Type a message…"
          style={{ flex: 1, padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
        />
        <button onClick={sendMe}>Send</button>
      </div>

      <footer style={{ fontSize: 12, color: "#666" }}>
        Currently paired: <b>{getCurrentPairId() ?? "none"}</b>
      </footer>
    </main>
  );
}
