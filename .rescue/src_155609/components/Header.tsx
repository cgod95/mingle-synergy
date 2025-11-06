import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const CHECKIN_KEY = "mingle_checkedin_v1";

export default function Header() {
  const navigate = useNavigate();
  const [venue, setVenue] = useState<{ venueId: string; venueName?: string } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHECKIN_KEY);
      if (!raw) return;
      const o = JSON.parse(raw);
      if (o?.venueId) setVenue({ venueId: o.venueId, venueName: o.venueName });
    } catch {}
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link to="/" className="font-semibold">Mingle</Link>
        <div className="flex items-center gap-2">
          {venue?.venueId && (
            <button
              onClick={() => navigate(`/venues/${venue.venueId}`)}
              className="hidden rounded-full border px-3 py-1 text-xs text-neutral-700 hover:bg-neutral-50 sm:inline-flex"
              title="Go to your current venue"
            >
              Checked in: <span className="ml-1 font-medium">{venue.venueName || venue.venueId}</span>
            </button>
          )}
          <nav className="flex items-center gap-1">
            <Link to="/venues" className="rounded-full px-3 py-1 text-sm hover:bg-neutral-100">Check In</Link>
            <Link to="/matches" className="rounded-full px-3 py-1 text-sm hover:bg-neutral-100">Matches</Link>
            <Link to="/chat" className="rounded-full px-3 py-1 text-sm hover:bg-neutral-100">Chat</Link>
            <Link to="/profile" className="rounded-full px-3 py-1 text-sm hover:bg-neutral-100">Profile</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
