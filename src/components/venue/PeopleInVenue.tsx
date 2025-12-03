import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { demoPeopleForVenue, type Person } from "../../lib/demoPeople";
import { ensureMatchFor, addMessage } from "../../lib/matchStore";

export default function PeopleInVenue({ venueId }: { venueId: string }) {
  const navigate = useNavigate();
  const people: Person[] = useMemo(() => demoPeopleForVenue(venueId), [venueId]);
  const [notice, setNotice] = useState("");

  const handleLike = (p: Person) => {
    const avatar = p.photo || p.avatar || ''; // Use photo property from demoPeople Person type
    const matchId = ensureMatchFor("you", p.id, p.name, avatar, venueId);
    addMessage(matchId, { sender: "you", text: "👋 Hey " + p.name.split(" ")[0] + "!" });
    setNotice("Matched with " + p.name + ". Opening chat…");
    setTimeout(() => navigate("/chat/" + matchId), 350);
  };

  if (!people.length) {
    return (
      <section>
        <h3 style={{ margin: "16px 0 8px" }}>People here (demo)</h3>
        <div style={{ fontSize: 14, color: "#6b7280" }}>No one visible here yet.</div>
      </section>
    );
  }

  return (
    <section>
      <h3 style={{ margin: "16px 0 8px" }}>People here (demo)</h3>
      {notice && (
        <div style={{ marginBottom: 12, color: "#065f46", fontSize: 13, background: "#ecfdf5", padding: "8px 10px", borderRadius: 8 }}>
          {notice}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 16 }}>
        {people.map((p) => (
          <div key={p.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img src={p.photo || p.avatar || ''} alt={p.name} width={48} height={48} style={{ borderRadius: "50%", border: "1px solid #eee" }} />
              <div>
                <div style={{ fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{p.bio || "—"}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                onClick={() => handleLike(p)}
                style={{ padding: "8px 12px", border: "none", borderRadius: 8, background: "#2563eb", color: "white" }}
              >
                Like & Chat
              </button>
              <button
                onClick={() => alert("👋 Skipped (demo)")}
                style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, background: "white" }}
              >
                Skip
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
