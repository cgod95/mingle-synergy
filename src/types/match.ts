export type Match = {
  id: string;
  userId1: string;
  userId2: string;
  venueId: string;
  venueName?: string;
  timestamp: number;
  messages: Array<{ senderId: string; text: string; timestamp: number }>;
  isRematch?: boolean;
  matchExpired?: boolean;
  expiredAt?: number;
  weMetConfirmed?: boolean;
  weMetConfirmedBy?: string;
  weMetConfirmedAt?: number;
  confirmations?: Record<string, boolean>;
  confirmedAt?: Record<string, string>;
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