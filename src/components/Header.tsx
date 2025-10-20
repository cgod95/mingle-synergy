import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkStyle: React.CSSProperties = { textDecoration: "none", padding: "6px 10px", borderRadius: 8 };
const activeStyle: React.CSSProperties = { background: "#eee" };

export default function Header() {
  const { user, loading, signOutUser } = useAuth();
  const loc = useLocation();

  return (
    <header style={{ borderBottom: "1px solid #eee", padding: "12px 16px", position: "sticky", top: 0, background: "#fff", zIndex: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, maxWidth: 1100, margin: "0 auto", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <NavLink to="/" style={linkStyle}>Mingle</NavLink>
          <nav style={{ display: "flex", gap: 8 }}>
            <NavLink to="/venues" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeStyle : {}) })}>Venues</NavLink>
            <NavLink to="/pair" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeStyle : {}) })}>Pair</NavLink>
            <NavLink to="/profile" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeStyle : {}) })}>Profile</NavLink>
            <NavLink to="/feedback" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeStyle : {}) })}>Feedback</NavLink>
          </nav>
        </div>

        <div>
          {loading ? (
            <span style={{ color: "#666" }}>…</span>
          ) : user ? (
            <button onClick={signOutUser} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff" }}>
              Sign out
            </button>
          ) : (
            <>
              {loc.pathname !== "/sign-in" && (
                <NavLink to="/sign-in" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeStyle : {}) })}>Sign in</NavLink>
              )}
              {loc.pathname !== "/sign-up" && (
                <NavLink to="/sign-up" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeStyle : {}) })}>Sign up</NavLink>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
