import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLiked, unlikeVenue } from "../lib/demoStore";

export default function Matches() {
  const [list, setList] = useState(getLiked());

  useEffect(() => { setList(getLiked()); }, []);

  const remove = (id: string) => {
    unlikeVenue(id);
    setList(getLiked());
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Your matches</h1>
      {list.length === 0 ? (
        <p>No likes yet. Go <Link to="/venues">like some venues</Link>.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
          {list.map(v => (
            <li key={v.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
              <div style={{ fontWeight: 600 }}>{v.name}</div>
              <div style={{ fontSize: 13, color: "#666" }}>{v.description}</div>
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <Link to={`/venues/${v.id}`}>Open</Link>
                <button onClick={() => remove(v.id)}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
