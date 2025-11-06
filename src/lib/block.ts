import { emit } from "./bus";

const KEY = "mingle:block";
type DB = { blocked: string[]; reported: string[] };

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { blocked: [], reported: [] };
}
function save(db: DB) {
  localStorage.setItem(KEY, JSON.stringify(db));
  emit("block:changed");
}

export function isBlocked(id: string): boolean {
  return load().blocked.includes(id);
}
export function blockUser(id: string) {
  const db = load();
  if (!db.blocked.includes(id)) {
    db.blocked.push(id);
    save(db);
  }
}
export function unblockUser(id: string) {
  const db = load();
  db.blocked = db.blocked.filter(x => x !== id);
  save(db);
}
export function reportUser(id: string) {
  const db = load();
  if (!db.reported.includes(id)) {
    db.reported.push(id);
    save(db);
  }
}
export function listBlocked() { return load().blocked; }
