import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listMatches } from "../lib/likesStore";
import { getThread, ensureChat, getLastMessage } from "../lib/chatStore";
import { timeAgo } from "../lib/timeago";
import SafeImg from "../components/common/SafeImg";

type MatchPreview = {
  id: string;
  name: string;
  photo?: string;
  lastText?: string;
  lastTs?: number;
};

function displayNameFromId(id: string) {
  if (!id) return "Unknown";
  return id.charAt(0).toUpperCase() + id.slice(1);
}

export default function Matches() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<MatchPreview[]>([]);

  useEffect(() => {
    try {
      const ids = listMatches(); // mutuals only (local store)
      const previews: MatchPreview[] = ids.map((id) => {
        // Get or create a chat thread for preview details
        const t = getThread(id) ?? ensureChat(id, { name: displayNameFromId(id) });
        const last = getLastMessage(id);
        return {
          id,
          name: t?.name || displayNameFromId(id),
          photo: (t as any)?.photo, // optional if you add photos later
          lastText: last?.text,
          lastTs: last?.ts,
        };
      });
      previews.sort((a, b) => (b.lastTs ?? 0) - (a.lastTs ?? 0));
      setRows(previews);
    } catch {
      setRows([]);
    }
  }, []);

  const empty = useMemo(() => rows.length === 0, [rows]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-4">
      <h1 className="mb-3 text-2xl font-semibold">Matches</h1>
      <p className="mb-4 text-sm text-neutral-600">
        Your mutual likes appear here. Tap a card to open the conversation.
      </p>

      {empty ? (
        <div className="rounded-2xl border bg-white p-8 text-center text-neutral-600">
          No matches yet. Like people at venues to get started.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {rows.map((m) => (
            <button
              key={m.id}
              onClick={() => navigate(`/chat/${m.id}`)}
              className="group overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <SafeImg
                  src={m.photo || "/avatar-fallback.png"}
                  alt={m.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                {m.lastTs ? (
                  <div className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/50 px-2 py-1 text-[10px] text-white">
                    {timeAgo(m.lastTs)}
                  </div>
                ) : null}
              </div>
              <div className="p-3">
                <div className="line-clamp-1 font-semibold">{m.name}</div>
                <div className="mt-1 line-clamp-1 text-xs italic text-neutral-500">
                  {m.lastText ? m.lastText : "Say hi 👋"}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
