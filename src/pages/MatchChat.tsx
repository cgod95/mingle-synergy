import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

type Message = {
  id: string;
  text: string;
  sender: "me" | "them";
  time: number;
};

export default function MatchChat() {
  const { id } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const KEY = `chat_${id}`;

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved) setMessages(JSON.parse(saved));
  }, [id]);

  const send = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: Math.random().toString(36).slice(2),
      text: input.trim(),
      sender: "me",
      time: Date.now(),
    };
    const updated = [...messages, newMsg];
    setMessages(updated);
    localStorage.setItem(KEY, JSON.stringify(updated));
    setInput("");
  };

  return (
    <main style={{ padding: 24 }}>
      <Link to="/matches" style={{ textDecoration: "none", color: "#06f" }}>
        ← Back
      </Link>
      <h1 style={{ marginTop: 8 }}>Chat</h1>
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: 12,
          padding: 12,
          marginTop: 16,
          minHeight: 200,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              alignSelf: m.sender === "me" ? "flex-end" : "flex-start",
              background: m.sender === "me" ? "#d0f0c0" : "#eee",
              padding: "6px 10px",
              borderRadius: 8,
              maxWidth: "70%",
            }}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        />
        <button onClick={send} style={{ padding: "8px 16px" }}>
          Send
        </button>
      </div>
    </main>
  );
}
