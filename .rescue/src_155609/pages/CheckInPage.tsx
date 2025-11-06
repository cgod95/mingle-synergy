import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getVenue, getVenues } from "../lib/demoVenues";
import { checkInAt, getCheckedVenueId, isCheckedIn, clearCheckIn } from "../lib/checkinStore";

export default function CheckInPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const idFromQuery = params.get("id") || "";
  const [selectedId, setSelectedId] = useState<string>(idFromQuery);

  const venues = useMemo(() => getVenues(), []);
  const venue = useMemo(() => (selectedId ? getVenue(selectedId) : undefined), [selectedId]);

  const checkedVenueId = getCheckedVenueId();
  const alreadyHere = isCheckedIn(selectedId);

  function onSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value;
    setSelectedId(v);
    if (v) setParams({ id: v });
  }

  function onCheckIn() {
    if (!selectedId) return;
    checkInAt(selectedId);
    // UX: go to venue details after check-in
    navigate(`/venues/${selectedId}`);
  }

  function onClear() {
    clearCheckIn();
    window.location.reload();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="text-xl font-semibold">Check in to a venue</h2>
      <p className="mt-1 text-neutral-600">
        Choose where you are now. Checking in unlocks people at that venue.
      </p>

      <div className="mt-5 rounded-xl border bg-white p-4">
        <label className="block text-sm font-medium">Select a venue</label>
        <select
          className="mt-2 w-full rounded-lg border px-3 py-2"
          value={selectedId}
          onChange={onSelect}
        >
          <option value="">— Choose —</option>
          {venues.map(v => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>

        <div className="mt-4 text-sm text-neutral-700">
          {venue ? (
            <>
              <div className="font-medium">{venue.name}</div>
              <div className="text-neutral-500">{venue.location || "Nearby"}</div>
            </>
          ) : (
            <div className="text-neutral-500">No venue selected.</div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onCheckIn}
            disabled={!selectedId}
            className="rounded-xl bg-indigo-600 px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            {alreadyHere ? "Re-check in" : "Check in now"}
          </button>

          {checkedVenueId && (
            <button
              onClick={onClear}
              className="rounded-xl border px-4 py-2 font-medium text-neutral-700"
            >
              Clear current check-in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
