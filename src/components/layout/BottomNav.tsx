import { NavLink } from "react-router-dom";

const item = "flex-1 text-center py-2 text-sm";
const active = "text-indigo-600 font-semibold";
const inactive = "text-neutral-500";

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-white">
      <div className="mx-auto flex max-w-md">
        <NavLink to="/checkin" className={({isActive}) => `${item} ${isActive?active:inactive}`}>Check In</NavLink>
        <NavLink to="/matches" className={({isActive}) => `${item} ${isActive?active:inactive}`}>Matches</NavLink>
        <NavLink to="/chats" className={({isActive}) => `${item} ${isActive?active:inactive}`}>Chats</NavLink>
        <NavLink to="/profile" className={({isActive}) => `${item} ${isActive?active:inactive}`}>Profile</NavLink>
      </div>
    </nav>
  );
}
