/**
 * Mingle Bot - A test/demo bot that appears at all venues
 * 
 * Purpose:
 * - Allows Apple App Review to test the app's features
 * - Shows users how the matching/chat system works
 * - Always available at every venue for testing
 */

import type { Person } from './demoPeople';

// Bot user ID - constant across the app
export const MINGLE_BOT_ID = 'mingle-bot';

// Bot profile that appears at venues
export const MINGLE_BOT: Person = {
  id: MINGLE_BOT_ID,
  name: 'Mingle Team',
  photo: '/avatars/mingle-bot.svg',
  bio: "👋 Hi! I'm a test bot, not a real person. Feel free to send me a message to try out the chat feature!",
  age: undefined, // Don't show age for bot
  currentVenue: undefined, // Will be set dynamically
  zone: undefined,
  lastActive: Date.now(), // Always active
  checkedInAt: Date.now(),
};

/**
 * Check if a user ID is the Mingle Bot
 */
export function isMingleBot(userId: string): boolean {
  return userId === MINGLE_BOT_ID;
}

/**
 * Get a copy of the bot profile for a specific venue
 */
export function getBotForVenue(venueId: string): Person {
  return {
    ...MINGLE_BOT,
    currentVenue: venueId,
    lastActive: Date.now(),
    checkedInAt: Date.now() - 300000, // Checked in 5 minutes ago
  };
}

/**
 * Bot welcome message when matched
 */
export const BOT_WELCOME_MESSAGE = "Hey! 👋 I'm a tester bot, not a real person. Feel free to send me a message to try out the chat feature! This is how conversations work on Mingle.";

/**
 * Bot auto-reply messages (cycles through these)
 */
export const BOT_REPLIES = [
  "Thanks for testing! This is an automated reply. 🤖",
  "I'm just a bot, but real users will respond with real messages! 💬",
  "Great! You're getting the hang of it. On Mingle, you match with real people at venues and chat to make plans to meet up! 🎉",
  "That's the spirit! In the real app, you'd be chatting with someone you just saw at a venue. How cool is that? ✨",
  "Perfect! You've mastered the chat feature. Now go check in at a venue and meet real people! 🚀",
];

/**
 * Get a bot reply based on message count
 */
export function getBotReply(messageCount: number): string {
  const index = Math.min(messageCount, BOT_REPLIES.length - 1);
  return BOT_REPLIES[index];
}

/**
 * Delay before bot responds (in ms) - makes it feel more natural
 */
export const BOT_REPLY_DELAY = 1500;
