import React, { useState } from "react";
import { feedbackRepo } from "../services/feedbackRepo";
import { useAuth } from "../context/AuthContext";

export default function Feedback() {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const { user } = useAuth?.() || { user: null };

  return (
    <main style={{ maxWidth: 560, margin: "24px auto", padding: 16 }}>
      <h1>Feedback</h1>
      <p>Tell us what worked, what didn’t, and ideas to improve.</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!text.trim()) return;
          setSending(true);
          await feedbackRepo.save(text.trim(), user?.email || null);
          setSending(false);
          setDone(true);
          setText("");
          setTimeout(() => setDone(false), 2500);
        }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          style={{ width: "100%", padding: 12, border: "1px solid #ddd", borderRadius: 8 }}
          placeholder="Your thoughts…"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          style={{ marginTop: 12, padding: "10px 16px", borderRadius: 8, border: "1px solid #999" }}
        >
          {sending ? "Sending..." : "Submit feedback"}
        </button>
        {done && <div style={{ fontSize: 12, color: "green", marginTop: 8 }}>Received — thank you!</div>}
      </form>
    </main>
  );
}
