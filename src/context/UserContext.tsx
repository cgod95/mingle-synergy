import React, { useState, ReactNode, useMemo, useRef, useEffect } from 'react';
import config from '../config';
import { User } from '../types';
import { UserContext } from './UserContext';

// Create stable initial demo user object outside component to prevent recreation
const INITIAL_DEMO_USER: User = {
  id: 'demo-uid',
  name: 'Demo User',
  age: 30,
  bio: 'This is a demo user.',
  photos: [],
  isCheckedIn: false,
  isVisible: true,
  interests: [],
  gender: 'other',
  interestedIn: ['female', 'male', 'non-binary', 'other'],
  ageRangePreference: { min: 18, max: 99 },
  matches: [],
  likedUsers: [],
  blockedUsers: [],
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(
    config.DEMO_MODE ? INITIAL_DEMO_USER : null
  );
  
  // Track latest user in ref to always have current value without causing re-renders
  const latestUserRef = useRef<User | null>(currentUser);
  
  // Always update ref to latest user (doesn't cause re-renders)
  latestUserRef.current = currentUser;

  // Memoize context value - only recreate when user ID changes, not on object reference changes
  // Use latestUserRef.current to always provide latest user object, but only re-render when ID changes
  // This prevents cascading re-renders when user object is recreated with same ID
  const value = useMemo(
    () => ({ currentUser: latestUserRef.current, setCurrentUser }),
    [currentUser?.id, setCurrentUser] // CRITICAL: Only depend on ID, not whole object
  );

  return (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  );
};