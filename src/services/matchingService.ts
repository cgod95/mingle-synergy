// Advanced matching service with compatibility scoring algorithms

import { UserProfile } from '@/types/services';
import { analytics } from './analytics';
import { notificationService } from './notificationService';

export interface CompatibilityScore {
  overall: number; // 0-100
  interests: number;
  location: number;
  activity: number;
  communication: number;
  lifestyle: number;
  details: {
    commonInterests: string[];
    distanceKm: number;
    activityOverlap: number;
    communicationStyle: string;
    lifestyleMatch: string;
  };
}

export interface MatchRecommendation {
  user: UserProfile;
  score: CompatibilityScore;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface MatchingPreferences {
  maxDistance: number; // km
  ageRange: { min: number; max: number };
  interests: string[];
  activityLevel: 'low' | 'medium' | 'high';
  communicationStyle: 'casual' | 'serious' | 'both';
  lifestyle: 'active' | 'relaxed' | 'both';
}

interface UserData {
  id: string;
  name: string;
  age: number;
  interests: string[];
  location: { lat: number; lng: number };
  preferences: UserPreferences;
}

interface UserPreferences {
  ageRange: { min: number; max: number };
  maxDistance: number;
  interests: string[];
  dealbreakers: string[];
}

interface MatchingResult {
  userId: string;
  score: number;
  compatibility: number;
  commonInterests: string[];
  distance: number;
}

export interface User {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  interests: string[];
  location: {
    latitude: number;
    longitude: number;
  };
  preferences: {
    ageRange: [number, number];
    maxDistance: number;
    interests: string[];
  };
  personality: {
    extroversion: number; // 0-1
    openness: number; // 0-1
    conscientiousness: number; // 0-1
    agreeableness: number; // 0-1
    neuroticism: number; // 0-1
  };
  activity: {
    lastActive: Date;
    isOnline: boolean;
    checkInTime?: Date;
    venueId?: string;
  };
  verification: {
    isVerified: boolean;
    isPremium: boolean;
    hasSelfie: boolean;
  };
}

export interface Match {
  id: string;
  users: [string, string];
  compatibility: number; // 0-1
  mutualInterests: string[];
  createdAt: Date;
  lastInteraction?: Date;
  status: 'pending' | 'active' | 'expired' | 'blocked';
  venue?: {
    id: string;
    name: string;
  };
}

export interface MatchRequest {
  fromUserId: string;
  toUserId: string;
  venueId?: string;
  message?: string;
  timestamp: Date;
}

class MatchingService {
  private readonly interestWeights = {
    'music': 0.15,
    'sports': 0.12,
    'travel': 0.10,
    'food': 0.08,
    'art': 0.08,
    'technology': 0.07,
    'fitness': 0.07,
    'reading': 0.06,
    'gaming': 0.05,
    'photography': 0.05,
    'dancing': 0.04,
    'cooking': 0.04,
    'nature': 0.03
  };

  private readonly activityScores = {
    'low': 1,
    'medium': 2,
    'high': 3
  };

  private matches: Map<string, Match> = new Map();
  private pendingRequests: Map<string, MatchRequest> = new Map();
  private userCache: Map<string, User> = new Map();

  // Enhanced compatibility scoring algorithm
  calculateCompatibility(user1: User, user2: User): number {
    let score = 0;
    let weights = 0;

    // Interest compatibility (30% weight)
    const interestScore = this.calculateInterestCompatibility(user1.interests, user2.interests);
    score += interestScore * 0.3;
    weights += 0.3;

    // Personality compatibility (25% weight)
    const personalityScore = this.calculatePersonalityCompatibility(user1.personality, user2.personality);
    score += personalityScore * 0.25;
    weights += 0.25;

    // Location proximity (20% weight)
    const distanceScore = this.calculateDistanceScore(user1.location, user2.location, user1.preferences.maxDistance);
    score += distanceScore * 0.2;
    weights += 0.2;

    // Age compatibility (15% weight)
    const ageScore = this.calculateAgeCompatibility(user1, user2);
    score += ageScore * 0.15;
    weights += 0.15;

    // Activity compatibility (10% weight)
    const activityScore = this.calculateActivityCompatibility(user1.activity, user2.activity);
    score += activityScore * 0.1;
    weights += 0.1;

    return weights > 0 ? score / weights : 0;
  }

  private calculateInterestCompatibility(interests1: string[], interests2: string[]): number {
    if (interests1.length === 0 || interests2.length === 0) return 0.5;

    const set1 = new Set(interests1.map(i => i.toLowerCase()));
    const set2 = new Set(interests2.map(i => i.toLowerCase()));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  private calculatePersonalityCompatibility(personality1: User['personality'], personality2: User['personality']): number {
    // Complementary personality matching
    const extroversionCompatibility = 1 - Math.abs(personality1.extroversion - personality2.extroversion);
    const opennessCompatibility = 1 - Math.abs(personality1.openness - personality2.openness);
    const conscientiousnessCompatibility = 1 - Math.abs(personality1.conscientiousness - personality2.conscientiousness);
    const agreeablenessCompatibility = 1 - Math.abs(personality1.agreeableness - personality2.agreeableness);
    const neuroticismCompatibility = 1 - Math.abs(personality1.neuroticism - personality2.neuroticism);

    return (
      extroversionCompatibility * 0.25 +
      opennessCompatibility * 0.25 +
      conscientiousnessCompatibility * 0.2 +
      agreeablenessCompatibility * 0.2 +
      neuroticismCompatibility * 0.1
    );
  }

  private calculateDistanceScore(location1: User['location'], location2: User['location'], maxDistance: number): number {
    const distance = this.calculateDistance(location1, location2);
    if (distance <= maxDistance) {
      return 1 - (distance / maxDistance);
    }
    return 0;
  }

  private calculateDistance(location1: User['location'], location2: User['location']): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(location2.latitude - location1.latitude);
    const dLon = this.toRadians(location2.longitude - location1.longitude);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(location1.latitude)) * Math.cos(this.toRadians(location2.latitude)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private calculateAgeCompatibility(user1: User, user2: User): number {
    const age1 = user1.age;
    const age2 = user2.age;
    
    // Check if ages are within each user's preferred range
    const user1Pref = user1.preferences.ageRange;
    const user2Pref = user2.preferences.ageRange;
    
    const user1Ok = age2 >= user1Pref[0] && age2 <= user1Pref[1];
    const user2Ok = age1 >= user2Pref[0] && age1 <= user2Pref[1];
    
    if (!user1Ok || !user2Ok) return 0;
    
    // Calculate age similarity (closer ages = higher score)
    const ageDiff = Math.abs(age1 - age2);
    const maxAgeDiff = Math.max(user1Pref[1] - user1Pref[0], user2Pref[1] - user2Pref[0]);
    
    return 1 - (ageDiff / maxAgeDiff);
  }

  private calculateActivityCompatibility(activity1: User['activity'], activity2: User['activity']): number {
    let score = 0;
    
    // Online status compatibility
    if (activity1.isOnline && activity2.isOnline) {
      score += 0.3;
    }
    
    // Venue proximity (if both checked in)
    if (activity1.venueId && activity2.venueId && activity1.venueId === activity2.venueId) {
      score += 0.4;
    }
    
    // Activity timing compatibility
    const timeDiff = Math.abs(activity1.lastActive.getTime() - activity2.lastActive.getTime());
    const oneDay = 24 * 60 * 60 * 1000;
    if (timeDiff < oneDay) {
      score += 0.3;
    }
    
    return score;
  }

  // Process like and create match if mutual
  async processLike(fromUserId: string, toUserId: string, venueId?: string): Promise<Match | null> {
    const fromUser = this.userCache.get(fromUserId);
    const toUser = this.userCache.get(toUserId);
    
    if (!fromUser || !toUser) {
      throw new Error('User not found');
    }

    // Check if there's already a pending request from the other user
    const existingRequest = this.pendingRequests.get(`${toUserId}-${fromUserId}`);
    
    if (existingRequest) {
      // Mutual like - create match
      const match = await this.createMatch(fromUserId, toUserId, venueId);
      
      // Remove the pending request
      this.pendingRequests.delete(`${toUserId}-${fromUserId}`);
      
      // Send match notification
      await this.sendMatchNotification(match);
      
      analytics.track('match_created', {
        match_id: match.id,
        venue_id: venueId,
        compatibility: match.compatibility,
        mutual_interests_count: match.mutualInterests.length
      });
      
      return match;
    } else {
      // Create pending request
      const request: MatchRequest = {
        fromUserId,
        toUserId,
        venueId,
        timestamp: new Date()
      };
      
      this.pendingRequests.set(`${fromUserId}-${toUserId}`, request);
      
      analytics.track('like_sent', {
        from_user_id: fromUserId,
        to_user_id: toUserId,
        venue_id: venueId
      });
      
      return null;
    }
  }

  private async createMatch(user1Id: string, user2Id: string, venueId?: string): Promise<Match> {
    const user1 = this.userCache.get(user1Id)!;
    const user2 = this.userCache.get(user2Id)!;
    
    const compatibility = this.calculateCompatibility(user1, user2);
    const mutualInterests = user1.interests.filter(interest => 
      user2.interests.includes(interest)
    );
    
    const match: Match = {
      id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      users: [user1Id, user2Id],
      compatibility,
      mutualInterests,
      createdAt: new Date(),
      status: 'active',
      venue: venueId ? {
        id: venueId,
        name: 'Venue Name' // Would be fetched from venue service
      } : undefined
    };
    
    this.matches.set(match.id, match);
    return match;
  }

  private async sendMatchNotification(match: Match): Promise<void> {
    const [user1Id, user2Id] = match.users;
    
    // Send notifications to both users
    await Promise.all([
      notificationService.notifyNewMatch({
        userId: user1Id,
        matchId: match.id,
        otherUserId: user2Id,
        compatibility: match.compatibility,
        mutualInterests: match.mutualInterests
      }),
      notificationService.notifyNewMatch({
        userId: user2Id,
        matchId: match.id,
        otherUserId: user1Id,
        compatibility: match.compatibility,
        mutualInterests: match.mutualInterests
      })
    ]);
  }

  // Get potential matches for a user
  async getPotentialMatches(userId: string, limit: number = 20): Promise<User[]> {
    const user = this.userCache.get(userId);
    if (!user) return [];

    const allUsers = Array.from(this.userCache.values()).filter(u => u.id !== userId);
    
    // Filter and score potential matches
    const scoredUsers = allUsers
      .filter(u => this.isEligibleMatch(user, u))
      .map(u => ({
        user: u,
        score: this.calculateCompatibility(user, u)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scoredUsers.map(su => su.user);
  }

  private isEligibleMatch(user1: User, user2: User): boolean {
    // Check age preferences
    const user1AgeOk = user2.age >= user1.preferences.ageRange[0] && 
                      user2.age <= user1.preferences.ageRange[1];
    const user2AgeOk = user1.age >= user2.preferences.ageRange[0] && 
                      user1.age <= user2.preferences.ageRange[1];
    
    if (!user1AgeOk || !user2AgeOk) return false;

    // Check distance
    const distance = this.calculateDistance(user1.location, user2.location);
    if (distance > user1.preferences.maxDistance || distance > user2.preferences.maxDistance) {
      return false;
    }

    // Check if already matched or requested
    const matchExists = Array.from(this.matches.values()).some(match => 
      match.users.includes(user1.id) && match.users.includes(user2.id)
    );
    
    const requestExists = this.pendingRequests.has(`${user1.id}-${user2.id}`) ||
                         this.pendingRequests.has(`${user2.id}-${user1.id}`);

    return !matchExists && !requestExists;
  }

  // Get user's matches
  getUserMatches(userId: string): Match[] {
    return Array.from(this.matches.values()).filter(match => 
      match.users.includes(userId) && match.status === 'active'
    );
  }

  // Update user cache
  updateUser(user: User): void {
    this.userCache.set(user.id, user);
  }

  // Remove user from cache
  removeUser(userId: string): void {
    this.userCache.delete(userId);
  }

  // Get match by ID
  getMatch(matchId: string): Match | undefined {
    return this.matches.get(matchId);
  }

  // Update match status
  updateMatchStatus(matchId: string, status: Match['status']): void {
    const match = this.matches.get(matchId);
    if (match) {
      match.status = status;
      if (status === 'active') {
        match.lastInteraction = new Date();
      }
    }
  }
}

// Export singleton instance
export const matchingService = new MatchingService(); 