import React, { useState } from "react";
import { Link } from "react-router-dom";
import { VENUES } from "../data/venues";
import { likeVenue } from "../lib/demoStore";

export default function VenueList() {
  const [venues, setVenues] = useState([...VENUES]);

  const handleLike = (v: (typeof VENUES)[number]) => {
    likeVenue(v);
    setVenues(prev => prev.filter(x => x.id !== v.id));
    alert(`Liked: ${v.name}`);
  };

  const handleSkip = (vId: string) => {
    setVenues(prev => prev.filter(x => x.id !== vId));
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Venues</h1>
      {venues.length === 0 ? (
        <p>No more venues. Check your <Link to="/matches">matches</Link>.</p>
      ) : (
        <ul style={{ display: "grid", gap: 12, listStyle: "none", padding: 0 }}>
          {venues.map((v) => (
            <li key={v.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
              <div style={{ fontWeight: 600 }}>{v.name}</div>
              {v.description && <div style={{ fontSize: 13, color: "#666" }}>{v.description}</div>}
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <Link to={`/venues/${v.id}`}>Details</Link>
                <button onClick={() => handleLike(v)}>Like</button>
                <button onClick={() => handleSkip(v.id)}>Skip</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
