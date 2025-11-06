import { useParams } from "react-router-dom";
import { getVenueById } from "../lib/demoVenues";
import { likePerson, isMatched, isLiked } from "../lib/likesStore";
import { setCurrentVenue, getCurrentVenue } from "../lib/checkinStore";
import { useEffect, useMemo, useState } from "react";

function Toast({ text }: { text: string }) {
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-black/85 px-4 py-2 text-white text-sm shadow-lg">
      {text}
    </div>
  );
}

export default function VenueDetails() {
  const { id } = useParams<{ id: string }>();
  const venue = useMemo(() => getVenueById(id || ""), [id]);
  const [toast, setToast] = useState<string | null>(null);
  const [checkedIn, setCheckedIn] = useState<string | null>(null);

  useEffect(() => {
    setCheckedIn(getCurrentVenue());
  }, []);

  if (!venue) return <div className="p-4">Venue not found</div>;

  const handleCheckIn = () => {
    setCurrentVenue(venue.id);
    setCheckedIn(venue.id);
    setToast(`Checked in to ${venue.name}`);
    setTimeout(() => setToast(null), 1600);
  };

  const handleLike = (personId: string, personName: string) => {
    const result = likePerson(personId);
    if (result.status === "matched") {
      setToast(`Matched with ${personName} 🎉`);
    } else {
      setToast(`Like sent to ${personName}`);
    }
    setTimeout(() => setToast(null), 1600);
  };

  return (
    <div className="mb-20">
      <div className="relative">
        <img
          src={venue.photo || "/default.jpg"}
          alt={venue.name}
          className="h-56 w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div>
            <h1 className="text-white text-2xl font-semibold drop-shadow">{venue.name}</h1>
            <p className="text-white/90 text-sm">{venue.location}</p>
          </div>
          <button
            onClick={handleCheckIn}
            className="rounded-full bg-white/95 px-4 py-2 text-sm font-medium shadow hover:bg-white"
          >
            {checkedIn === venue.id ? "Checked In" : "Check In"}
          </button>
        </div>
      </div>

      <div className="p-4">
        {venue.about && <p className="text-sm text-neutral-700 mb-4">{venue.about}</p>}

        <h2 className="font-medium mb-3">People here now</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {venue.people.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border overflow-hidden">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={p.photo || "/default-user.jpg"}
                  alt={p.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-2">
                <div className="text-sm font-medium">{p.name}</div>
                {p.bio && <div className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{p.bio}</div>}

                <div className="mt-2 flex items-center justify-between">
                  {isMatched(p.id) ? (
                    <span className="text-xs text-green-600 font-medium">Matched</span>
                  ) : isLiked(p.id) ? (
                    <span className="text-xs text-blue-600">Liked</span>
                  ) : (
                    <span className="text-xs text-neutral-400">—</span>
                  )}
                  <button
                    onClick={() => handleLike(p.id, p.name)}
                    className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-500"
                  >
                    Like
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {toast && <Toast text={toast} />}
    </div>
  );
}
