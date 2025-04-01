import { UserProfile } from './UserProfile';

// Match stored in Firestore
export interface Match {
  id: string;
  userId: string;
  matchedUserId: string;
  venueId?: string;
  reconnectRequested?: boolean;
  met?: boolean;
  sharedContact?: string[];
}

// Matched user object (UserProfile with ID for rendering)
export type MatchUser = Partial<UserProfile> & {
  id: string;
};