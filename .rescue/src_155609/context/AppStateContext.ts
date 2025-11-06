import { createContext, useContext } from 'react';
import { Interest, Match, User } from '../types';

interface AppStateContextType {
  currentUser: { id: string; name?: string } | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<{ id: string; name?: string } | null>>;
  interests: Interest[];
  setInterests: React.Dispatch<React.SetStateAction<Interest[]>>;
  matches: Match[];
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  likedUsers: string[];
  setLikedUsers: React.Dispatch<React.SetStateAction<string[]>>;
  matchedUser: User | null;
  setMatchedUser: React.Dispatch<React.SetStateAction<User | null>>;
  showMatchModal: boolean;
  setShowMatchModal: React.Dispatch<React.SetStateAction<boolean>>;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ id: string; name?: string } | null>;
  logout: () => Promise<void>;
  expressInterest: (userId: string, venueId: string) => Promise<boolean>;
  shareContact: (matchId: string) => Promise<boolean>;
}

export const AppStateContext = createContext<AppStateContextType | null>(null);

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used within AppStateProvider');
  return context;
}; 