import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "../lib/toast";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const KEY = "mingle_checkedin_v1"; // { venueId, venueName, ts }

export default function CheckIn() {
  const q = useQuery();
  const navigate = useNavigate();

  const venueId = q.get("id") || "";
  const venueName = q.get("name") || "";

  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const o = JSON.parse(raw);
      if (o?.venueId && o?.venueId === venueId) setChecked(true);
    } catch {}
  }, [venueId]);

  function onCheckIn() {
    if (!venueId) {
      toast("Please select a venue from the list first.");
      return;
    }
    try {
      localStorage.setItem(KEY, JSON.stringify({ venueId, venueName, ts: Date.now() }));
    } catch {}
    toast(`Checked in to ${venueName || venueId}`);
    if (venueId) navigate(`/venues/${venueId}`);
  }

  return (
    <div className="mx-auto max-w-xl p-4 sm:p-6">
      <h1 className="mb-2 text-2xl font-semibold">Check In</h1>
      <p className="text-sm text-neutral-600">
        {venueName ? `Venue: ${venueName}` : "Select a venue from the list to check in."}
      </p>

      <button
        onClick={onCheckIn}
        className="mt-6 w-full rounded-xl bg-violet-600 px-4 py-3 font-medium text-white hover:bg-violet-500"
      >
        {checked ? "Re-check in" : "Check in now"}
      </button>
    </div>
  );
}
