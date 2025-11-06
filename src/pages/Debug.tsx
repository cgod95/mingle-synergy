import { resetLikesStore, ensureDemoLikesSeed } from "../lib/likesStore";
import { ensureDemoThreadsSeed } from "../lib/chatStore";

export default function Debug() {
  return (
    <div>
      <h1 className="text-xl font-semibold">Debug</h1>
      <div className="mt-4 space-y-2">
        <button
          className="rounded bg-neutral-800 px-3 py-2 text-white"
          onClick={() => { localStorage.clear(); alert("localStorage cleared"); }}
        >Clear localStorage</button>
        <button
          className="rounded bg-indigo-600 px-3 py-2 text-white"
          onClick={() => { resetLikesStore(); ensureDemoLikesSeed(); ensureDemoThreadsSeed(); alert("Demo likes/chats seeded"); }}
        >Seed demo likes & chats</button>
      </div>
    </div>
  );
}
