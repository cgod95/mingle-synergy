import { useState } from "react";

export default function FeedbackPage() {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const onSubmit = (e:React.FormEvent)=>{ e.preventDefault(); setSent(true); /* TODO: save to Firestore */ };
  return (
    <section className="mx-auto max-w-md p-4">
      <div className="rounded-2xl bg-neutral-800 border border-neutral-700 p-4 shadow-sm">
        <h1 className="mb-2 text-lg font-semibold text-white">Feedback</h1>
        <p className="mb-4 text-sm text-neutral-400">Tell us what to improve.</p>
        {sent ? (
          <div className="rounded-xl bg-green-900/30 border border-green-700/50 p-3 text-green-400">Thanks! We've got it.</div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <textarea className="rounded-xl border border-neutral-600 bg-neutral-900 text-white px-3 py-2 text-base placeholder:text-neutral-500" rows={5} value={text} onChange={(e)=>setText(e.target.value)} />
            <button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-white min-h-[44px]">Send</button>
          </form>
        )}
      </div>
    </section>
  );
}
