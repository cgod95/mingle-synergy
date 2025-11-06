import React, { useEffect, useState } from "react";
import { purgeExpired, read, write } from "../lib/matchStore";

export default function DebugPanel() {
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "d") setOpen(o => !o);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const clearAll = () => {
    localStorage.removeItem("mingle_matches_v1");
    setInfo("✅ Cleared demo data.");
    setTimeout(() => setInfo(""), 2000);
  };

  const expireNow = () => {
    const matches = read();
    for (const m of matches) m.createdAt = Date.now() - 4 * 60 * 60 * 1000;
    write(matches);
    purgeExpired();
    setInfo("⚠️ All matches marked expired.");
    setTimeout(() => setInfo(""), 2000);
  };

  if (!open) return null;
  return (
    <div style={{
      position: "fixed", bottom: 16, right: 16, background: "#111", color: "#fff",
      borderRadius: 8, padding: "10px 14px", fontSize: 13, zIndex: 1000
    }}>
      <div><b>Debug Panel</b> (press D to toggle)</div>
      <button onClick={clearAll} style={{marginTop: 8, marginRight: 8}}>Clear Matches</button>
      <button onClick={expireNow}>Expire All</button>
      {info && <div style={{marginTop: 6, fontSize: 12, color: "#a7f3d0"}}>{info}</div>}
    </div>
  );
}
