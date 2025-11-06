import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getActiveMatches, getRemainingSeconds, isExpired, type Match } from "../lib/matchesCompat";

function fmt(s: number) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

export default function Matches() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(x=>x+1), 1000); return () => clearInterval(t); }, []);
  const matches: Match[] = useMemo(() => getActiveMatches(), [tick]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-xl font-semibold text-slate-900">Your Matches</h1>

      {matches.length === 0 ? (
        <div className="card p-6 text-sm text-slate-600">No active matches yet. Visit a venue and like someone to start a chat.</div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map(m => {
            const remain = getRemainingSeconds(m);
            const expired = isExpired(m);
            const last = m.messages?.[m.messages.length-1];
            return (
              <li key={m.id} className="card p-4">
                <div className="flex items-center gap-3">
                  <img src={m.otherAvatar} alt={m.otherName} className="h-10 w-10 rounded-full ring-1 ring-slate-200 object-cover"/>
                  <div className="min-w-0">
                    <div className="truncate font-medium text-slate-900">{m.otherName}</div>
                    <div className="truncate text-xs text-slate-500">{last?.text ?? "—"}</div>
                  </div>
                  <div className="ml-auto text-xs">
                    {expired ? (
                      <span className="badge bg-slate-200 text-slate-700">Expired</span>
                    ) : (
                      <span className="badge">Expires in {fmt(remain)}</span>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <Link to={"/chat/"+m.id} className="btn-primary">Open chat</Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
