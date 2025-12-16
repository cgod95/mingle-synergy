import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Interest, Match, User } from '../types';
import { getInterests, getMatches } from '../utils/localStorageUtils';
import services from '../services';

// Explicitly define what a UserType looks like for TypeScript
type UserType = {
  id: string;
  name: string;
  photos: string[];
  isCheckedIn: boolean;
  currentVenue: string | null;
  currentZone?: string | null;
  age?: number;
  gender?: string;
  interestedIn?: string[];
  email?: string;
  bio?: string;
  ageRangePreference?: [number, number];
  createdAt?: number;
  lastActive?: number;
  matches?: string[];
  likedUsers?: string[];
  blockedUsers?: string[];
};

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

// Create the context (defined here after type to avoid circular dependency)
const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<{ id: string; name?: string } | null>(null);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [likedUsers, setLikedUsers] = useState<string[]>([]);
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Placeholder functions
  const login = async (email, password) => null;
  const logout = async () => {};
  const expressInterest = async (userId, venueId) => true;
  const shareContact = async (matchId) => true;

  // Initialize from localStorage or default values
  useEffect(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      setCurrentUser(JSON.parse(saved));
    } else {
      setCurrentUser({ id: 'u1', name: 'Demo User' }); // Default user for demo
    }
  }, []);
  
  useEffect(() => {
    const savedInterests = localStorage.getItem('interests');
    if (savedInterests) {
      setInterests(JSON.parse(savedInterests));
    } else {
      setInterests(getInterests(currentUser?.id || 'default'));
    }
  }, [currentUser?.id]); // CRITICAL: Only depend on ID, not whole object to prevent re-renders
  
  useEffect(() => {
    const savedMatches = localStorage.getItem('matches');
    if (savedMatches) {
      setMatches(JSON.parse(savedMatches));
    } else {
      setMatches(getMatches(currentUser?.id || 'default'));
    }
  }, [currentUser?.id]); // CRITICAL: Only depend on ID, not whole object to prevent re-renders
  
  useEffect(() => {
    const savedLikedUsers = localStorage.getItem('likedUsers');
    if (savedLikedUsers) {
      setLikedUsers(JSON.parse(savedLikedUsers));
    }
  }, []);

  // Persist to localStorage on change
  // CRITICAL: Use ref to track previous ID to prevent unnecessary saves
  const prevUserIdRef = React.useRef<string | null>(currentUser?.id || null);
  useEffect(() => {
    const currentUserId = currentUser?.id || null;
    // Only save if user ID actually changed, not on object reference changes
    if (currentUserId !== prevUserIdRef.current && currentUser) {
      prevUserIdRef.current = currentUserId;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
  }, [currentUser?.id, currentUser]); // Depend on ID for re-runs, but check object for saving
  
  useEffect(() => {
    localStorage.setItem('interests', JSON.stringify(interests));
  }, [interests]);
  
  useEffect(() => {
    localStorage.setItem('matches', JSON.stringify(matches));
  }, [matches]);
  
  useEffect(() => {
    localStorage.setItem('likedUsers', JSON.stringify(likedUsers));
  }, [likedUsers]);

  // Expose state and updaters
  const value: AppStateContextType = {
    currentUser,
    setCurrentUser,
    interests,
    setInterests,
    matches,
    setMatches,
    likedUsers,
    setLikedUsers,
    matchedUser,
    setMatchedUser,
    showMatchModal,
    setShowMatchModal,
    isAuthenticated,
    isLoading,
    login,
    logout,
    expressInterest,
    shareContact,
  };
  
  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

// Export hook to use the context
export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

// Export context for direct access if needed
export { AppStateContext };
