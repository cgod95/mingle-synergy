export type ChatMessage = {
  sender: "you" | "them";
  ts: number;
  text: string;
};

export type ChatThread = {
  id: string;
  name?: string;
  messages: ChatMessage[];
};

const KEY = "mingle:chatThreads";

function load(): Record<string, ChatThread> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}

function save(all: Record<string, ChatThread>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {}
}

/** Ensure a thread exists (no-op if present) */
export function ensureChat(id: string, meta?: { name?: string }): ChatThread {
  const all = load();
  if (!all[id]) {
    all[id] = { id, name: meta?.name, messages: [] };
  } else if (meta?.name && !all[id].name) {
    all[id].name = meta.name;
  }
  save(all);
  return all[id];
}

/** Append a message to a thread */
export function appendMessage(id: string, msg: ChatMessage) {
  const all = load();
  if (!all[id]) {
    all[id] = { id, messages: [] };
  }
  all[id].messages.push(msg);
  save(all);
}

/** Get a single thread by id */
export function getThread(id: string): ChatThread | undefined {
  const all = load();
  return all[id];
}

/** Return the last message for preview */
export function getLastMessage(id: string): ChatMessage | undefined {
  const t = getThread(id);
  if (!t || !t.messages?.length) return undefined;
  return t.messages[t.messages.length - 1];
}

/** List all threads as an array (sorted by last activity desc) */
export function listThreads(): ChatThread[] {
  const all = load();
  const rows = Object.values(all);
  rows.sort((a, b) => {
    const at = a.messages.length ? a.messages[a.messages.length - 1].ts : 0;
    const bt = b.messages.length ? b.messages[b.messages.length - 1].ts : 0;
    return bt - at;
  });
  return rows;
}

/** Alias expected by ChatIndex */
export const listConversations = listThreads;

/** Seed a few demo conversations (idempotent) */
export function seedDemoConversations() {
  const demos = [
    { id: "mia", name: "Mia", text: "You heading to the late set?" },
    { id: "lucas", name: "Lucas", text: "That lineup is wild 🔥" },
    { id: "sophia", name: "Sophia", text: "Meet near the main bar?" }
  ];
  for (const d of demos) {
    ensureChat(d.id, { name: d.name });
    const last = getLastMessage(d.id);
    if (!last || Date.now() - last.ts > 1000 * 60 * 60 * 24) {
      appendMessage(d.id, { sender: "them", ts: Date.now(), text: d.text });
    }
  }
}

/** Public idempotent seed used in main.tsx */
export function ensureDemoThreadsSeed() {
  seedDemoConversations();
}
