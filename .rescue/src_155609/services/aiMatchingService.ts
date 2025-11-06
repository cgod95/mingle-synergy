import { analytics } from './analytics';

export interface UserProfile {
  id: string;
  interests: string[];
  personality: PersonalityTraits;
  preferences: MatchingPreferences;
  behavior: UserBehavior;
  location: LocationData;
  demographics: Demographics;
}

export interface PersonalityTraits {
  openness: number; // 0-1
  conscientiousness: number; // 0-1
  extraversion: number; // 0-1
  agreeableness: number; // 0-1
  neuroticism: number; // 0-1
}

export interface MatchingPreferences {
  ageRange: [number, number];
  distance: number; // km
  interests: string[];
  dealbreakers: string[];
  mustHaves: string[];
}

export interface UserBehavior {
  responseRate: number; // 0-1
  messageLength: number; // average characters
  activeHours: number[]; // 0-23
  checkInFrequency: number; // per week
  likeToMatchRatio: number; // 0-1
}

export interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  timezone: string;
}

export interface Demographics {
  age: number;
  gender: string;
  occupation: string;
  education: string;
}

export interface MatchScore {
  userId: string;
  matchedUserId: string;
  overallScore: number; // 0-1
  compatibilityScores: {
    personality: number;
    interests: number;
    location: number;
    behavior: number;
    preferences: number;
  };
  reasons: string[];
  confidence: number; // 0-1
}

export interface MatchPrediction {
  willMatch: boolean;
  probability: number; // 0-1
  factors: string[];
}

class AIMatchingService {
  private modelVersion = '1.0.0';
  private compatibilityWeights = {
    personality: 0.25,
    interests: 0.20,
    location: 0.15,
    behavior: 0.20,
    preferences: 0.20,
  };

  // Calculate personality compatibility using Big Five model
  private calculatePersonalityCompatibility(
    user1: PersonalityTraits,
    user2: PersonalityTraits
  ): number {
    const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'] as const;
    
    let totalSimilarity = 0;
    let traitCount = 0;

    traits.forEach(trait => {
      const similarity = 1 - Math.abs(user1[trait] - user2[trait]);
      totalSimilarity += similarity;
      traitCount++;
    });

    return totalSimilarity / traitCount;
  }

  // Calculate interest compatibility with semantic similarity
  private calculateInterestCompatibility(
    interests1: string[],
    interests2: string[]
  ): number {
    if (interests1.length === 0 || interests2.length === 0) {
      return 0;
    }

    // Calculate Jaccard similarity
    const set1 = new Set(interests1);
    const set2 = new Set(interests2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    const jaccardSimilarity = intersection.size / union.size;

    // Boost score for exact matches
    const exactMatches = intersection.size;
    const boost = Math.min(exactMatches * 0.1, 0.3);

    return Math.min(jaccardSimilarity + boost, 1);
  }

  // Calculate location compatibility
  private calculateLocationCompatibility(
    location1: LocationData,
    location2: LocationData,
    maxDistance: number
  ): number {
    const distance = this.calculateDistance(
      location1.latitude,
      location1.longitude,
      location2.latitude,
      location2.longitude
    );

    if (distance <= maxDistance) {
      // Exponential decay based on distance
      return Math.exp(-distance / (maxDistance * 0.5));
    }

    return 0;
  }

  // Calculate behavioral compatibility
  private calculateBehaviorCompatibility(
    behavior1: UserBehavior,
    behavior2: UserBehavior
  ): number {
    const factors = [
      // Response rate compatibility (similar response rates work better)
      1 - Math.abs(behavior1.responseRate - behavior2.responseRate),
      
      // Message length compatibility (similar communication styles)
      1 - Math.abs(behavior1.messageLength - behavior2.messageLength) / 100,
      
      // Active hours overlap
      this.calculateActiveHoursOverlap(behavior1.activeHours, behavior2.activeHours),
      
      // Activity level compatibility
      1 - Math.abs(behavior1.checkInFrequency - behavior2.checkInFrequency) / 10,
    ];

    return factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
  }

  // Calculate preference compatibility
  private calculatePreferenceCompatibility(
    user1: UserProfile,
    user2: UserProfile
  ): number {
    const pref1 = user1.preferences;
    const pref2 = user2.preferences;

    let score = 0;
    let factors = 0;

    // Age compatibility
    const age1 = user1.demographics.age;
    const age2 = user2.demographics.age;
    
    if (age1 >= pref2.ageRange[0] && age1 <= pref2.ageRange[1] &&
        age2 >= pref1.ageRange[0] && age2 <= pref1.ageRange[1]) {
      score += 1;
    }
    factors++;

    // Dealbreaker check
    const hasDealbreakers = pref1.dealbreakers.some(dealbreaker => 
      user2.interests.includes(dealbreaker) || 
      user2.demographics.occupation === dealbreaker
    ) || pref2.dealbreakers.some(dealbreaker => 
      user1.interests.includes(dealbreaker) || 
      user1.demographics.occupation === dealbreaker
    );

    if (hasDealbreakers) {
      return 0; // Dealbreakers are absolute
    }

    // Must-have check
    const hasMustHaves1 = pref1.mustHaves.every(mustHave => 
      user2.interests.includes(mustHave) || 
      user2.demographics.occupation === mustHave
    );
    const hasMustHaves2 = pref2.mustHaves.every(mustHave => 
      user1.interests.includes(mustHave) || 
      user1.demographics.occupation === mustHave
    );

    if (hasMustHaves1) score += 1;
    if (hasMustHaves2) score += 1;
    factors += 2;

    return score / factors;
  }

  // Calculate active hours overlap
  private calculateActiveHoursOverlap(hours1: number[], hours2: number[]): number {
    const set1 = new Set(hours1);
    const set2 = new Set(hours2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  // Calculate distance between two points
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Generate match reasons
  private generateMatchReasons(
    user1: UserProfile,
    user2: UserProfile,
    scores: MatchScore['compatibilityScores']
  ): string[] {
    const reasons: string[] = [];

    if (scores.personality > 0.8) {
      reasons.push('Great personality compatibility');
    }
    if (scores.interests > 0.7) {
      reasons.push('Shared interests');
    }
    if (scores.location > 0.9) {
      reasons.push('Nearby location');
    }
    if (scores.behavior > 0.8) {
      reasons.push('Similar communication style');
    }
    if (scores.preferences > 0.9) {
      reasons.push('Perfect preference match');
    }

    // Add specific interest matches
    const commonInterests = user1.interests.filter(interest => 
      user2.interests.includes(interest)
    );
    if (commonInterests.length > 0) {
      reasons.push(`Both love ${commonInterests.slice(0, 2).join(' and ')}`);
    }

    return reasons;
  }

  // Calculate confidence score
  private calculateConfidence(user1: UserProfile, user2: UserProfile): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on profile completeness
    const completeness1 = this.calculateProfileCompleteness(user1);
    const completeness2 = this.calculateProfileCompleteness(user2);
    confidence += (completeness1 + completeness2) * 0.2;

    // Increase confidence based on user activity
    confidence += (user1.behavior.responseRate + user2.behavior.responseRate) * 0.1;

    // Decrease confidence for new users
    if (user1.behavior.checkInFrequency < 2 || user2.behavior.checkInFrequency < 2) {
      confidence -= 0.2;
    }

    return Math.max(0.1, Math.min(1, confidence));
  }

  // Calculate profile completeness
  private calculateProfileCompleteness(user: UserProfile): number {
    let completeness = 0;
    let factors = 0;

    // Check required fields
    if (user.interests.length > 0) completeness += 1;
    if (user.demographics.age > 0) completeness += 1;
    if (user.location.city) completeness += 1;
    if (user.demographics.occupation) completeness += 1;
    factors += 4;

    // Check optional fields
    if (user.interests.length >= 5) completeness += 1;
    if (user.behavior.responseRate > 0) completeness += 1;
    factors += 2;

    return completeness / factors;
  }

  // Main matching function
  async calculateMatchScore(
    user1: UserProfile,
    user2: UserProfile
  ): Promise<MatchScore> {
    const personalityScore = this.calculatePersonalityCompatibility(
      user1.personality,
      user2.personality
    );

    const interestsScore = this.calculateInterestCompatibility(
      user1.interests,
      user2.interests
    );

    const locationScore = this.calculateLocationCompatibility(
      user1.location,
      user2.location,
      Math.max(user1.preferences.distance, user2.preferences.distance)
    );

    const behaviorScore = this.calculateBehaviorCompatibility(
      user1.behavior,
      user2.behavior
    );

    const preferencesScore = this.calculatePreferenceCompatibility(user1, user2);

    const compatibilityScores = {
      personality: personalityScore,
      interests: interestsScore,
      location: locationScore,
      behavior: behaviorScore,
      preferences: preferencesScore,
    };

    // Calculate weighted overall score
    const overallScore = Object.entries(this.compatibilityWeights).reduce(
      (total, [key, weight]) => total + compatibilityScores[key as keyof typeof compatibilityScores] * weight,
      0
    );

    const reasons = this.generateMatchReasons(user1, user2, compatibilityScores);
    const confidence = this.calculateConfidence(user1, user2);

    // Track matching event
    analytics.track('ai_match_calculated', {
      user_id: user1.id,
      matched_user_id: user2.id,
      overall_score: overallScore,
      confidence: confidence,
      model_version: this.modelVersion,
    });

    return {
      userId: user1.id,
      matchedUserId: user2.id,
      overallScore,
      compatibilityScores,
      reasons,
      confidence,
    };
  }

  // Predict if two users will match
  async predictMatch(
    user1: UserProfile,
    user2: UserProfile
  ): Promise<MatchPrediction> {
    const matchScore = await this.calculateMatchScore(user1, user2);
    
    // Use logistic regression-like prediction
    const probability = 1 / (1 + Math.exp(-10 * (matchScore.overallScore - 0.6)));
    const willMatch = probability > 0.7;

    const factors = matchScore.reasons.slice(0, 3);

    return {
      willMatch,
      probability,
      factors,
    };
  }

  // Get top matches for a user
  async getTopMatches(
    user: UserProfile,
    candidates: UserProfile[],
    limit: number = 10
  ): Promise<MatchScore[]> {
    const matchPromises = candidates.map(candidate => 
      this.calculateMatchScore(user, candidate)
    );

    const matches = await Promise.all(matchPromises);
    
    // Sort by overall score and confidence
    return matches
      .sort((a, b) => {
        const scoreA = a.overallScore * a.confidence;
        const scoreB = b.overallScore * b.confidence;
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }

  // Update model based on user feedback
  async updateModel(
    userId: string,
    matchedUserId: string,
    feedback: 'positive' | 'negative' | 'neutral'
  ): Promise<void> {
    // In a real implementation, this would update the ML model
    analytics.track('ai_model_feedback', {
      user_id: userId,
      matched_user_id: matchedUserId,
      feedback: feedback,
      model_version: this.modelVersion,
    });
  }

  // Get model performance metrics
  async getModelMetrics(): Promise<{
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    totalPredictions: number;
  }> {
    // In a real implementation, this would return actual metrics
    return {
      accuracy: 0.85,
      precision: 0.82,
      recall: 0.88,
      f1Score: 0.85,
      totalPredictions: 10000,
    };
  }
}

export const aiMatchingService = new AIMatchingService(); 