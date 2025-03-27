import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Interest, Match } from '@/types';
import { getInterests, getMatches } from '@/utils/localStorageUtils';
import services from '@/services';

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

const AppStateContext = createContext<AppStateContextType | null>(null);

export const AppStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize from localStorage or default values
  const [currentUser, setCurrentUser] = useState<{ id: string; name?: string } | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : { id: 'u1', name: 'Demo User' }; // Default user for demo
  });
  
  const [interests, setInterests] = useState<Interest[]>(() => {
    return getInterests(currentUser?.id || 'default');
  });
  
  const [matches, setMatches] = useState<Match[]>(() => {
    return getMatches(currentUser?.id || 'default');
  });
  
  const [likedUsers, setLikedUsers] = useState<string[]>(() => {
    const saved = localStorage.getItem('likedUsers');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // For demo purposes
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Persist to localStorage on change
  useEffect(() => {
    if (currentUser) localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [currentUser]);
  
  useEffect(() => {
    localStorage.setItem('interests', JSON.stringify(interests));
  }, [interests]);
  
  useEffect(() => {
    localStorage.setItem('matches', JSON.stringify(matches));
  }, [matches]);
  
  useEffect(() => {
    localStorage.setItem('likedUsers', JSON.stringify(likedUsers));
  }, [likedUsers]);

  // Authentication actions
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { user } = await services.auth.signIn(email, password);
      
      if (user) {
        const userInfo = {
          id: user.uid,
          name: user.displayName || email.split('@')[0]
        };
        setCurrentUser(userInfo);
        setIsAuthenticated(true);
        return userInfo;
      }
      
      return null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      setIsLoading(true);
      await services.auth.signOut();
      // For demo purposes, we don't actually clear the user
      // setCurrentUser(null);
      // setIsAuthenticated(false);
      console.log('User logged out (but kept in state for demo)');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Interest and match actions
  const expressInterest = async (userId: string, venueId: string): Promise<boolean> => {
    if (!currentUser) return false;
    
    try {
      // Create new interest
      const newInterest: Omit<Interest, 'id'> = {
        fromUserId: currentUser.id,
        toUserId: userId,
        venueId: venueId,
        timestamp: Date.now(),
        isActive: true,
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 // 24 hours
      };
      
      // Update interests state
      const interestId = `int-${Date.now()}`;
      const interestWithId = { ...newInterest, id: interestId };
      setInterests(prev => [...prev, interestWithId]);
      
      // Check for mutual interest
      const mutualInterest = interests.find(
        i => i.fromUserId === userId && i.toUserId === currentUser.id && i.isActive
      );
      
      if (mutualInterest) {
        // Create a match
        const newMatch: Omit<Match, 'id'> = {
          userId: currentUser.id,
          matchedUserId: userId,
          venueId: venueId,
          timestamp: Date.now(),
          isActive: true,
          expiresAt: Date.now() + 1000 * 60 * 60 * 3, // 3 hours
          contactShared: false
        };
        
        const matchId = `match-${Date.now()}`;
        const matchWithId = { ...newMatch, id: matchId };
        setMatches(prev => [...prev, matchWithId]);
      }
      
      return true;
    } catch (error) {
      console.error('Express interest error:', error);
      return false;
    }
  };
  
  const shareContact = async (matchId: string): Promise<boolean> => {
    try {
      // Update match in state
      setMatches(prev => prev.map(match => {
        if (match.id === matchId) {
          return { ...match, contactShared: true };
        }
        return match;
      }));
      
      return true;
    } catch (error) {
      console.error('Share contact error:', error);
      return false;
    }
  };
  
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
    shareContact
  };
  
  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used within AppStateProvider');
  return context;
};
