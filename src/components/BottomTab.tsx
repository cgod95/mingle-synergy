import React from "react";
import { NavLink, Link, useLocation } from "react-router-dom";

const itemBase = "flex-1 inline-flex items-center justify-center gap-2 py-2 text-sm font-medium";
const active = "text-indigo-600";
const idle = "text-neutral-500 hover:text-neutral-300";

export default function BottomTab() {
  const location = useLocation();
  return (
    <nav className="sticky bottom-0 inset-x-0 border-t border-neutral-700/50 nav-blur-ios">
      <div className="mx-auto max-w-6xl grid grid-cols-4">
        <NavLink to="/checkin" className={({isActive}) => [itemBase, isActive?active:idle].join(" ")}>Venues</NavLink>
        <NavLink to="/matches" className={({isActive}) => [itemBase, isActive?active:idle].join(" ")}>Matches</NavLink>
        <NavLink to="/matches" className={({isActive}) => [itemBase, isActive?active:idle].join(" ")}>Chat</NavLink>
        <NavLink to="/profile" className={({isActive}) => [itemBase, isActive?active:idle].join(" ")}>Profile</NavLink>
      </div>
    </nav>
  );
}
