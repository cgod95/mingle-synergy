import React from "react";
import { useParams, Link } from "react-router-dom";
import { getMatches } from "../lib/matchStore";

export default function ChatStub() {
  const { id } = useParams();
  const person = getMatches().find((p) => p.id === id);
  return (
    <main style={{ padding: 24 }}>
      <h1>Chat (demo)</h1>
      {person ? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src={person.photo}
              alt={person.name}
              width={48}
              height={48}
              style={{ borderRadius: "50%" }}
            />
            <div>
              <div style={{ fontWeight: 600 }}>{person.name}</div>
              <div style={{ fontSize: 13, color: "#666" }}>{person.age}</div>
            </div>
          </div>
          <div style={{ marginTop: 16, padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
            <p style={{ margin: 0, color: "#666" }}>
              Messaging will go here in the MVP (this is a stub).
            </p>
          </div>
        </>
      ) : (
        <p>Unknown chat. Go back to <Link to="/matches">matches</Link>.</p>
      )}
    </main>
  );
}
