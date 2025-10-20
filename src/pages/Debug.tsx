import React, { useState } from "react";
import { getLiked, unlikeVenue } from "../lib/demoStore";

export default function Debug() {
  const [count, setCount] = useState(getLiked().length);

  const clearLikes = () => {
    getLiked().forEach(v => unlikeVenue(v.id));
    setCount(getLiked().length);
    alert("Cleared likes");
  };

  const clearAll = () => {
    localStorage.clear();
    setCount(0);
    alert("Cleared localStorage");
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Debug</h1>
      <p>Liked venues: {count}</p>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={clearLikes}>Clear likes</button>
        <button onClick={clearAll}>Clear ALL local storage</button>
      </div>
    </main>
  );
}
