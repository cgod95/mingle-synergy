import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SafeImg from "../common/SafeImg";
import { getVenue, listPeopleForVenue } from "../../lib/api";
import { likePerson, isMatched, ensureDemoLikesSeed } from "../../lib/likesStore";

export default function VenueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const venue = useMemo(() => (id ? getVenue(id) : undefined), [id]);
  const [refreshKey, setRefreshKey] = useState(0);

  ensureDemoLikesSeed();

  const people = useMemo(() => {
    if (!venue?.id) return [];
    return listPeopleForVenue(venue.id);
  }, [venue?.id, refreshKey]);

  if (!venue) {
    return (
      <div className="mx-auto max-w-xl p-4">
        <h1 className="text-xl font-semibold">Venue not found</h1>
        <button
          onClick={() => navigate("/venues")}
          className="mt-4 rounded-lg border px-4 py-2"
        >
          Back to list
        </button>
      </div>
    );
  }

  function handleLike(personId: string) {
    const matched = likePerson(personId);
    setRefreshKey((x) => x + 1);
    if (matched) alert(`🎉 You and ${personId} matched!`);
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="relative aspect-[16/9] w-full">
          <SafeImg
            src={venue.image}
            alt={venue.name}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between pointer-events-none">
            <div className="pointer-events-none">
              <h1 className="text-2xl font-semibold text-white drop-shadow">
                {venue.name}
              </h1>
              <p className="mt-1 max-w-2xl text-white/90 drop-shadow">
                {venue.description || "—"}
              </p>
            </div>
            <button
              onClick={() =>
                navigate(
                  `/checkin?id=${encodeURIComponent(venue.id)}&name=${encodeURIComponent(venue.name)}`
                )
              }
              className="pointer-events-auto rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-500"
            >
              Check in
            </button>
          </div>
        </div>

        <div className="p-4">
          <h2 className="mb-3 text-lg font-semibold">People here</h2>
          {!people.length && (
            <div className="rounded-lg border bg-neutral-50 p-4 text-neutral-700">
              No one is displayed here yet.
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {people.map((p) => {
              const matched = isMatched(p.id);
              return (
                <div
                  key={p.id}
                  className="overflow-hidden rounded-xl border relative group"
                >
                  <SafeImg
                    src={p.photo || "/assets/avatars/default.png"}
                    alt={p.name}
                    className="aspect-square w-full object-cover"
                    loading="lazy"
                  />
                  <div className="p-2 text-sm font-medium flex justify-between items-center">
                    <span>{p.name}</span>
                    <button
                      onClick={() => handleLike(p.id)}
                      className={`rounded-full px-2 py-1 text-xs font-medium transition ${
                        matched
                          ? "bg-green-500 text-white"
                          : "bg-indigo-600 text-white hover:bg-indigo-500"
                      }`}
                    >
                      {matched ? "Matched" : "Like"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
