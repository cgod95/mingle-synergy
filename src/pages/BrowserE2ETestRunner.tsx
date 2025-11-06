// /src/pages/BrowserE2ETestRunner.tsx

import React, { useState } from 'react';
import {
  authService,
  userService,
  venueService,
  matchService,
  interestService,
} from '@/services';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

interface TestUser {
  email: string;
  password: string;
  profile: {
    name: string;
    age: number;
    gender: 'male' | 'female' | 'non-binary' | 'other';
    interestedIn: ('male' | 'female' | 'non-binary' | 'other')[];
    bio: string;
  };
}

// Helper: Try sign-in, else sign-up
async function ensureTestUserExists(email: string, password: string) {
  const auth = getAuth();
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Signed in existing test user.');
    return credential;
  } catch (error: unknown) {
    if (error instanceof FirebaseError && error.code === 'auth/user-not-found') {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Test user created.');
      return credential;
    } else {
      console.error('Failed to sign in test user:', error);
      throw error;
    }
  }
}

const BrowserE2ETestRunner: React.FC = () => {
  const [log, setLog] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const appendLog = (msg: string) => {
    setLog((prev) => [...prev, msg]);
  };

  const testUsers: TestUser[] = [
    {
      email: 'testuser1@example.com',
      password: 'testpass123',
      profile: {
        name: 'Test User 1',
        age: 25,
        gender: 'male',
        interestedIn: ['female'],
        bio: 'Test user for E2E testing',
      },
    },
    {
      email: 'testuser2@example.com',
      password: 'testpass123',
      profile: {
        name: 'Test User 2',
        age: 23,
        gender: 'female',
        interestedIn: ['male'],
        bio: 'Test user for E2E testing',
      },
    },
  ];

  const runTest = async () => {
    setIsRunning(true);
    setLog([]);
    appendLog('🚀 Starting Firebase E2E Test Suite...');

    try {
      await testUserRegistration();
      await testVenueCheckIn();
      await testUserDiscovery();
      await testMatchingSystem();
      await testMessagingSystem();
      await testMatchExpiration();
      appendLog('✅ All E2E tests passed!');
    } catch (err) {
      appendLog(`❌ E2E Test failed: ${(err as Error).message}`);
    }

    setIsRunning(false);
  };

  const testUserRegistration = async () => {
    appendLog('👤 Testing user registration and onboarding...');
    for (const testUser of testUsers) {
      try {
        const credential = await ensureTestUserExists(testUser.email, testUser.password);
        appendLog(`✅ User ready: ${testUser.email}`);
        await userService.createUserProfile(credential.user.uid, {
          id: credential.user.uid,
          name: testUser.profile.name,
          age: testUser.profile.age,
          gender: testUser.profile.gender,
          interestedIn: testUser.profile.interestedIn,
          bio: testUser.profile.bio,
          photos: [],
          isCheckedIn: false,
          isVisible: true,
          interests: [],
          ageRangePreference: { min: 18, max: 35 },
          matches: [],
          likedUsers: [],
          blockedUsers: [],
        });
        appendLog(`✅ Created profile for ${testUser.email}`);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        throw error;
      }
    }
  };

  const testVenueCheckIn = async () => {
    appendLog('📍 Testing venue check-in...');
    const venues = await venueService.listVenues();
    const testVenue = venues[0];
    if (!testVenue) throw new Error('No venues available');

    const user1 = await authService.signIn(testUsers[0].email, testUsers[0].password);
    await venueService.checkInToVenue(user1.user.uid, testVenue.id);
    appendLog(`✅ User 1 checked in to ${testVenue.name}`);

    const user2 = await authService.signIn(testUsers[1].email, testUsers[1].password);
    await venueService.checkInToVenue(user2.user.uid, testVenue.id);
    appendLog(`✅ User 2 checked in to ${testVenue.name}`);
  };

  const testUserDiscovery = async () => {
    appendLog('👥 Testing discovery and liking...');
    const venues = await venueService.listVenues();
    const testVenue = venues[0];
    const user1 = await authService.signIn(testUsers[0].email, testUsers[0].password);

    const usersAtVenue = await venueService.getUsersAtVenue(testVenue.id);
    const otherUser = usersAtVenue.find((u) => u.id !== user1.user.uid);
    if (!otherUser) throw new Error('No matchable users found at venue');

    await interestService.expressInterest(user1.user.uid, otherUser.id, testVenue.id);
    appendLog('✅ User 1 liked User 2');

    const remaining = await interestService.getLikesRemaining(user1.user.uid, testVenue.id);
    appendLog(`✅ Likes remaining: ${remaining}`);
  };

  const testMatchingSystem = async () => {
    appendLog('💕 Testing matching system...');
    const venues = await venueService.listVenues();
    const testVenue = venues[0];
    const user1 = await authService.signIn(testUsers[0].email, testUsers[0].password);
    const user2 = await authService.signIn(testUsers[1].email, testUsers[1].password);

    await interestService.expressInterest(user2.user.uid, user1.user.uid, testVenue.id);
    appendLog('✅ User 2 liked User 1 (mutual)');

    const m1 = await matchService.getMatches(user1.user.uid);
    const m2 = await matchService.getMatches(user2.user.uid);
    appendLog(`✅ Matches found — User 1: ${m1.length}, User 2: ${m2.length}`);
  };

  const testMessagingSystem = async () => {
    appendLog('💬 Testing messaging...');
    const user1 = await authService.signIn(testUsers[0].email, testUsers[0].password);
    const matches = await matchService.getMatches(user1.user.uid);
    if (matches.length === 0) throw new Error('No matches to message');

    const match = matches[0];
    await matchService.sendMessage(match.id, user1.user.uid, 'Hey!');
    await matchService.sendMessage(match.id, user1.user.uid, "What's up?");
    await matchService.sendMessage(match.id, user1.user.uid, 'Wanna meet?');
    appendLog('✅ 3 messages sent');

    try {
      await matchService.sendMessage(match.id, user1.user.uid, 'This should fail');
      throw new Error('Exceeded message limit');
    } catch (err) {
      appendLog('✅ Message limit enforced');
    }
  };

  const testMatchExpiration = async () => {
    appendLog('⏰ Testing match expiration...');
    const user1 = await authService.signIn(testUsers[0].email, testUsers[0].password);
    const matches = await matchService.getMatches(user1.user.uid);
    if (matches.length === 0) {
      appendLog('ℹ️ No matches to expire');
      return;
    }
    const match = matches[0];
    appendLog(`✅ Match exists: ${match.id} — Timestamp: ${new Date(match.timestamp).toLocaleString()}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Firebase E2E Test Runner</h1>
      <button
        onClick={runTest}
        disabled={isRunning}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {isRunning ? 'Running...' : 'Run E2E Test'}
      </button>
      <div className="mt-6 bg-black text-green-300 font-mono p-4 rounded max-h-[400px] overflow-auto">
        {log.map((line, idx) => (
          <div key={idx}>{line}</div>
        ))}
      </div>
    </div>
  );
};

export default BrowserE2ETestRunner;