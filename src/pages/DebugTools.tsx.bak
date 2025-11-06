import React from "react";
import { Link } from "react-router-dom";

export default function DebugTools() {
  const [count, setCount] = React.useState(getMatchCount());

  const seed = () => {
    setCount(getMatchCount());
  };

  const clear = () => {
    clearAllMatches();
    setCount(getMatchCount());
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Debug Tools</h1>
      <p>Seed or clear demo matches for quick testing.</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={seed}>Seed 3 matches</button>
        <button onClick={clear} style={{ background: "#fee2e2" }}>
          Clear matches
        </button>
      </div>

      <div>Current matches: {count}</div>
      <div style={{ marginTop: 12 }}>
        <Link to="/matches">Go to Matches</Link>
      </div>
    </main>
  );
}
