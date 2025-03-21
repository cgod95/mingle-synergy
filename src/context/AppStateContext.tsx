
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Interest, Match } from '@/types';
import { getInterests, getMatches } from '@/utils/localStorageUtils';

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
}

const AppStateContext = createContext<AppStateContextType | null>(null);

export const AppStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize from localStorage or default values
  const [currentUser, setCurrentUser] = useState<{ id: string; name?: string } | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : { id: 'u1', name: 'Demo User' }; // Default user for demo
  });
  
  const [interests, setInterests] = useState<Interest[]>(() => {
    return getInterests();
  });
  
  const [matches, setMatches] = useState<Match[]>(() => {
    return getMatches();
  });
  
  const [likedUsers, setLikedUsers] = useState<string[]>(() => {
    const saved = localStorage.getItem('likedUsers');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  
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
  
  // Expose state and updaters
  const value = {
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
