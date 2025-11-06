import React from "react";
import { clearMatches, seedDemoMatches, getMatches } from "../lib/matchStore";

export default function DebugTools() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Debug Tools</h1>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          onClick={() => { seedDemoMatches(3); alert(`Seeded. Now have ${getMatches().length} matches.`); }}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff" }}
        >
          Seed 3 matches
        </button>
        <button
          onClick={() => { clearMatches(); alert("Cleared matches."); }}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff" }}
        >
          Clear matches
        </button>
      </div>
    </main>
  );
}
