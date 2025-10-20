import React from "react";
export default function BetaBanner() {
  const demo = import.meta.env.VITE_DEMO_MODE === "true";
  if (!demo) return null;
  return (
    <div style={{
      background: "#111827",
      color: "white",
      padding: "6px 12px",
      fontSize: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8
    }}>
      <strong style={{letterSpacing:1}}>BETA</strong>
      <span>Demo Mode is enabled — auth is bypassed for protected pages.</span>
    </div>
  );
}
