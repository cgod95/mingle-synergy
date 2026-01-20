import { useState } from "react";

export default function FeedbackPage() {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const onSubmit = (e:React.FormEvent)=>{ e.preventDefault(); setSent(true); /* TODO: save to Firestore */ };
  return (
    <section className="mx-auto max-w-md p-4">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h1 className="mb-2 text-lg font-semibold">Feedback</h1>
        <p className="mb-4 text-sm text-neutral-600">Tell us what to improve.</p>
        {sent ? (
          <div className="rounded-xl bg-green-50 p-3 text-green-700">Thanks! We’ve got it.</div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <textarea className="rounded-xl border px-3 py-2" rows={5} value={text} onChange={(e)=>setText(e.target.value)} />
            <button className="rounded-xl bg-neutral-900 px-4 py-2 text-white">Send</button>
          </form>
        )}
      </div>
    </section>
  );
}
