import React from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getPeopleAtVenue,
  getCheckedInVenue,
  checkIn,
  likePerson,
  getMatches,
} from "../../services/demoPresence";

export default function VenueDetails() {
  const { id: venueIdParam } = useParams();
  const venueId = venueIdParam || "bar-101";

  return (
    <main style={{ padding: 24 }}>
      <h1>Venue</h1>
      <div style={{ color: "#666", marginBottom: 8 }}>ID: {venueId}</div>

      {import.meta.env.VITE_DEMO_MODE === "true" ? (
        <DemoPeopleSection venueId={venueId} />
      ) : (
        <div>Live mode not yet implemented here.</div>
      )}
    </main>
  );
}

function DemoPeopleSection({ venueId }: { venueId: string }) {
  const { user } = useAuth();
  const uid = user?.uid || "demo-user";

  const initiallyChecked =
    getCheckedInVenue(uid) === venueId;

  const [checkedIn, setCheckedIn] = React.useState(initiallyChecked);
  const [likeNotice, setLikeNotice] = React.useState<string | null>(null);
  const [matchNotice, setMatchNotice] = React.useState<string | null>(null);

  const roster = getPeopleAtVenue(venueId);
  const matches = getMatches(uid, venueId);

  const handleCheckIn = () => {
    checkIn(uid, venueId);
    setCheckedIn(true);
  };

  const handleLike = (pid: string, name: string) => {
    likePerson(uid, venueId, pid);
    setLikeNotice(`You liked ${name}`);
    const m = getMatches(uid, venueId).find((x) => x.id === pid);
    if (m) setMatchNotice(`It's a match with ${name}!`);
    setTimeout(() => {
      setLikeNotice(null);
      setMatchNotice(null);
    }, 1500);
  };

  return (
    <section style={{ marginTop: 16 }}>
      {!checkedIn ? (
        <button
          onClick={handleCheckIn}
          style={{
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Check in here
        </button>
      ) : (
        <div style={{ margin: "8px 0", fontSize: 12, color: "#2a6" }}>
          Checked in (demo)
        </div>
      )}

      <h3 style={{ marginTop: 12 }}>People here (demo)</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))",
          gap: 12,
        }}
      >
        {roster.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #eee",
              borderRadius: 12,
              padding: 12,
              background: "#fff",
            }}
          >
            <img
              src={p.photo}
              alt={p.name}
              style={{
                width: "100%",
                height: 120,
                objectFit: "cover",
                borderRadius: 8,
              }}
            />
            <div style={{ fontWeight: 600, marginTop: 8 }}>{p.name}</div>
            <div style={{ fontSize: 12, color: "#555" }}>{p.bio || ""}</div>
            <button
              onClick={() => handleLike(p.id, p.name)}
              style={{
                marginTop: 8,
                width: "100%",
                padding: "6px 10px",
                border: "1px solid #ddd",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Like
            </button>
          </div>
        ))}
      </div>

      {matches.length ? (
        <div
          style={{
            marginTop: 12,
            padding: 10,
            background: "#f6fff6",
            border: "1px solid #dfe",
            borderRadius: 8,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Matches (demo)</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {matches.map((m) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  border: "1px solid #eee",
                  borderRadius: 8,
                  padding: "6px 8px",
                  background: "#fff",
                }}
              >
                <img
                  src={m.photo}
                  alt={m.name}
                  style={{ width: 28, height: 28, borderRadius: "50%" }}
                />
                <span style={{ fontSize: 13 }}>{m.name}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {likeNotice ? (
        <div style={{ marginTop: 8, fontSize: 12 }}>{likeNotice}</div>
      ) : null}
      {matchNotice ? (
        <div style={{ marginTop: 4, fontSize: 12, color: "#2a6" }}>
          {matchNotice}
        </div>
      ) : null}
    </section>
  );
}
