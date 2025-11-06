import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { addMatch } from "../lib/matchStore";

type UserProfile = {
  id: string;
  name: string;
  photoURL?: string;
  checkedInVenueId?: string;
};

const demoPeople: UserProfile[] = [
  { id: "u1", name: "Sam 101", photoURL: "https://api.dicebear.com/7.x/thumbs/svg?seed=1" },
  { id: "u2", name: "Alex 102", photoURL: "https://api.dicebear.com/7.x/thumbs/svg?seed=2" },
  { id: "u3", name: "Jordan 103", photoURL: "https://api.dicebear.com/7.x/thumbs/svg?seed=3" }
];

export default function ActiveVenue() {
  const { id } = useParams();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();
  const demo = import.meta.env.VITE_DEMO_MODE === "true";

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      try {
        if (!id) { setUsers([]); return; }
        const q = query(collection(db, "users"), where("checkedInVenueId", "==", id));
        const snap = await getDocs(q);
        if (ignore) return;
        const list: UserProfile[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        if (list.length === 0 && demo) {
          // Fallback to demo people in demo mode
          setUsers(demoPeople.map(p => ({ ...p, checkedInVenueId: id })));
        } else {
          setUsers(list);
        }
      } catch (e) {
        console.error("Failed to load users for venue", id, e);
        setUsers(demo ? demoPeople.map(p => ({ ...p, checkedInVenueId: id })) : []);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, [db, id, demo]);

  const likeUser = (u: UserProfile) => {
    addMatch({
      id: `m-${Date.now()}-${u.id}`,
      youId: "you",
      otherId: u.id,
      otherName: u.name || "Guest",
      otherAvatar: u.photoURL,
      venueId: id,
      createdAt: Date.now(),
      messages: []
    });
    alert(`You liked ${u.name || "this person"} (saved to Matches)`);
  };

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>People at this venue</h1>
      {loading ? (
        <div>Loading…</div>
      ) : users.length === 0 ? (
        <div style={{ color: "#666" }}>No one is currently checked in.</div>
      ) : (
        <ul style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          {users.map(u => (
            <li key={u.id} style={{ padding: 16, border: "1px solid #eee", borderRadius: 12, background: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <img
                  src={u.photoURL || "https://api.dicebear.com/7.x/thumbs/svg?seed=anon"}
                  alt={u.name || "Guest"}
                  style={{ width: 48, height: 48, borderRadius: "50%" }}
                />
                <div style={{ fontWeight: 600 }}>{u.name || "Guest"}</div>
              </div>
              <button
                onClick={() => likeUser(u)}
                style={{
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: 8,
                  cursor: "pointer"
                }}
              >
                Like
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
