
import { MatchService } from '@/types/services';
import { Match } from '@/types/services';
import { matches } from '@/data/mockData';

class MockMatchService implements MatchService {
  async getMatches(userId: string): Promise<Match[]> {
    // Find all matches where the user is involved
    return matches.filter(
      match => (match.userId === userId || match.matchedUserId === userId) && match.isActive
    );
  }

  async createMatch(matchData: Omit<Match, 'id'>): Promise<Match> {
    // Generate a match ID
    const matchId = `m${matches.length + 1}`;
    
    // Create the new match
    const newMatch: Match = {
      id: matchId,
      ...matchData,
    };
    
    // Add to our mock data
    matches.push(newMatch);
    
    console.log(`[Mock] Created new match between ${matchData.userId} and ${matchData.matchedUserId}`);
    
    return newMatch;
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
          expiresAt: Date.now() + (3 * 60 * 60 * 1000), // 3 hours
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
}

export default new MockMatchService();
