export type Message = {
  id: string;
  matchId: string;
  sender: "you" | "other";
  text: string;
  ts: number;
};

const KEY = "mingle_messages_v1";

function read(): Message[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Message[]) : [];
  } catch {
    return [];
  }
}

function write(list: Message[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getMessages(matchId: string): Message[] {
  return read().filter(m => m.matchId === matchId);
}

export function addMessage(matchId: string, sender: "you" | "other", text: string) {
  const list = read();
  const msg: Message = { id: crypto.randomUUID(), matchId, sender, text, ts: Date.now() };
  list.push(msg);
  write(list);
  return msg;
}

export function clearMessages(matchId?: string) {
  if (!matchId) return localStorage.removeItem(KEY);
  write(read().filter(m => m.matchId !== matchId));
}

export function pruneOldMessages(hours = 24) {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  write(read().filter(m => m.ts >= cutoff));
}
