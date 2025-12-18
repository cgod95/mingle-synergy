/**
 * Message Limit Tracking Utilities
 * Tracks message count per user per match for demo/localStorage mode
 */

const MESSAGE_COUNT_KEY_PREFIX = "mingle:messageCount:";

/**
 * Get message count for a user in a match
 */
export function getMessageCount(matchId: string, userId: string): number {
  try {
    const key = `${MESSAGE_COUNT_KEY_PREFIX}${matchId}:${userId}`;
    const count = localStorage.getItem(key);
    return count ? parseInt(count, 10) : 0;
  } catch {
    return 0;
  }
}

/**
 * Increment message count for a user in a match
 */
export function incrementMessageCount(matchId: string, userId: string): void {
  try {
    const key = `${MESSAGE_COUNT_KEY_PREFIX}${matchId}:${userId}`;
    const current = getMessageCount(matchId, userId);
    localStorage.setItem(key, (current + 1).toString());
  } catch {
    // Ignore errors
  }
}

/**
 * Check if user is premium (premium users get unlimited messages)
 * Note: Premium is NOT available in beta, but logic is here for future
 */
async function isPremiumUser(userId: string): Promise<boolean> {
  try {
    const { subscriptionService } = await import("@/services");
    if (subscriptionService && typeof subscriptionService.getUserSubscription === 'function') {
      const subscription = subscriptionService.getUserSubscription(userId);
      return subscription?.tierId === 'premium' || subscription?.tierId === 'pro';
    }
  } catch {
    // Ignore errors - assume not premium
  }
  return false;
}

/**
 * Check if user can send more messages (5 message limit)
 * Premium users bypass this check
 */
export async function canSendMessage(matchId: string, userId: string): Promise<boolean> {
  // Premium users get unlimited messages (but match still expires)
  if (await isPremiumUser(userId)) {
    return true;
  }
  
  const count = getMessageCount(matchId, userId);
  const messageLimit = 10; // Use feature flag in production
  return count < messageLimit;
}

/**
 * Get remaining messages
 * Premium users see unlimited (999)
 */
export async function getRemainingMessages(matchId: string, userId: string): Promise<number> {
  // Premium users get unlimited messages
  if (await isPremiumUser(userId)) {
    return 999; // Show as unlimited
  }
  
  const count = getMessageCount(matchId, userId);
  const messageLimit = 10; // Use feature flag in production
  return Math.max(0, messageLimit - count);
}

/**
 * Reset message count (for testing/admin)
 */
export function resetMessageCount(matchId: string, userId: string): void {
  try {
    const key = `${MESSAGE_COUNT_KEY_PREFIX}${matchId}:${userId}`;
    localStorage.removeItem(key);
  } catch {
    // Ignore errors
  }
}

