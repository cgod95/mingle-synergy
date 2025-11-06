import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, signOutUser } = useAuth();
  return (
    <main style={{ padding: 24 }}>
      <h1>Profile</h1>
      {user ? (
        <>
          <p><strong>UID:</strong> {user.uid}</p>
          <p><strong>Email:</strong> {user.email ?? "—"}</p>
          <button onClick={signOutUser} style={{ marginTop: 12, padding: "6px 10px" }}>
            Sign Out
          </button>
        </>
      ) : (
        <p>Not signed in.</p>
      )}
    </main>
  );
}
