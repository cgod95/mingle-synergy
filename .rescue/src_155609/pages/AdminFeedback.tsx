import React, { useEffect, useState } from "react";
import { feedbackRepo } from "../services/feedbackRepo";

type Item = { id?: string; message: string; createdAt: number; from?: string | null };

export default function AdminFeedback() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const list = await feedbackRepo.list();
    setItems(list);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function remove(id?: string) {
    if (!id) return;
    await feedbackRepo.remove(id);
    await load();
  }

  return (
    <main style={{ maxWidth: 800, margin: "24px auto", padding: 16 }}>
      <h1>Feedback (Admin)</h1>
      <button onClick={load} style={{ marginBottom: 12, padding: "8px 12px", borderRadius: 8, border: "1px solid #999" }}>
        Refresh
      </button>
      {loading ? <div>Loading…</div> : (
        <div style={{ display: "grid", gap: 12 }}>
          {items.length === 0 && <div>No feedback yet.</div>}
          {items.map(it => (
            <div key={it.id} style={{ border: "1px solid #e3e3e3", borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 12, color: "#666" }}>
                {new Date(it.createdAt).toLocaleString()} {it.from ? `• ${it.from}` : ""}
              </div>
              <div style={{ whiteSpace: "pre-wrap", margin: "6px 0" }}>{it.message}</div>
              <div>
                <button onClick={() => remove(it.id!)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #c33", color: "#c33" }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
