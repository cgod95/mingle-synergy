import React, { useMemo } from "react";
import SafeImg from "../common/SafeImg";
import { useNavigate, useParams } from "react-router-dom";
import { getVenue, listPeopleForVenue, type Person } from "../../lib/api";

export default function VenueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Try to find the venue from demo data
  const venue = useMemo(() => getVenue(id ?? ""), [id]);
  const people: Person[] = useMemo(() => listPeopleForVenue(id), [id]);

  // If the venue isn’t found, show a friendly fallback
  if (!venue) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold">Venue not found</h2>
        <button
          className="mt-4 rounded-lg bg-black px-4 py-2 text-white"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Venue header */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="relative aspect-[16/9] w-full">
          <SafeImg
            src={venue.image}
            alt={venue.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <h1 className="text-2xl font-bold text-white drop-shadow-md">
              {venue.name}
            </h1>
            {venue.address && (
              <p className="text-sm text-gray-200">{venue.address}</p>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-700 leading-relaxed">{venue.description}</p>

      {/* Checked-in people */}
      <div>
        <h2 className="mb-2 text-lg font-semibold">Checked-in people</h2>
        {people.length === 0 ? (
          <p className="text-sm text-gray-500">
            No one has checked in yet. Be the first!
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {people.map((p) => (
              <div
                key={p.id}
                className="flex flex-col items-center rounded-xl border p-3 shadow-sm"
              >
                <SafeImg
                  src={p.photo}
                  alt={p.name}
                  className="h-24 w-24 rounded-full object-cover mb-2"
                />
                <p className="text-sm font-medium">{p.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
