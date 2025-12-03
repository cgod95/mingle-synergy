/**
 * Simple localStorage-backed store for:
 * - outgoing likes
 * - matches (mutual likes)
 * - conversation index (for Chat list)
 *
 * NOTE: This works with chatStore's ensureChat/appendMessage to create threads.
 */

export type Person = {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
};

export type Match = {
  id: string;       // person id
  person: Person;
  since: number;    // timestamp
};

type StoreShape = {
  likes: Record<string, number>;     // personId -> ts
  matches: Record<string, Match>;    // personId -> Match
};

const KEY = "mingle:matchStore:v1";

function load(): StoreShape {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { likes: {}, matches: {} };
}
function save(s: StoreShape) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function clearMatchStore() {
  save({ likes: {}, matches: {} });
}

export function getMatches(): Match[] {
  const s = load();
  return Object.values(s.matches).sort((a,b) => b.since - a.since);
}

export function likePerson(p: Person): { matched: boolean } {
  const s = load();
  s.likes[p.id] = Date.now();

  // Simple demo rule: 60% chance of instant mutual like
  const matched = Math.random() < 0.6;
  if (matched && !s.matches[p.id]) {
    s.matches[p.id] = { id: p.id, person: p, since: Date.now() };
  }

  save(s);
  return { matched };
}

/** Seed a few demo matches once (idempotent) */
export function seedDemoMatchesIfEmpty(people: Person[]) {
  const s = load();
  if (Object.keys(s.matches).length > 0) return;

  // pick first 3 if available
  const picks = people.slice(0, 3);
  for (const p of picks) {
    s.matches[p.id] = { id: p.id, person: p, since: Date.now() - Math.floor(Math.random()*86400000) };
  }
  save(s);
}

/** Conversation index helpers (built from chatStore) */
export type ConversationPreview = {
  id: string;      // person id / thread id
  person: Person;
  lastText: string;
  lastTs: number;
  unread?: number;
};

import { ensureChat, getLastMessage, appendMessage } from "./chatStore";

/** Ensure we have a chat thread for this person and optionally seed a hello */
export function ensureConversationForMatch(m: Match) {
  ensureChat(m.id, { name: m.person.name });
  const lm = getLastMessage(m.id);
  if (!lm) {
    appendMessage(m.id, { sender: "them", ts: Date.now(), text: `Hey ${m.person.name.split(" ")[0]} 👋` });
  }
}

/** Build chat previews from matches + chatStore threads */
export function getConversationPreviews(): ConversationPreview[] {
  const ms = getMatches();
  const out: ConversationPreview[] = [];
  for (const m of ms) {
    ensureChat(m.id, { name: m.person.name });
    const lm = getLastMessage(m.id);
    out.push({
      id: m.id,
      person: m.person,
      lastText: lm?.text ?? "Start the conversation…",
      lastTs: lm?.ts ?? m.since,
      unread: 0,
    });
  }
  return out.sort((a,b) => b.lastTs - a.lastTs);
}

/** Ensure a match exists for a person, creating if needed */
export function ensureMatchFor(userId: string, personId: string, personName: string, personAvatar: string, venueId: string): string {
  const s = load();
  if (!s.matches[personId]) {
    const person: Person = { id: personId, name: personName, avatar: personAvatar };
    s.matches[personId] = { id: personId, person, since: Date.now() };
    save(s);
  }
  return personId;
}

/** Add a message to a match conversation */
export function addMessage(matchId: string, msg: { sender: "you" | "other"; text: string; ts?: number }): void {
  appendMessage(matchId, { sender: msg.sender === "you" ? "me" : "them", text: msg.text, ts: msg.ts || Date.now() });
}
