import { Link, NavLink } from "react-router-dom";
import { getCheckedVenueId } from "../../lib/checkinStore";
import { getVenue } from "../../lib/demoVenues";

function Badge({ count }: { count?: number }) {
  if (!count) return null;
  return (
    <span className="ml-1 rounded-full bg-rose-600 px-1.5 text-[10px] font-semibold leading-4 text-white">
      {count}
    </span>
  );
}

export default function Header() {
  const checked = getCheckedVenueId();
  const venue = checked ? getVenue(checked) : undefined;

  return (
    <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link to="/" className="inline-flex items-center gap-2 font-semibold">
          <span className="inline-grid h-7 w-7 place-items-center rounded-xl bg-indigo-600 text-xs text-white">m</span>
          mingle
        </Link>

        <nav className="hidden gap-6 md:flex">
          <NavLink to="/checkin" className={({isActive}) => `text-sm ${isActive ? "font-semibold text-indigo-700" : "text-neutral-600 hover:text-neutral-900"}`}>
            {venue ? `Checked in: ${venue.name}` : "Check In"}
          </NavLink>
          <NavLink to="/matches" className={({isActive}) => `text-sm ${isActive ? "font-semibold text-indigo-700" : "text-neutral-600 hover:text-neutral-900"}`}>
            Matches <Badge count={3} />
          </NavLink>
          <NavLink to="/chat" className={({isActive}) => `text-sm ${isActive ? "font-semibold text-indigo-700" : "text-neutral-600 hover:text-neutral-900"}`}>
            Chat <Badge count={3} />
          </NavLink>
        </nav>

        <Link to="/profile" className="rounded-full border px-3 py-1.5 text-sm hover:bg-neutral-50">
          Profile
        </Link>
      </div>
    </header>
  );
}
