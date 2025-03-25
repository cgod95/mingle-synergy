
// Basic user type that both components can use
export interface MatchUser {
  id: string;
  name: string;
  photos: string[];
  age?: number;
  interests?: string[];
  isCheckedIn?: boolean;
  isVisible?: boolean;
}

// Contact info type
export interface ContactInfo {
  type: 'phone' | 'instagram' | 'snapchat' | 'custom';
  value: string;
  sharedBy: string;
  sharedAt: number | string; // Support both number and string for backward compatibility
}

// Match type
export interface Match {
  id: string;
  userId: string;
  matchedUserId: string;
  venueId: string;
  venueName?: string;
  timestamp: number;
  isActive: boolean;
  expiresAt: number;
  contactShared: boolean;
  contactInfo?: ContactInfo;
  matchedUser?: MatchUser;
}

// Props for MatchCard component
export interface MatchCardProps {
  match: Match;
  user: MatchUser;
  onShareContact: (matchId: string, contactInfo: ContactInfo) => Promise<boolean>;
  onReconnectRequest?: (matchId: string) => Promise<boolean>;
  onWeMetClick?: (matchId: string) => Promise<boolean>;
}
