import { useState } from "react";

type FeedbackItem = { ts: number; text: string };
const KEY = "mingle:feedback";

function loadAll(): FeedbackItem[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function saveAll(items: FeedbackItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export default function Feedback() {
  const [text, setText] = useState("");
  const [items, setItems] = useState<FeedbackItem[]>(loadAll());
  const [banner, setBanner] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const next = [{ ts: Date.now(), text: text.trim() }, ...items].slice(0, 50);
    setItems(next);
    saveAll(next);
    setText("");
    setBanner("✅ Thanks for your feedback!");
    setTimeout(() => setBanner(null), 1500);
  }

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="text-xl font-semibold">Feedback</h1>
      <p className="text-sm text-neutral-600">Tell us what feels good, broken, or missing.</p>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          className="w-full rounded-xl border px-3 py-2"
          rows={4}
          placeholder="Your thoughts…"
        />
        <div className="flex items-center gap-3">
          <button type="submit" className="rounded-full bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500">
            Submit
          </button>
          {banner && <div className="text-sm text-neutral-700">{banner}</div>}
        </div>
      </form>

      <h2 className="mt-6 text-lg font-semibold">Previous feedback</h2>
      <div className="mt-2 space-y-2">
        {items.length === 0 && <div className="text-sm text-neutral-500">No feedback yet.</div>}
        {items.map((it, i) => (
          <div key={i} className="rounded-2xl border bg-white p-3">
            <div className="text-xs text-neutral-400">{new Date(it.ts).toLocaleString()}</div>
            <div className="mt-1 text-sm">{it.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
