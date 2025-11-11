import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function SignUp() {
  const { signUpUser } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await signUpUser(email, password);
      // New users should go through onboarding flow
      nav("/onboarding");
    } catch (e: any) {
      setErr(e?.message || "Failed to sign up");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main style={{ padding: 24, maxWidth: 420, margin: "0 auto" }}>
      <h1>Create account</h1>
      <form onSubmit={submit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <input
          placeholder="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: 10 }}
        />
        <input
          placeholder="Password (min 6 chars)"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
          style={{ padding: 10 }}
        />
        <button type="submit" disabled={busy} style={{ padding: 10 }}>
          {busy ? "Creating…" : "Create account"}
        </button>
        {err && <div style={{ color: "crimson", fontSize: 12 }}>{err}</div>}
      </form>
      <p style={{ marginTop: 12 }}>
        Have an account? <Link to="/signin">Sign in</Link>
      </p>
    </main>
  );
}
