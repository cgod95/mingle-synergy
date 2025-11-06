import React, { useEffect, useMemo, useState } from "react";
import ImageWithFallback from "@/components/common/ImageWithFallback";
import { listPeopleForVenueForVenue } from "@/lib/demoPeople";
import { likePerson, hasLiked, undoLike } from "@/lib/likes";
import { isCheckedIn } from "@/lib/checkin";
import { on } from "@/lib/bus";
import { isBlocked, blockUser, reportUser } from "@/lib/block";
import { toastError, toastInfo, toastSuccess } from "@/lib/toast";

type Props = { venueId: string };

export default function PeopleInVenue({ venueId }: Props) {
  const [people] = useState(listPeopleForVenueForVenue(venueId));
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const visible = useMemo(() => people.filter(p => !isBlocked(p.id)), [people]);

  useEffect(() => {
    const init: Record<string, boolean> = {};
    for (const p of people) init[p.id] = hasLiked(p.id);
    setLiked(init);
    const off1 = on("likes:changed", () => {
      setLiked(prev => {
        const next = { ...prev };
        for (const p of people) next[p.id] = hasLiked(p.id);
        return next;
      });
    });
    const off2 = on("block:changed", () => setLiked(s => ({ ...s })));
    return () => { off1(); off2(); };
  }, [people]);

  const checked = isCheckedIn(venueId);

  const onLike = (id: string, name: string) => {
    const res = likePerson(id, venueId);
    if (!res.ok && res.reason === "not_checked_in") {
      toastError("Please check in to this venue to send likes.");
      return;
    }
    setLiked(s => ({ ...s, [id]: true }));
    if (res.mutual) {
      toastSuccess("It's a match! Find them in Matches and start chatting 🎉");
    } else {
      toastInfo(`👍 Like sent to ${name}. If they like you back, they’ll appear in Matches.`);
    }
  };

  const onUndo = (id: string) => {
    undoLike(id);
    setLiked(s => ({ ...s, [id]: false }));
    toastInfo("Like removed.");
  };

  const onBlock = (id: string) => {
    blockUser(id);
    toastInfo("User blocked. They’ll be hidden from your lists.");
  };

  const onReport = (id: string) => {
    reportUser(id);
    toastInfo("Thanks for the report. We’ve noted this user.");
  };

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {visible.map(p => (
        <div key={p.id} className="rounded-2xl border bg-white p-2 shadow-sm">
          <div className="aspect-square w-full overflow-hidden rounded-xl">
            <ImageWithFallback
              src={p.photo}
              alt={p.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="mt-2 font-medium">{p.name}</div>
          <div className="text-xs text-neutral-500">{p.bio || "—"}</div>

          {!checked ? (
            <button
              disabled
              className="mt-2 w-full rounded-full bg-neutral-200 px-3 py-1 text-sm font-medium text-neutral-500"
            >
              Check in to like
            </button>
          ) : liked[p.id] ? (
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => onUndo(p.id)}
                className="w-full rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-800 hover:bg-neutral-200"
              >
                Undo like
              </button>
            </div>
          ) : (
            <button
              onClick={() => onLike(p.id, p.name)}
              className="mt-2 w-full rounded-full bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Send Like
            </button>
          )}

          <div className="mt-2 flex gap-2">
            <button
              onClick={() => onBlock(p.id)}
              className="flex-1 rounded-full border px-3 py-1 text-xs text-neutral-700 hover:bg-neutral-50"
            >
              Block
            </button>
            <button
              onClick={() => onReport(p.id)}
              className="flex-1 rounded-full border px-3 py-1 text-xs text-neutral-700 hover:bg-neutral-50"
            >
              Report
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
