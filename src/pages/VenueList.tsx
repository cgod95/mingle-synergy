import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { listVenues } from "../lib/demoVenues";
import SafeImg from "../components/common/SafeImg";

export default function VenueList() {
  const navigate = useNavigate();
  const venues = useMemo(() => listVenues(), []);

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="text-2xl font-semibold">Check In</h1>
      <p className="mt-1 text-neutral-600">Pick a venue to view or check in.</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {venues.map((v) => (
          <div key={v.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="relative h-40 w-full">
              <SafeImg
                src={v.image || "/placeholder-venue.jpg"}
                alt={v.name}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex items-center justify-between p-3">
              <div className="min-w-0">
                <div className="truncate font-medium">{v.name}</div>
                <div className="truncate text-sm text-neutral-600">{v.description || "—"}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/venue/${v.id}`)}
                  className="rounded-full border px-3 py-2 text-sm"
                >
                  View
                </button>
                <button
                  onClick={() =>
                    navigate(`/checkin?id=${encodeURIComponent(v.id)}&name=${encodeURIComponent(v.name)}`)
                  }
                  className="rounded-full bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                >
                  Check in
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
