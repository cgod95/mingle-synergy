import { NavLink } from "react-router-dom";
import { Home, MapPin, User } from "lucide-react";

export default function BottomNav() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center text-xs ${isActive ? "text-indigo-600" : "text-gray-500"}`;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2">
      <NavLink to="/check-in" className={linkClass}>
        <MapPin size={22} />
        Check In
      </NavLink>
      <NavLink to="/matches" className={linkClass}>
        <Home size={22} />
        Matches
      </NavLink>
      <NavLink to="/profile" className={linkClass}>
        <User size={22} />
        Profile
      </NavLink>
    </nav>
  );
}
