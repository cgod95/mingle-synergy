import React from "react";
import { Link } from "react-router-dom";
import { getAllVenues } from "../lib/api";

export default function Venues() {
  const venues = getAllVenues();

  return (
    <main style={{ padding: "24px", maxWidth: "860px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "16px" }}>Venues</h1>
      {venues.length === 0 ? (
        <p>No venues found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "12px" }}>
          {venues.map((venue) => (
            <li
              key={venue.id}
              style={{
                border: "1px solid #eee",
                borderRadius: "8px",
                padding: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{venue.name}</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>{venue.location}</div>
              </div>
              <Link
                to={`/venues/${venue.id}`}
                style={{
                  background: "#111",
                  color: "#fff",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  textDecoration: "none",
                }}
              >
                View
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
