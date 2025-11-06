const fs = require('fs');
const p = 'src/components/venue/VenueDetails.tsx';
if (!fs.existsSync(p)) {
  console.error('❌ Missing src/components/venue/VenueDetails.tsx');
  process.exit(1);
}

let s = fs.readFileSync(p, 'utf8');

if (!/likePerson/.test(s)) {
  s = `
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { likePerson, addMatch, Person, getMatches } from "../../lib/matchStore";

export default function VenueDetails() {
  const [people, setPeople] = useState<Person[]>([
    { id: "1", name: "Ava", age: 27, photo: "https://picsum.photos/seed/a/120/120" },
    { id: "2", name: "Noah", age: 29, photo: "https://picsum.photos/seed/b/120/120" },
    { id: "3", name: "Mia", age: 25, photo: "https://picsum.photos/seed/c/120/120" },
  ]);
  const [message, setMessage] = useState<string>("");

  const handleLike = (p: Person) => {
    likePerson(p);
    // 50% chance of instant match (demo)
    if (Math.random() > 0.5) {
      addMatch(p);
      setMessage(\`🎉 You matched with \${p.name}!\`);
    } else {
      setMessage(\`You liked \${p.name}\`);
    }
    setTimeout(() => setMessage(""), 2000);
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>People at this Venue</h1>
      <p>Demo profiles — Like someone to see how matches work.</p>
      {message && <div style={{ color: "#2a6", marginBottom: 12 }}>{message}</div>}
      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
        {people.map((p) => (
          <li key={p.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img
                src={p.photo}
                alt={p.name}
                width={64}
                height={64}
                style={{ borderRadius: "50%" }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: 13, color: "#666" }}>{p.age}</div>
              </div>
              <button onClick={() => handleLike(p)}>Like</button>
            </div>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 16 }}>
        <Link to="/matches">View Matches</Link>
      </div>
    </main>
  );
}
`;
  fs.writeFileSync(p, s);
  console.log('✅ VenueDetails.tsx replaced with demo match-enabled version');
} else {
  console.log('ℹ️ VenueDetails already patched or contains likePerson logic');
}
