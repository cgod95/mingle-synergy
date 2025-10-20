type Message = {
  id: string;
  pairId: string;
  sender: "me" | "peer";
  text: string;
  ts: number;
};

const MSG_KEY = "mingle_demo_chat_messages";
const PAIR_KEY = "mingle_demo_current_pair";

function read<T>(k: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(k) || "") as T; } catch { return fallback; }
}
function write<T>(k: string, v: T) { localStorage.setItem(k, JSON.stringify(v)); }

export function getCurrentPairId(): string | null {
  return localStorage.getItem(PAIR_KEY);
}
export function setCurrentPairId(id: string | null) {
  if (id) localStorage.setItem(PAIR_KEY, id);
  else localStorage.removeItem(PAIR_KEY);
}

export function listMessages(pairId: string): Message[] {
  const all = read<Message[]>(MSG_KEY, []);
  return all.filter(m => m.pairId === pairId).sort((a,b)=>a.ts-b.ts);
}

export function sendMessage(pairId: string, sender: "me" | "peer", text: string) {
  const all = read<Message[]>(MSG_KEY, []);
  all.push({ id: crypto.randomUUID(), pairId, sender, text, ts: Date.now() });
  write(MSG_KEY, all);
}

export function clearThread(pairId: string) {
  const all = read<Message[]>(MSG_KEY, []);
  write(MSG_KEY, all.filter(m => m.pairId !== pairId));
}
