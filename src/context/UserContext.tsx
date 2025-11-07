import React, { useState, ReactNode } from 'react';
import config from '../config';
import { User } from '../types';
import { UserContext } from './UserContext';

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(
    config.DEMO_MODE
      ? {
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
        }
      : null
  );

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>{children}</UserContext.Provider>
  );
};