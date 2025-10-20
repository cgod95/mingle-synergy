import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getCurrentUserProfile,
  saveCurrentUserProfile,
  UserProfile,
} from "../services/firebase/userProfileService";

export default function Profile() {
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState<{ displayName: string; age: string }>({
    displayName: "",
    age: "",
  });

  useEffect(() => {
    (async () => {
      if (!user) return;
      setBusy(true);
      setErr(null);
      try {
        const p = (await getCurrentUserProfile()) as UserProfile | null;
        if (p) {
          setForm({
            displayName: p.displayName ?? "",
            age: p.age != null ? String(p.age) : "",
          });
        }
      } catch (e: any) {
        setErr(e?.message || "Failed to load profile");
      } finally {
        setBusy(false);
      }
    })();
  }, [user]);

  if (loading) return <main style={{ padding: 24 }}>Loading…</main>;
  if (!user) return <main style={{ padding: 24 }}>Please sign in.</main>;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const ageNum =
        form.age.trim() === "" ? null : Math.max(0, Math.floor(Number(form.age)));
      await saveCurrentUserProfile({
        displayName: form.displayName.trim(),
        age: Number.isFinite(ageNum as number) ? (ageNum as number) : null,
      });
      setMsg("Saved!");
    } catch (e: any) {
      setErr(e?.message || "Failed to save profile");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
      <h1>Your profile</h1>
      <form onSubmit={save} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Display name</span>
          <input
            value={form.displayName}
            onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
            placeholder="eg. Callum"
            required
            style={{ padding: 10 }}
          />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Age</span>
          <input
            type="number"
            min={18}
            max={120}
            value={form.age}
            onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
            placeholder="eg. 27"
            style={{ padding: 10 }}
          />
        </label>

        <button type="submit" disabled={busy} style={{ padding: 10 }}>
          {busy ? "Saving…" : "Save"}
        </button>

        {err && <div style={{ color: "crimson", fontSize: 12 }}>{err}</div>}
        {msg && <div style={{ color: "green", fontSize: 12 }}>{msg}</div>}
      </form>
    </main>
  );
}
