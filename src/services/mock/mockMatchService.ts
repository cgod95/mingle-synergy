import { MatchService } from '@/types/services';
import type { FirestoreMatch } from '@/types/match';
import { matches } from '@/data/mockData';
import type { Match } from '@/types/services';
import { MATCH_EXPIRY_MS } from '@/lib/matchesCompat';

// Calculate time remaining until match expires
export const calculateTimeRemaining = (expiresAt: number): string => {
  const now = Date.now();
  const timeLeft = expiresAt - now;
  
  if (timeLeft <= 0) return 'Expired';
  
  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m remaining`;
};

// Function to check for expiring matches and notify users
export const checkExpiringMatches = async (userId: string): Promise<void> => {
  try {
    const userMatches = matches.filter(
      match => (match.userId === userId || match.matchedUserId === userId) && match.isActive
    );
    
    const soon = 30 * 60 * 1000; // 30 minutes
    
    userMatches.forEach(match => {
      const timeLeft = match.expiresAt - Date.now();
      
      // If match will expire within 30 minutes, notify user
      if (timeLeft > 0 && timeLeft <= soon && !match.contactShared) {
        // Notification service doesn't have showNotification method
        console.log('Match Expiring Soon:', `Your match will expire in ${Math.floor(timeLeft / (1000 * 60))} minutes. Share contact info to keep the connection!`);
      }
    });
    
    console.log(`[Mock] Checked ${userMatches.length} matches for expiry notifications`);
  } catch (error) {
    console.error('[Mock] Error checking expiring matches:', error);
  }
};

class MockMatchService implements MatchService {

  async getMatches(userId: string): Promise<FirestoreMatch[]> {
    // Find all matches where the user is involved
    return matches.filter(
      match => (match.userId === userId || match.matchedUserId === userId) && match.isActive
    ) as unknown as FirestoreMatch[];
  }

  async createMatch(
    user1Id: string, 
    user2Id: string, 
    venueId: string, 
    venueName: string
  ): Promise<string> {
    // Generate a match ID
    const matchId = `m${matches.length + 1}`;
    
    // Create the new match
    const newMatch: Match = {
      id: matchId,
      userId: user1Id,
      matchedUserId: user2Id,
      venueId,
      venueName,
      timestamp: Date.now(),
      isActive: true,
      expiresAt: Date.now() + MATCH_EXPIRY_MS, // 24 hours
      contactShared: false
    };
    
    // Add to our mock data
    matches.push(newMatch);
    
    console.log(`[Mock] Created new match between ${user1Id} and ${user2Id}`);
    
    return matchId;
  }

  async updateMatch(matchId: string, data: Partial<Match>): Promise<void> {
    const matchIndex = matches.findIndex(m => m.id === matchId);
    
    if (matchIndex === -1) {
      throw new Error('Match not found');
    }
    
    // Update the match with the provided data
    matches[matchIndex] = {
      ...matches[matchIndex],
      ...data,
    };
    
    console.log(`[Mock] Updated match ${matchId} with:`, data);
  }

  async requestReconnect(matchId: string, userId: string): Promise<boolean> {
    try {
      const matchIndex = matches.findIndex(m => m.id === matchId);
      
      if (matchIndex === -1) {
        console.error(`[Mock] Match ${matchId} not found`);
        return false;
      }
      
      const match = matches[matchIndex];
      
      // Verify the user is part of this match
      if (match.userId !== userId && match.matchedUserId !== userId) {
        console.error(`[Mock] User ${userId} not authorized for match ${matchId}`);
        return false;
      }
      
      // Determine who is requesting reconnection
      const isRequestor = match.userId === userId;
      
      // Update the match with the reconnection request
      if (isRequestor) {
        matches[matchIndex] = {
          ...match,
          userRequestedReconnect: true,
          reconnectRequestedAt: Date.now()
        };
      } else {
        matches[matchIndex] = {
          ...match,
          matchedUserRequestedReconnect: true,
          reconnectRequestedAt: Date.now()
        };
      }
      
      // Check if both users have requested reconnection
      const updatedMatch = matches[matchIndex];
      if (updatedMatch.userRequestedReconnect && updatedMatch.matchedUserRequestedReconnect) {
        // Reconnect the match
        matches[matchIndex] = {
          ...updatedMatch,
          isActive: true,
          expiresAt: Date.now() + MATCH_EXPIRY_MS, // 24 hours
          userRequestedReconnect: false,
          matchedUserRequestedReconnect: false,
          reconnectedAt: Date.now()
        };
      }
      
      console.log(`[Mock] Reconnect requested for match ${matchId} by user ${userId}`);
      return true;
    } catch (error) {
      console.error('[Mock] Error requesting reconnect:', error);
      return false;
    }
  }
  
  async markAsMet(matchId: string): Promise<boolean> {
    try {
      const matchIndex = matches.findIndex(m => m.id === matchId);
      
      if (matchIndex === -1) {
        console.error(`[Mock] Match ${matchId} not found`);
        return false;
      }
      
      matches[matchIndex] = {
        ...matches[matchIndex],
        met: true,
        metAt: Date.now()
      };
      
      console.log(`[Mock] Match ${matchId} marked as met`);
      return true;
    } catch (error) {
      console.error('[Mock] Error marking match as met:', error);
      return false;
    }
  }

  // Check expiring matches
  async checkExpiringMatches(userId: string): Promise<void> {
    return checkExpiringMatches(userId);
  }

  // Calculate time remaining for a match
  calculateTimeRemaining(expiresAt: Date): string {
    return calculateTimeRemaining(expiresAt.getTime());
  }

  async sendMessage(matchId: string, userId: string, message: string): Promise<boolean> {
    try {
      const matchIndex = matches.findIndex(m => m.id === matchId);
      
      if (matchIndex === -1) {
        console.error(`[Mock] Match ${matchId} not found`);
        return false;
      }
      
      console.log(`[Mock] Message sent in match ${matchId} by user ${userId}: ${message}`);
      return true;
    } catch (error) {
      console.error('[Mock] Error sending message:', error);
      return false;
    }
  }

  async likeUser(currentUserId: string, targetUserId: string, venueId: string): Promise<{ isMatch: boolean; matchId?: string }> {
    // Store like in localStorage for demo mode persistence
    const likesKey = `mingle:likes:${currentUserId}`;
    const currentLikes: string[] = JSON.parse(localStorage.getItem(likesKey) || '[]');
    
    if (!currentLikes.includes(targetUserId)) {
      currentLikes.push(targetUserId);
      localStorage.setItem(likesKey, JSON.stringify(currentLikes));
    }
    
    // Check if target user has liked current user (mutual like)
    const targetLikesKey = `mingle:likes:${targetUserId}`;
    const targetLikes: string[] = JSON.parse(localStorage.getItem(targetLikesKey) || '[]');
    
    if (targetLikes.includes(currentUserId)) {
      // Mutual like! Create a match
      const matchId = `m${Date.now()}_${currentUserId}_${targetUserId}`;
      const venueName = localStorage.getItem('mingle:lastVenueName') || 'Unknown Venue';
      
      await this.createMatch(currentUserId, targetUserId, venueId, venueName);
      
      return { isMatch: true, matchId };
    }
    
    return { isMatch: false };
  }
}

export default new MockMatchService();
