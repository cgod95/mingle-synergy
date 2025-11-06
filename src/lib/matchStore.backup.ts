export type Message = {
  id: string;
  sender: "you" | "other" | "other-read";
  text: string;
  ts: number;
};

export type Match = {
  id: string;
  youId: string;
  otherId: string;
  otherName: string;
  otherAvatar?: string;
  venueId?: string;
  createdAt?: number;
  messages?: Message[];
};

const KEY = "mingle_matches_v1";

/* -------- storage helpers -------- */
function read(): Match[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Match[]) : [];
  } catch {
    return [];
  }
}
function write(list: Match[]): void {
  localStorage.setItem(KEY, JSON.stringify(list));
}

/* -------- utilities -------- */
function coerceSender(v: any): Message["sender"] {
  if (v === "you" || v === "other" || v === "other-read") return v;
  return "other";
}
function normalize(list: Match[]): Match[] {
  return list.map((m) => ({
    ...m,
    messages: Array.isArray(m.messages)
      ? m.messages.map((msg) => ({
          id: (msg as any).id ?? String(Date.now()),
          sender: coerceSender((msg as any).sender),
          text: String((msg as any).text ?? ""),
          ts: Number((msg as any).ts ?? Date.now()),
        }))
      : [],
  }));
}

/* -------- CRUD -------- */
export function addMatch(m: Match): void {
  const list = read();
  const i = list.findIndex((x) => x.id === m.id);
  const prepared: Match = {
    ...m,
    createdAt: m.createdAt ?? Date.now(),
    messages: Array.isArray(m.messages) ? m.messages : [],
  };
  if (i >= 0) {
    // merge, keep existing messages if incoming doesn’t include
    const existing = list[i];
    list[i] = {
      ...existing,
      ...prepared,
      messages:
        prepared.messages && prepared.messages.length > 0
          ? prepared.messages
          : existing.messages ?? [],
    };
  } else {
    list.unshift(prepared);
  }
  write(normalize(list));
}

export function getMatches(): Match[] {
  return normalize(read());
}

export function getMatch(id: string): Match | undefined {
  return getMatches().find((x) => x.id === id);
}

export function removeMatch(id: string): void {
  write(read().filter((x) => x.id !== id));
}

export function clearMatches(): void {
  write([]);
}

// alias used in a few places
export const clearAllMatches = clearMatches;

export function getMatchCount(): number {
  return read().length;
}

/* -------- messages -------- */
export function appendMessage(
  matchId: string,
  msg: { id?: string; sender: "you" | "other"; text: string; ts?: number }
): void {
  const list = read();
  const i = list.findIndex((m) => m.id === matchId);
  if (i === -1) return;

  const msgs: Message[] = Array.isArray(list[i].messages)
    ? [...(list[i].messages as Message[])]
    : [];

  const safe: Message = {
    id: msg.id ?? String(Date.now()),
    sender: coerceSender(msg.sender),
    text: msg.text,
    ts: msg.ts ?? Date.now(),
  };

  msgs.push(safe);
  list[i] = { ...list[i], messages: msgs };
  write(list);
}

export function markAllRead(matchId: string): void {
  const list = read();
  const i = list.findIndex((m) => m.id === matchId);
  if (i === -1) return;

  const msgs: Message[] = Array.isArray(list[i].messages)
    ? (list[i].messages as Message[]).map((m) => ({
        ...m,
        sender: m.sender === "other" ? "other-read" : m.sender,
      }))
    : [];
  list[i] = { ...list[i], messages: msgs };
  write(list);
}

export function getTotalUnread(): number {
  return getMatches().reduce((n, m) =>
  n + (Array.isArray(m.messages) ? m.messages.filter(msg => coerceSender((msg as any)?.sender) === 'other').length : 0)
, 0);
}
/* -------- demo seeder (used by DebugTools sometimes) -------- */
export function seedDemoMatches(n = 3): void {
  const base = read();
  const now = Date.now();
  const names = ["Sam", "Alex", "Jordan", "Taylor", "Riley", "Casey"];
  for (let i = 0; i < n; i++) {
    const m: Match = {
      id: `demo-${now}-${i}`,
      youId: "you",
      otherId: `u${i}`,
      otherName: `${names[i % names.length]} ${100 + i}`,
      otherAvatar: `https://api.dicebear.com/7.x/thumbs/svg?seed=${i}`,
      venueId: ["v1", "v2", "v3"][i % 3],
      createdAt: now - i * 1000 * 60,
      messages: [],
    };
    if (!base.some((x) => x.id === m.id)) base.unshift(m);
  }
  write(base);
}

// Back-compat alias expected by some components
export const addMessage = appendMessage;

/** Create a match (if missing) with a person at a venue and return its id */
export function createOrGetMatch(params: {
  youId?: string;
  otherId: string;
  otherName: string;
  otherAvatar?: string;
  venueId?: string;
}): string {
  const { youId = 'you', otherId, otherName, otherAvatar, venueId } = params;
  const list = read();
  const found = list.find(m => m.youId === youId && m.otherId === otherId && m.venueId === (venueId ?? m.venueId));
  if (found) return found.id;
  const id = `m-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const m = { id, youId, otherId, otherName, otherAvatar, venueId, createdAt: Date.now(), messages: [] };
  list.unshift(m);
  write(list);
  return id;
}

/** Append a simple system/bot message into a match thread */
export function appendSystemMessage(matchId: string, text: string) {
  const list = read();
  const i = list.findIndex(m => m.id === matchId);
  if (i === -1) return;
  const msgs = Array.isArray(list[i].messages) ? [...(list[i].messages as any[])] : [];
  msgs.push({ id: 'sys-' + Date.now(), sender: 'system' as any, text, ts: Date.now() });
  list[i] = { ...list[i], messages: msgs };
  write(list);
}

export function getUnreadForMatch(matchId: string): number {
  try {
    const list = getMatches();
    const m = list.find(x => x.id === matchId);
    if (!m || !Array.isArray(m.messages)) return 0;
    return m.messages.filter(msg => coerceSender((msg as any)?.sender) === 'other').length;
  } catch {
    return 0;
  }
}

export function addMessage(matchId: string, msg: { sender: "you"|"other"; text: string; ts?: number }) {
  const raw = localStorage.getItem("mingle_matches_v1");
  let list: any[] = [];
  try { list = raw ? JSON.parse(raw) : []; } catch {}
  const i = list.findIndex(m => m.id === matchId);
  if (i === -1) return;
  const safeMsg = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, sender: coerceSender(msg.sender), text: msg.text, ts: msg.ts ?? Date.now() };
  const msgs = Array.isArray(list[i].messages) ? list[i].messages : [];
  msgs.push(safeMsg);
  list[i] = { ...list[i], messages: msgs };
  localStorage.setItem("mingle_matches_v1", JSON.stringify(list));
}
