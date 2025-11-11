// Realistic dialogue library for demo mode
// Emphasizes meeting up, serendipity, and venue context

export const CONVERSATION_STARTERS = [
  "Want to grab a drink?",
  "That set was amazing! Are you still here?",
  "Love your vibe - want to connect?",
  "Great spot, right?",
  "First time here?",
  "Small world!",
  "Didn't expect to see you here!",
  "Fate?",
  "That DJ is killing it!",
  "Are you here often?",
  "Want to meet up?",
  "Love your energy!",
  "This place is perfect",
  "Want to chat?",
  "You seem cool - want to connect?",
];

export const FOLLOW_UP_MESSAGES = [
  "I'm at the bar if you want to say hi!",
  "Heading to the dance floor - join me?",
  "Want to grab a drink together?",
  "I'm by the stage if you're still here",
  "Let's meet up before the night ends!",
  "I'd love to chat in person",
  "Come find me - I'm wearing [color]",
  "Want to explore this place together?",
];

export const VENUE_SPECIFIC_MESSAGES: Record<string, string[]> = {
  bar: [
    "The cocktails here are amazing!",
    "Want to try the signature drink?",
    "This bar has the best vibe",
    "Love the music selection here",
  ],
  club: [
    "That DJ set was insane!",
    "The energy here is incredible",
    "Want to hit the dance floor?",
    "This place is electric tonight",
  ],
  cafe: [
    "The coffee here is perfect",
    "Great spot to work and meet people",
    "Love the atmosphere here",
    "Want to grab a coffee together?",
  ],
  restaurant: [
    "The food here is incredible",
    "Want to share a table?",
    "This place has the best vibes",
    "Great spot for meeting new people",
  ],
};

export function getRandomStarter(): string {
  return CONVERSATION_STARTERS[Math.floor(Math.random() * CONVERSATION_STARTERS.length)];
}

export function getRandomFollowUp(): string {
  return FOLLOW_UP_MESSAGES[Math.floor(Math.random() * FOLLOW_UP_MESSAGES.length)];
}

export function getVenueSpecificMessage(venueType: string): string {
  const messages = VENUE_SPECIFIC_MESSAGES[venueType] || CONVERSATION_STARTERS;
  return messages[Math.floor(Math.random() * messages.length)];
}

export function generateRealisticConversation(matchId: string, venueType?: string): Array<{sender: 'you' | 'them', text: string, ts: number}> {
  const messages: Array<{sender: 'you' | 'them', text: string, ts: number}> = [];
  const now = Date.now();
  
  // First message from them (1-2 hours ago)
  const firstMessage = venueType 
    ? getVenueSpecificMessage(venueType)
    : getRandomStarter();
  messages.push({
    sender: 'them',
    text: firstMessage,
    ts: now - (Math.random() * 3600000 + 3600000), // 1-2 hours ago
  });

  // Your response (30-60 min after their message)
  messages.push({
    sender: 'you',
    text: "Hey! Yes, I'm still here. Want to meet up?",
    ts: messages[0].ts + (Math.random() * 1800000 + 1800000), // 30-60 min after
  });

  // Their follow-up (recent, 10-30 min ago)
  messages.push({
    sender: 'them',
    text: getRandomFollowUp(),
    ts: now - (Math.random() * 1200000 + 600000), // 10-30 min ago
  });

  return messages;
}





