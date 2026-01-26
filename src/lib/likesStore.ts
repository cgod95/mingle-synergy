import { isMingleBot, BOT_WELCOME_MESSAGE } from './mingleBot';

const KEY = "mingle_likes_v1";

type Store = {
  mine: string[];    // ids I liked
  likedMe: string[]; // ids who liked me
  matches: string[]; // mutual ids
};

function coerceArr(x: unknown): string[] {
  return Array.isArray(x) ? x.filter(y => typeof y === "string") : [];
}
function load(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { mine: [], likedMe: [], matches: [] };
    const o = JSON.parse(raw);
    return { mine: coerceArr(o?.mine), likedMe: coerceArr(o?.likedMe), matches: coerceArr(o?.matches) };
  } catch {
    return { mine: [], likedMe: [], matches: [] };
  }
}
function save(s: Store) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

export function resetLikesStore() { save({ mine: [], likedMe: [], matches: [] }); }

export function ensureDemoLikesSeed() {
  const s = load();
  if (!s.likedMe.length) {
    // Seed more mutual likes for richer demo experience
    // Increased from 8 to 15 people who already like you (for instant matches)
    // This gives ~60% match rate when you like someone
    const mutualLikes = [
      "ava", "jay", "lucas", "sophia", "mila", "ethan", "zoe", "liam",
      "noah", "mia", "oliver", "isla", "emma", "james", "charlotte"
    ];
    s.likedMe = mutualLikes;
    save(s);
  }
}

/** Send a like. Returns true if mutual like (i.e., a match). */
export async function likePerson(id: string): Promise<boolean> {
  const s = load();
  if (!s.mine.includes(id)) s.mine.push(id);
  
  // MINGLE BOT: Always match instantly with the bot
  if (isMingleBot(id)) {
    if (!s.likedMe.includes(id)) {
      s.likedMe.push(id);
    }
    if (!s.matches.includes(id)) {
      s.matches.push(id);
      // Create chat with bot and add welcome message
      try {
        const { ensureChat, appendMessage } = await import('./chatStore');
        ensureChat(id, { name: 'Mingle Team' });
        appendMessage(id, { 
          sender: "them", 
          ts: Date.now(), 
          text: BOT_WELCOME_MESSAGE 
        });
      } catch (error) {
        // Non-critical - chat creation failed
      }
    }
    save(s);
    return true;
  }
  
  // Check if they already like you (instant match)
  let mutual = s.likedMe.includes(id);
  
  // If not already mutual, add probability-based matching (60% chance)
  // This makes the demo more engaging with more matches
  if (!mutual && !s.matches.includes(id)) {
    const matchProbability = 0.6; // 60% chance of match
    if (Math.random() < matchProbability) {
      // They like you back! Create mutual like
      if (!s.likedMe.includes(id)) {
        s.likedMe.push(id);
      }
      mutual = true;
    }
  }
  
  if (mutual && !s.matches.includes(id)) {
    s.matches.push(id);
    // Ensure chat is created when match happens
    try {
      const { ensureChat } = await import('./chatStore');
      const { getPerson } = await import('./demoPeople');
      const person = getPerson(id);
      ensureChat(id, { name: person?.name });
      
      // Add a welcome message
      const { appendMessage } = await import('./chatStore');
      appendMessage(id, { 
        sender: "system", 
        ts: Date.now(), 
        text: "You matched! 🎉 Start chatting to make plans to meet up!" 
      });
    } catch (error) {
      // Non-critical - chat creation failed
    }
  }
  save(s);
  return mutual;
}

export function isMatched(id: string): boolean {
  return load().matches.includes(id);
}

export function isLiked(id: string): boolean {
  return load().mine.includes(id);
}

export function listMatches(): string[] {
  return load().matches;
}
