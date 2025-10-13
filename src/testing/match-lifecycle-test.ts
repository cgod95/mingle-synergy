import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import matchService from '@/services/firebase/matchService';
import venueService from '@/services/firebase/venueService';
import userService from '@/services/firebase/userService';
import { likeUser } from '@/services/firebase/matchService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';

// Mock Firebase for testing
vi.mock('@/firebase', () => ({
  db: {},
  auth: {}
}));

describe('Match and Chat Lifecycle', () => {
  let user1Id: string;
  let user2Id: string;
  let venueId: string;
  let matchId: string;

  beforeEach(() => {
    user1Id = 'user1-test-id';
    user2Id = 'user2-test-id';
    venueId = 'venue-test-id';
  });

  afterEach(async () => {
    // Clean up test data
    if (matchId) {
      try {
        await matchService.deleteMatch(matchId);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  it('should complete full match lifecycle: check-in → like → match → chat → expiry', async () => {
    // 1. Both users check into venue
    await venueService.checkInToVenue(user1Id, venueId);
    await venueService.checkInToVenue(user2Id, venueId);
    
    await userService.updateUserProfile(user1Id, {
      currentVenue: venueId,
      isCheckedIn: true
    });
    await userService.updateUserProfile(user2Id, {
      currentVenue: venueId,
      isCheckedIn: true
    });

    // Verify check-in
    const user1Profile = await userService.getUserProfile(user1Id);
    const user2Profile = await userService.getUserProfile(user2Id);
    expect(user1Profile?.currentVenue).toBe(venueId);
    expect(user2Profile?.currentVenue).toBe(venueId);

    // 2. User1 likes User2
    await likeUser(user1Id, user2Id, venueId);
    
    // Verify like was stored
    const user1Matches = await matchService.getMatches(user1Id);
    expect(user1Matches.length).toBe(0); // No match yet, just like

    // 3. User2 likes User1 back (mutual like)
    await likeUser(user2Id, user1Id, venueId);
    
    // Verify match was created
    const user1MatchesAfter = await matchService.getMatches(user1Id);
    const user2MatchesAfter = await matchService.getMatches(user2Id);
    
    expect(user1MatchesAfter.length).toBe(1);
    expect(user2MatchesAfter.length).toBe(1);
    
    const match = user1MatchesAfter[0];
    matchId = match.id;
    
    // Verify match properties
    expect(match.userId1).toBe(user1Id);
    expect(match.userId2).toBe(user2Id);
    expect(match.venueId).toBe(venueId);
    expect(match.matchedAt).toBeDefined();
    expect(match.timestamp).toBeDefined();
    expect(match.messages).toEqual([]);

    // 4. Send messages (test 3-message limit)
    await matchService.sendMessage(matchId, user1Id, 'Hello!');
    await matchService.sendMessage(matchId, user2Id, 'Hi there!');
    await matchService.sendMessage(matchId, user1Id, 'How are you?');
    
    // Try to send 4th message (should fail)
    await expect(
      matchService.sendMessage(matchId, user1Id, 'This should fail')
    ).rejects.toThrow('Message limit reached');

    // 5. Verify message count
    const updatedMatch = await matchService.getMatchById(matchId);
    expect(updatedMatch?.messages.length).toBe(3);

    // 6. Test match expiry (simulate 3 hours later)
    const expiredTimestamp = Date.now() - (3 * 60 * 60 * 1000) - 1000; // 3 hours + 1 second ago
    const matchRef = doc(db, 'matches', matchId);
    await updateDoc(matchRef, {
      timestamp: expiredTimestamp
    });

    // Verify match is expired
    const expiredMatch = await matchService.getMatchById(matchId);
    expect(expiredMatch?.timestamp).toBe(expiredTimestamp);

    // 7. Test rematch logic
    const canRematch = await matchService.canRematch(user1Id, user2Id, venueId);
    expect(canRematch).toBe(true); // Both users still at same venue, no active match

    // 8. Create rematch
    const rematchId = await matchService.createMatch(user1Id, user2Id, venueId, 'Test Venue');
    expect(rematchId).toBeDefined();

    // Clean up rematch
    await matchService.deleteMatch(rematchId);
  });

  it('should handle expired matches correctly', async () => {
    // Create a match that's already expired
    const expiredTimestamp = Date.now() - (3 * 60 * 60 * 1000) - 1000;
    matchId = await matchService.createMatch(user1Id, user2Id, venueId, 'Test Venue');
    
    // Update timestamp to expired
    const matchRef = doc(db, 'matches', matchId);
    await updateDoc(matchRef, {
      timestamp: expiredTimestamp
    });

    // Try to send message to expired match
    await expect(
      matchService.sendMessage(matchId, user1Id, 'This should fail')
    ).rejects.toThrow('Match has expired');

    // Verify match is considered expired
    const expiredMatch = await matchService.getMatchById(matchId);
    expect(expiredMatch?.timestamp).toBe(expiredTimestamp);
  });

  it('should enforce 3-message limit per user', async () => {
    // Create a fresh match
    matchId = await matchService.createMatch(user1Id, user2Id, venueId, 'Test Venue');

    // User1 sends 3 messages
    await matchService.sendMessage(matchId, user1Id, 'Message 1');
    await matchService.sendMessage(matchId, user1Id, 'Message 2');
    await matchService.sendMessage(matchId, user1Id, 'Message 3');

    // User1 tries to send 4th message (should fail)
    await expect(
      matchService.sendMessage(matchId, user1Id, 'Message 4')
    ).rejects.toThrow('Message limit reached');

    // User2 should still be able to send messages
    await matchService.sendMessage(matchId, user2Id, 'User2 message 1');
    await matchService.sendMessage(matchId, user2Id, 'User2 message 2');
    await matchService.sendMessage(matchId, user2Id, 'User2 message 3');

    // User2 tries to send 4th message (should fail)
    await expect(
      matchService.sendMessage(matchId, user2Id, 'User2 message 4')
    ).rejects.toThrow('Message limit reached');

    // Verify total message count
    const finalMatch = await matchService.getMatchById(matchId);
    expect(finalMatch?.messages.length).toBe(6); // 3 from each user
  });

  it('should only allow rematching when both users are at same venue', async () => {
    // User1 checks into venue1, User2 checks into venue2
    await venueService.checkInToVenue(user1Id, 'venue1');
    await venueService.checkInToVenue(user2Id, 'venue2');
    
    await userService.updateUserProfile(user1Id, {
      currentVenue: 'venue1',
      isCheckedIn: true
    });
    await userService.updateUserProfile(user2Id, {
      currentVenue: 'venue2',
      isCheckedIn: true
    });

    // Should not be able to rematch (different venues)
    const canRematch = await matchService.canRematch(user1Id, user2Id, 'venue1');
    expect(canRematch).toBe(false);

    // User2 checks into same venue as User1
    await venueService.checkInToVenue(user2Id, 'venue1');
    await userService.updateUserProfile(user2Id, {
      currentVenue: 'venue1',
      isCheckedIn: true
    });

    // Now should be able to rematch
    const canRematchAfter = await matchService.canRematch(user1Id, user2Id, 'venue1');
    expect(canRematchAfter).toBe(true);
  });
}); 