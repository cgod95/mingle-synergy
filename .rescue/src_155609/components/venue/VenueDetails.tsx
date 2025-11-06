import { useMemo } from "react";
import SafeImg from "../components/common/SafeImg";
import { useNavigate, useParams } from "react-router-dom";
import { getVenue } from "../../lib/demoVenues";
import { getPerson } from "../../lib/demoPeople";
import { likePerson } from "../../lib/likesStore";
import { toast } from "../../lib/toast";

function Card({ children }: React.PropsWithChildren) {
  return <div className="rounded-2xl border bg-white p-4 shadow-sm">{children}</div>;
}

export default function VenueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const venue = useMemo(() => (id ? getVenue(id) : undefined), [id]);

  const people = useMemo(() => {
    if (!venue) return [];
    return venue.checkedInIds
      .map((pid) => getPerson(pid))
      .filter(Boolean) as ReturnType<typeof getPerson>[];
  }, [venue]);

  if (!venue) {
    return (
      <div className="mx-auto max-w-3xl p-4">
        <Card>Venue not found.</Card>
      </div>
    );
  }

  const onCheckIn = () => navigate(`/checkin?id=${venue.id}&name=${encodeURIComponent(venue.name)}`);

  const onLike = (pid: string) => {
    likePerson(pid); // this handles “like sent” and potential match later
    toast("Like sent! If they like you back, you'll match.");
  };

  return (
    <div className="mx-auto max-w-3xl p-4 space-y-4">
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="relative aspect-[16/9] w-full">
          <img src={venue.image} alt={venue.name} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white drop-shadow">{venue.name}</h1>
              <p className="mt-1 max-w-xl text-white/90 drop-shadow">{venue.blurb}</p>
            </div>
            <button
              onClick={onCheckIn}
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-500"
            >
              Check in
            </button>
          </div>
        </div>
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">People checked in</h2>
          <span className="text-sm text-neutral-500">{people.length} here</span>
        </div>
        {people.length === 0 ? (
          <p className="text-sm text-neutral-600">No one visible right now.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {people.map((p) => (
              <div key={p.id} className="overflow-hidden rounded-xl border bg-white">
                <div className="aspect-square w-full overflow-hidden">
                  <img
                    src={p.photo || "/avatar-fallback.png"}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="truncate font-medium">{p.name}</div>
                    <button
                      onClick={() => onLike(p.id)}
                      className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-white hover:bg-neutral-800"
                    >
                      Like
                    </button>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{p.bio || "—"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
