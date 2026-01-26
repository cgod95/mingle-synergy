import { isMingleBot, getBotReply, BOT_REPLY_DELAY } from './mingleBot';

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

/**
 * Also save to ChatRoom's localStorage format so messages appear in the UI
 * ChatRoom uses: mingle:messages:${id} with format { sender: "you" | "them", text, ts }[]
 */
function syncToChatRoomFormat(threadId: string, messages: ChatMessage[]) {
  try {
    const chatRoomKey = `mingle:messages:${threadId}`;
    const chatRoomMsgs = messages.map(m => ({
      sender: m.sender === 'me' ? 'you' : 'them', // ChatRoom uses 'you' instead of 'me'
      text: m.text,
      ts: m.ts,
    }));
    localStorage.setItem(chatRoomKey, JSON.stringify(chatRoomMsgs));
  } catch {}
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
  
  // Sync to ChatRoom's format so messages appear in the UI
  syncToChatRoomFormat(id, s[id].messages);
  
  // MINGLE BOT: Auto-reply when user sends a message to the bot
  if (isMingleBot(id) && msg.sender === 'me') {
    // Count user messages to the bot (excluding system messages)
    const userMessageCount = s[id].messages.filter(m => m.sender === 'me').length;
    
    // Schedule bot reply after a short delay
    setTimeout(() => {
      const currentStore = load();
      if (!currentStore[id]) return;
      
      const botReply = getBotReply(userMessageCount - 1); // -1 because we just added a message
      currentStore[id].messages.push({
        sender: 'them',
        ts: Date.now(),
        text: botReply,
      });
      save(currentStore);
      
      // Sync to ChatRoom's format
      syncToChatRoomFormat(id, currentStore[id].messages);
      
      // Dispatch custom event to notify UI of new message
      window.dispatchEvent(new CustomEvent('mingle-bot-reply', { 
        detail: { threadId: id, message: botReply } 
      }));
    }, BOT_REPLY_DELAY);
  }
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

/** Seed demo threads with realistic dialogue (idempotent) */
export async function ensureDemoThreadsSeed() {
  const { generateRealisticConversation } = await import('./demoDialogue');
  const { DEMO_PEOPLE } = await import('./demoPeople');
  
  // Create 10-15 matches with varied activity
  const now = Date.now();
  const matchSeeds = DEMO_PEOPLE.slice(0, 15).map((person, index) => {
    const venues = ['1', '2', '3', '4', '5', '6'];
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
        // Use direct save to avoid triggering bot reply
        const s = load();
        if (!s[seed.id]) s[seed.id] = { id: seed.id, messages: [] };
        s[seed.id].messages.push({
          sender: msg.sender === 'you' ? 'me' : 'them',
          text: msg.text,
          ts: msg.ts
        });
        save(s);
      });
      
      // Sync the complete conversation to ChatRoom format
      const finalThread = load()[seed.id];
      if (finalThread) {
        syncToChatRoomFormat(seed.id, finalThread.messages);
      }
    }
  });
}
