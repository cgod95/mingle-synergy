import { NavLink } from "react-router-dom";

const item = (isActive:boolean) =>
  `flex-1 py-2 text-center text-sm ${isActive ? "font-semibold text-indigo-700" : "text-neutral-600"}`;

export default function BottomTab() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t bg-white md:hidden">
      <div className="mx-auto flex w-full max-w-6xl px-2">
        <NavLink to="/checkin" className={({isActive}) => item(isActive)}>Check In</NavLink>
        <NavLink to="/matches" className={({isActive}) => item(isActive)}>Matches</NavLink>
        <NavLink to="/chat" className={({isActive}) => item(isActive)}>Chat</NavLink>
        <NavLink to="/profile" className={({isActive}) => item(isActive)}>Profile</NavLink>
      </div>
    </nav>
  );
}
