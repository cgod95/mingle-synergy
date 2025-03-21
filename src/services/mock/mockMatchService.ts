
import { MatchService } from '@/types/services';
import { Match, User } from '@/types';
import { matches, users } from '@/data/mockData';

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
    
    // Update the users' match lists
    this.updateUserMatches(matchData.userId, matchData.matchedUserId);
    
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

  private updateUserMatches(userId1: string, userId2: string): void {
    // Find both users
    const user1Index = users.findIndex(u => u.id === userId1);
    const user2Index = users.findIndex(u => u.id === userId2);
    
    if (user1Index === -1 || user2Index === -1) {
      console.error('One or both users not found');
      return;
    }
    
    // Update user1's matches
    if (!users[user1Index].matches.includes(userId2)) {
      users[user1Index].matches.push(userId2);
    }
    
    // Update user2's matches
    if (!users[user2Index].matches.includes(userId1)) {
      users[user2Index].matches.push(userId1);
    }
  }
}

export default new MockMatchService();
