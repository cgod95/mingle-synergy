import React from "react";
import { Link } from "react-router-dom";
import SafeImg from "../common/SafeImg";
import { loadProfile } from "../../lib/profileStore";

export default function Header() {
  const p = loadProfile();
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b">
      <Link to="/" className="font-semibold text-xl">Mingle</Link>
      <Link to="/profile">
        <SafeImg
          src={p.photo || "/avatar-fallback.png"}
          className="h-8 w-8 rounded-full object-cover ring-1 ring-black/10"
        />
      </Link>
    </header>
  );
}
