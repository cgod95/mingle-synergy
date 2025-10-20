import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentPairId, setCurrentPairId } from "../lib/demoChat";

function makeCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function Pair() {
  const nav = useNavigate();
  const existing = getCurrentPairId();
  const [joinCode, setJoinCode] = useState("");

  const myCode = useMemo(() => makeCode(), []); // new code each visit (demo)

  const createPair = () => {
    setCurrentPairId(myCode);
    nav(`/chat/${myCode}`);
  };

  const joinPair = () => {
    const code = joinCode.trim();
    if (!/^\d{6}$/.test(code)) {
      alert("Enter a 6-digit code");
      return;
    }
    setCurrentPairId(code);
    nav(`/chat/${code}`);
  };

  const leavePair = () => {
    setCurrentPairId(null);
    alert("Left current pair");
  };

  return (
    <main style={{ padding: 24, maxWidth: 520 }}>
      <h1>Pair for Demo</h1>
      {existing ? (
        <div style={{ marginBottom: 16 }}>
          <div>Currently paired with code: <b>{existing}</b></div>
          <button onClick={leavePair} style={{ marginTop: 8 }}>Leave</button>
        </div>
      ) : (
        <p>Share a code with a friend (same bar Wi-Fi), then both open the chat.</p>
      )}

      <section style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8, marginBottom: 16 }}>
        <h3>Create a code</h3>
        <div style={{ fontSize: 28, letterSpacing: 2, margin: "8px 0" }}>{myCode}</div>
        <button onClick={createPair}>Use this code</button>
      </section>

      <section style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8 }}>
        <h3>Join with a code</h3>
        <input
          value={joinCode}
          onChange={e=>setJoinCode(e.target.value)}
          placeholder="Enter 6-digit code"
          inputMode="numeric"
          style={{ padding: 8, width: "100%", marginBottom: 8 }}
        />
        <button onClick={joinPair}>Join</button>
      </section>
    </main>
  );
}
