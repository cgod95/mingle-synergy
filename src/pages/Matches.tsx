import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { listMatches } from "../lib/likesStore";
import { getPerson } from "../lib/api";
import SafeImg from "../components/common/SafeImg";
import { ensureChat, getThread, getLastMessage } from "../lib/chatStore";

export default function Matches() {
  const navigate = useNavigate();
  const items = useMemo(() => {
    const ids = listMatches();
    return ids.map((id) => getPerson(id)).filter(Boolean) as {id:string;name:string;photo?:string}[];
  }, []);

  function openChat(id: string, name: string) {
    ensureChat(id, { name });
    const t = getThread(id);
    if (!t || !t.messages.length) {
      // seed a friendly opener once
      ensureChat(id, { name });
    }
    navigate(`/chat/${id}`);
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-xl p-4">
        <h1 className="text-xl font-semibold">Matches</h1>
        <p className="mt-2 text-neutral-600">No matches yet. Like someone at a venue to get started.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-4 grid gap-4 sm:grid-cols-2">
      {items.map((p) => {
        const last = getLastMessage(p.id);
        return (
          <button
            key={p.id}
            onClick={() => openChat(p.id, p.name)}
            className="overflow-hidden rounded-xl border bg-white text-left hover:shadow-sm transition"
          >
            <SafeImg
              src={p.photo || "/assets/avatars/default.png"}
              alt={p.name}
              className="h-40 w-full object-cover"
            />
            <div className="p-3">
              <div className="font-medium">{p.name}</div>
              <div className="mt-1 text-sm text-neutral-500 line-clamp-1">
                {last ? last.text : "Say hi 👋"}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
