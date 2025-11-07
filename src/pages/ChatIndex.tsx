import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { listConversations } from "../lib/chatStore";
import { timeAgo } from "../lib/timeago";

type Row = {
  id: string;
  name: string;
  lastText?: string;
  lastTs?: number;
};

export default function ChatIndex() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    try {
      const list = listConversations().map((r: any) => ({
        id: r.id,
        name: r.name,
        lastText: r.lastText,
        lastTs: r.lastTs ?? 0,
      }));
      list.sort((a, b) => (b.lastTs ?? 0) - (a.lastTs ?? 0));
      setRows(list);
    } catch {
      setRows([]);
    }
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-4">
      <h1 className="mb-3 text-2xl font-semibold">Chats</h1>
      <div className="divide-y rounded-2xl border bg-white">
        {rows.length === 0 ? (
          <div className="p-12 text-center">
            <div className="max-w-sm mx-auto">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <MessageCircle className="w-10 h-10 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">No conversations yet</h3>
              <p className="text-sm text-neutral-600">Start chatting with your matches!</p>
            </div>
          </div>
        ) : (
          rows.map((r) => (
            <button
              key={r.id}
              onClick={() => navigate(`/chat/${r.id}`)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50"
            >
              <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-neutral-100" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div className="truncate font-medium">{r.name}</div>
                  <div className="ml-3 flex-shrink-0 text-[10px] text-neutral-500">
                    {r.lastTs ? timeAgo(r.lastTs) : ""}
                  </div>
                </div>
                <div className="truncate text-sm text-neutral-600">
                  {r.lastText ?? "Start the conversation"}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
