import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { appendMessage, ensureChat, getThread } from "../lib/chatStore";
import { isBlocked, block } from "../lib/blockStore";
import { timeAgo } from "../lib/timeago";

function displayNameFromId(id?: string) {
  if (!id) return "Unknown";
  // Humanize the id a bit as a fallback
  return id.charAt(0).toUpperCase() + id.slice(1);
}

export default function ChatRoom() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  // Always ensure a chat thread exists for the matchId (idempotent)
  useEffect(() => {
    if (matchId) ensureChat(matchId, { name: displayNameFromId(matchId) });
  }, [matchId]);

  // Fetch the thread safely
  const thread = useMemo(() => {
    if (!matchId) return undefined;
    return getThread(matchId);
  }, [matchId]);

  // Autoscroll on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages?.length]);

  if (!matchId) {
    return (
      <div className="rounded-xl border bg-white p-4">
        Invalid chat. <button className="text-indigo-600 underline" onClick={() => navigate("/chat")}>Back to chats</button>
      </div>
    );
  }

  if (!thread) {
    // If for some reason it still doesn't exist, create and render a minimal shell
    ensureChat(matchId, { name: displayNameFromId(matchId) });
    return (
      <div className="rounded-xl border bg-white p-4">
        Setting things up… <button className="text-indigo-600 underline" onClick={() => navigate(`/chat/${matchId}`)}>Retry</button>
      </div>
    );
  }

  const blocked = isBlocked(matchId);
  const name = thread.name || displayNameFromId(matchId);
  const messages = thread.messages ?? [];

  function onSend(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    if (blocked) return;
    appendMessage(matchId, { sender: "you", ts: Date.now(), text: t });
    setText("");
  }

  function onBlock() {
    block(matchId);
    navigate("/chat");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex items-center justify-between">
        <button className="text-sm text-neutral-500 hover:text-neutral-800" onClick={() => navigate("/chat")}>
          ← Back
        </button>
        <div className="text-sm text-neutral-500">
          Last activity: {messages.length ? timeAgo(messages[messages.length - 1].ts) : "just now"}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <h1 className="mb-2 text-lg font-semibold">{name}</h1>
        {blocked && (
          <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            You blocked this conversation.
          </div>
        )}

        <div className="mb-4 max-h-[55vh] overflow-y-auto pr-1">
          {messages.length === 0 && (
            <div className="mb-2 text-sm text-neutral-500">Say hi to start the chat.</div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`mb-2 flex ${m.sender === "you" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                  m.sender === "you" ? "bg-indigo-600 text-white" : "bg-neutral-100 text-neutral-900"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                <div className={`mt-1 text-[10px] ${m.sender === "you" ? "text-white/80" : "text-neutral-500"}`}>
                  {timeAgo(m.ts)}
                </div>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <form onSubmit={onSend} className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={blocked ? "You blocked this chat" : "Type a message"}
            disabled={blocked}
            className="flex-1 rounded-xl border px-3 py-2"
          />
          <button
            type="submit"
            disabled={blocked}
            className="rounded-xl bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Send
          </button>
          <button
            type="button"
            onClick={onBlock}
            className="rounded-xl border px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            Block
          </button>
        </form>
      </div>
    </div>
  );
}
