import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading, isDemo } = useAuth();

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

  // demo safety: allow if demo-auth persisted
  if (isDemo && (user || sessionStorage.getItem("demo-auth") === "1")) {
    return children;
  }

  if (!user) return <Navigate to="/sign-in" replace />;
  return children;
}
