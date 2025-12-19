export type Match = {
  id: string;
  userId1: string;
  userId2: string;
  venueId: string;
  venueName?: string;
  timestamp: number;
  // NOTE: Messages are stored in the separate 'messages' collection, not embedded here
  isRematch?: boolean;
  matchExpired?: boolean;
  expiredAt?: number;
  weMetConfirmed?: boolean;
  weMetConfirmedBy?: string;
  weMetConfirmedAt?: number; // Firestore timestamp as number
  confirmations?: Record<string, boolean>; // New confirmation structure
  confirmedAt?: Record<string, string>; // Timestamps for each confirmation
};

export type FirestoreMatch = Match;

// Frontend display match card
export type DisplayMatch = {
  id: string;
  name: string;
  age: number;
  bio: string;
  photoUrl: string;
  isOnline?: boolean;
  venue?: { name: string };
  distance?: number;
  matchedAt?: string;
  lastMessage?: { content: string };
  mutualInterests?: string[];
}; 