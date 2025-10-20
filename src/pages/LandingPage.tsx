import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Welcome to Mingle</h1>
      <p>Private beta build. Pick a path:</p>
      <p>
        <Link to="/sign-up">Sign up</Link> ·{" "}
        <Link to="/sign-in">Sign in</Link> ·{" "}
        <Link to="/venues">Venues</Link> ·{" "}
        <Link to="/profile">Profile</Link>
      </p>
    </main>
  );
}
