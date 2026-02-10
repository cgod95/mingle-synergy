import { emit } from "./bus";
import { isCheckedIn as isCheckedInAt } from "./checkinStore";
import { ensureChat, appendMessage } from "./chatStore";

const KEY = "mingle:likes";
type LikesDB = {
  currentUserId: string;
  likesByUser: Record<string, string[]>;
};
function load(): LikesDB {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { currentUserId: "demo", likesByUser: {} };
}
function save(db: LikesDB) {
  localStorage.setItem(KEY, JSON.stringify(db));
  emit("likes:changed");
}
export function setCurrentUser(userId: string) {
  const db = load();
  if (db.currentUserId !== userId) { db.currentUserId = userId; save(db); }
}
function addLike(db: LikesDB, from: string, to: string) {
  const arr = (db.likesByUser[from] ||= []);
  if (!arr.includes(to)) arr.push(to);
}
function removeLike(db: LikesDB, from: string, to: string) {
  const arr = (db.likesByUser[from] ||= []);
  const i = arr.indexOf(to);
  if (i >= 0) arr.splice(i, 1);
}
export function hasLiked(targetId: string, byUserId?: string): boolean {
  const db = load();
  const uid = byUserId || db.currentUserId;
  return !!db.likesByUser[uid]?.includes(targetId);
}
export function isMutual(a: string, b: string): boolean {
  const db = load();
  return !!db.likesByUser[a]?.includes(b) && !!db.likesByUser[b]?.includes(a);
}
export function likePerson(targetId: string, venueId?: string, byUserId?: string): { ok: boolean; reason?: string; mutual?: boolean } {
  const db = load();
  const uid = byUserId || db.currentUserId;
  if (!venueId || !isCheckedInAt(venueId)) return { ok: false, reason: "not_checked_in" };
  addLike(db, uid, targetId);
  save(db);
  const nowMutual = isMutual(uid, targetId);
  if (nowMutual) {
    ensureChat(targetId);
    appendMessage(targetId, { sender: "them", ts: Date.now(), text: "You matched! 🎉" });
  }
  return { ok: true, mutual: nowMutual };
}
export function undoLike(targetId: string, byUserId?: string) {
  const db = load();
  const uid = byUserId || db.currentUserId;
  removeLike(db, uid, targetId);
  save(db);
}
export function getMatches(): string[] {
  const db = load();
  const mine = db.likesByUser[db.currentUserId] || [];
  return mine.filter(t => isMutual(db.currentUserId, t));
}
export function getMatchList() {
  return getMatches().map(id => ({ id }));
}

/** DEMO: seed mutual likes between current user and a set of ids (runs once) */
const SEED_FLAG = "mingle:seeded_v1";
export function seedDemoOnce(candidateIds: string[]) {
  try {
    if (localStorage.getItem(SEED_FLAG)) return;
    const db = load();
    const me = db.currentUserId || "demo";
    for (const id of candidateIds) {
      addLike(db, me, id);      // you like them
      addLike(db, id, me);      // they like you back (mutual)
      ensureChat(id);
      appendMessage(id, { sender: "them", ts: Date.now(), text: "Hey! Nice to match 😊" });
    }
    save(db);
    localStorage.setItem(SEED_FLAG, "1");
  } catch {}
}
