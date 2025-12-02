import React from "react";
import { useParams, Link } from "react-router-dom";

// Minimal local data import. Adjust path if your venues file lives elsewhere.
import { VENUES } from "../data/venues";

export default function PublicVenue() {
  const { id } = useParams();
  const venue = VENUES.find(v => String(v.id) === String(id));

  if (!venue) {
    return (
      <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
        <h1>Venue not found</h1>
        <p>We couldn’t find that venue.</p>
        <p><Link to="/checkin">Browse venues</Link></p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {venue.image ? (
          <img
            src={venue.image}
            alt={venue.name}
            style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 12 }}
          />
        ) : null}
        <div>
          <h1 style={{ margin: 0 }}>{venue.name}</h1>
          {venue.address ? (
            <div style={{ color: "#666", fontSize: 14 }}>{venue.address}</div>
          ) : null}
          {Array.isArray(venue.tags) && venue.tags.length > 0 ? (
            <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {venue.tags.map((t: string) => (
                <span
                  key={t}
                  style={{
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: "#f2f2f2",
                    fontSize: 12
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </header>

      {venue.description ? (
        <p style={{ marginTop: 16, lineHeight: 1.6 }}>{venue.description}</p>
      ) : null}

      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <Link
          to={`/venues/${venue.id}`}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: "black",
            color: "white",
            textDecoration: "none"
          }}
        >
          Open in app
        </Link>
        <Link to="/checkin" style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd" }}>
          Browse more venues
        </Link>
      </div>
    </main>
  );
}
