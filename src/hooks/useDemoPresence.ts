// Hook to simulate dynamic presence in demo mode
// Randomly updates activity states for demo users to make venues feel alive

import { useEffect, useState } from 'react';
import { DEMO_PEOPLE, Person } from '@/lib/demoPeople';
import config from '@/config';

const UPDATE_INTERVAL_MS = 60000; // Update every 60 seconds
const ACTIVITY_CHANGE_PROBABILITY = 0.3; // 30% chance a user's activity changes

export function useDemoPresence(venueId?: string): Person[] {
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    if (!config.DEMO_MODE) {
      // In production, this hook does nothing
      return;
    }

    const updatePresence = () => {
      const now = Date.now();
      const venuePeople = venueId 
        ? DEMO_PEOPLE.filter(p => p.currentVenue === venueId)
        : DEMO_PEOPLE;

      // Randomly update activity states for some users
      const updatedPeople = venuePeople.map(person => {
        if (Math.random() < ACTIVITY_CHANGE_PROBABILITY) {
          // Randomly update lastActive timestamp (within last 2 hours)
          const newLastActive = now - Math.random() * 7200000;
          return {
            ...person,
            lastActive: newLastActive,
          };
        }
        return person;
      });

      setPeople(updatedPeople);
    };

    // Initial update
    updatePresence();

    // Set up interval for periodic updates
    const interval = setInterval(updatePresence, UPDATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [venueId]);

  return people;
}

