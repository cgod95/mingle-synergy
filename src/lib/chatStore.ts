const KEY = "mingle_chats_v1";

export type ChatMessage = { sender: "me" | "them" | "system"; ts: number; text: string };
export type ChatThread = { id: string; name?: string; messages: ChatMessage[] };

type ChatStore = Record<string, ChatThread>;

function load(): ChatStore {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function save(s: ChatStore) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

export function ensureChat(id: string, meta?: { name?: string }) {
  const s = load();
  if (!s[id]) s[id] = { id, name: meta?.name, messages: [] };
  else if (meta?.name && !s[id].name) s[id].name = meta.name;
  save(s);
}
export function appendMessage(id: string, msg: ChatMessage) {
  const s = load();
  if (!s[id]) s[id] = { id, messages: [] };
  s[id].messages.push(msg);
  save(s);
}
export function getThread(id: string): ChatThread | undefined {
  const s = load();
  return s[id];
}
export function getLastMessage(id: string): ChatMessage | undefined {
  const t = getThread(id);
  return t && t.messages.length ? t.messages[t.messages.length - 1] : undefined;
}
export function listThreads(): ChatThread[] {
  const s = load();
  return Object.values(s).sort((a, b) => {
    const at = a.messages.length ? a.messages[a.messages.length - 1].ts : 0;
    const bt = b.messages.length ? b.messages[b.messages.length - 1].ts : 0;
    return bt - at;
  });
}
/** Alias used by ChatIndex */
export const listConversations = listThreads;

/** Seed a few demo threads (idempotent) */
export function ensureDemoThreadsSeed() {
  const seed = [
    { id: "lucas", name: "Lucas", text: "That set was insane 😎" },
    { id: "sophia", name: "Sophia", text: "Loved the vibe tonight." },
  ];
  seed.forEach(d => {
    ensureChat(d.id, { name: d.name });
    const t = getThread(d.id);
    if (t && !t.messages.length) {
      appendMessage(d.id, { sender: "them", ts: Date.now(), text: d.text });
    }
  });
}
