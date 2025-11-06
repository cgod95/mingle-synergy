// Web Worker for matching algorithm computations

interface User {
  id: string;
  interests: string[];
  location: { lat: number; lng: number };
  preferences: Record<string, unknown>;
}

interface MatchResult {
  userId: string;
  matchedUserId: string;
  score: number;
  reasons: string[];
}

interface MatchingRequest {
  type: 'calculateMatches';
  users: User[];
  currentUserId: string;
  venueId: string;
}

interface MatchingResponse {
  type: 'matchesCalculated';
  matches: MatchResult[];
  processingTime: number;
}

interface WorkerMessage {
  type: string;
  data: unknown;
  id?: string;
}

interface MatchingData {
  users: UserData[];
  preferences: UserPreferences;
  algorithm: string;
}

interface UserData {
  id: string;
  name: string;
  age: number;
  interests: string[];
  location: { lat: number; lng: number };
}

interface UserPreferences {
  ageRange: { min: number; max: number };
  maxDistance: number;
  interests: string[];
}

// Calculate distance between two points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

// Calculate interest similarity
function calculateInterestSimilarity(interests1: string[], interests2: string[]): number {
  if (interests1.length === 0 || interests2.length === 0) return 0;
  
  const set1 = new Set(interests1);
  const set2 = new Set(interests2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

// Calculate compatibility score
function calculateCompatibilityScore(user1: User, user2: User): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let totalScore = 0;
  
  // Interest similarity (40% weight)
  const interestScore = calculateInterestSimilarity(user1.interests, user2.interests);
  totalScore += interestScore * 0.4;
  if (interestScore > 0.3) reasons.push('Shared interests');
  
  // Distance (30% weight)
  const distance = calculateDistance(
    user1.location.lat, user1.location.lng,
    user2.location.lat, user2.location.lng
  );
  const distanceScore = Math.max(0, 1 - distance / 10); // 10km max
  totalScore += distanceScore * 0.3;
  if (distance < 2) reasons.push('Nearby location');
  
  // Preference compatibility (30% weight)
  let preferenceScore = 0;
  const preferenceKeys = Object.keys(user1.preferences);
  let matchingPreferences = 0;
  
  preferenceKeys.forEach(key => {
    if (user1.preferences[key] === user2.preferences[key]) {
      matchingPreferences++;
    }
  });
  
  preferenceScore = preferenceKeys.length > 0 ? matchingPreferences / preferenceKeys.length : 0;
  totalScore += preferenceScore * 0.3;
  if (preferenceScore > 0.5) reasons.push('Compatible preferences');
  
  return { score: totalScore, reasons };
}

// Main matching algorithm
function calculateMatches(users: User[], currentUserId: string): MatchResult[] {
  const startTime = performance.now();
  const currentUser = users.find(u => u.id === currentUserId);
  
  if (!currentUser) {
    return [];
  }
  
  const matches: MatchResult[] = [];
  
  users.forEach(user => {
    if (user.id === currentUserId) return;
    
    const compatibility = calculateCompatibilityScore(currentUser, user);
    
    if (compatibility.score > 0.3) { // Minimum compatibility threshold
      matches.push({
        userId: currentUserId,
        matchedUserId: user.id,
        score: compatibility.score,
        reasons: compatibility.reasons
      });
    }
  });
  
  // Sort by score (highest first)
  matches.sort((a, b) => b.score - a.score);
  
  const processingTime = performance.now() - startTime;
  
  return matches.slice(0, 10); // Return top 10 matches
}

// Worker message handler
self.addEventListener('message', (event: MessageEvent<MatchingRequest & { startTime?: number }>) => {
  const { type, users, currentUserId } = event.data;
  
  if (type === 'calculateMatches') {
    const matches = calculateMatches(users, currentUserId);
    const processingTime = performance.now() - (event.data.startTime || 0);
    
    const response: MatchingResponse = {
      type: 'matchesCalculated',
      matches,
      processingTime
    };
    
    self.postMessage(response);
  }
});

// Export for TypeScript
export type { MatchingRequest, MatchingResponse, User, MatchResult };

const handleMatchingRequest = (data: MatchingData) => {
  const { users, preferences, algorithm } = data;
  
  // Process matching based on algorithm
  const results = processMatching(users, preferences, algorithm);
  
  self.postMessage({
    type: 'MATCHING_RESULTS',
    data: results,
    id: currentRequestId
  });
}; 