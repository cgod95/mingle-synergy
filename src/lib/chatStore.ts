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
  // First check the chatStore (mingle_chats_v1)
  const t = getThread(id);
  if (t && t.messages.length) {
    return t.messages[t.messages.length - 1];
  }
  
  // Also check ChatRoom's storage format (mingle:messages:${id})
  // This ensures we find messages regardless of which component saved them
  try {
    const chatRoomKey = `mingle:messages:${id}`;
    const raw = localStorage.getItem(chatRoomKey);
    if (raw) {
      const msgs = JSON.parse(raw) as { sender: "you" | "them"; text: string; ts: number }[];
      if (msgs.length) {
        const last = msgs[msgs.length - 1];
        // Convert 'you'/'them' to 'me'/'them' format
        return {
          sender: last.sender === 'you' ? 'me' : 'them',
          text: last.text,
          ts: last.ts
        };
      }
    }
  } catch {
    // Ignore parse errors
  }
  
  return undefined;
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

/** Seed demo threads with realistic dialogue (idempotent) */
export async function ensureDemoThreadsSeed() {
  const { generateRealisticConversation } = await import('./demoDialogue');
  const { DEMO_PEOPLE } = await import('./demoPeople');
  
  // Create 10-15 matches with varied activity
  const now = Date.now();
  const matchSeeds = DEMO_PEOPLE.slice(0, 15).map((person, index) => {
    const venues = ['club-aurora', 'neon-garden', 'luna-lounge', 'venue1', 'venue2', 'venue3'];
    const venueType = index % 4 === 0 ? 'club' : index % 4 === 1 ? 'bar' : index % 4 === 2 ? 'cafe' : 'restaurant';
    
    // Varied expiry times (some expiring soon, some with 2+ hours)
    const hoursUntilExpiry = index < 5 ? 0.5 : index < 10 ? 1.5 : 2.5;
    const expiresAt = now + (hoursUntilExpiry * 3600000);
    
    return {
      id: person.id,
      name: person.name,
      venueId: venues[index % venues.length],
      venueType,
      expiresAt,
      createdAt: now - (Math.random() * 3600000), // Created 0-1 hour ago
    };
  });

  matchSeeds.forEach((seed, index) => {
    ensureChat(seed.id, { name: seed.name });
    const t = getThread(seed.id);
    if (t && !t.messages.length) {
      // Generate realistic conversation
      const conversation = generateRealisticConversation(seed.id, seed.venueType);
      conversation.forEach(msg => {
        // Convert 'you'/'them' to 'me'/'them' for chatStore
        appendMessage(seed.id, {
          sender: msg.sender === 'you' ? 'me' : 'them',
          text: msg.text,
          ts: msg.ts
        });
      });
    }
  });
}
