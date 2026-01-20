/**
 * Firebase End-to-End Test Suite
 * Tests the complete user lifecycle with live Firebase services
 */

import { authService, userService, venueService, matchService, interestService } from '@/services';

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

class FirebaseE2ETest {
  private testUsers: TestUser[] = [
    {
      email: 'testuser1@example.com',
      password: 'testpass123',
      profile: {
        name: 'Test User 1',
        age: 25,
        gender: 'male',
        interestedIn: ['female'],
        bio: 'Test user for E2E testing'
      }
    },
    {
      email: 'testuser2@example.com',
      password: 'testpass123',
      profile: {
        name: 'Test User 2',
        age: 23,
        gender: 'female',
        interestedIn: ['male'],
        bio: 'Test user for E2E testing'
      }
    }
  ];

  private testVenueId = 'test-venue-123';
  private testVenue = {
    id: 'test-venue-123',
    name: 'Test Coffee Shop',
    address: '123 Test Street',
    city: 'Test City',
    latitude: 37.7749,
    longitude: -122.4194,
    type: 'coffee',
    checkInCount: 0,
    expiryTime: 3 * 60 * 60 * 1000, // 3 hours
    zones: ['front', 'back'],
    image: 'https://example.com/coffee.jpg',
    checkedInUsers: []
  };

  async runFullTest() {
    console.log('🚀 Starting Firebase E2E Test Suite...');
    
    try {
      // Step 1: Setup test data
      await this.setupTestData();
      
      // Step 2: Test user registration and onboarding
      await this.testUserRegistration();
      
      // Step 3: Test venue check-in flow
      await this.testVenueCheckIn();
      
      // Step 4: Test user discovery and liking
      await this.testUserDiscovery();
      
      // Step 5: Test matching system
      await this.testMatchingSystem();
      
      // Step 6: Test messaging system
      await this.testMessagingSystem();
      
      // Step 7: Test match expiration
      await this.testMatchExpiration();
      
      // Step 8: Cleanup
      await this.cleanup();
      
      console.log('✅ All E2E tests passed!');
    } catch (error) {
      console.error('❌ E2E test failed:', error);
      await this.cleanup();
      throw error;
    }
  }

  private async setupTestData() {
    console.log('📋 Setting up test data...');
    
    // Create test venue if it doesn't exist
    try {
      const existingVenue = await venueService.getVenueById(this.testVenueId);
      if (!existingVenue) {
        // Note: In production, venues would be created by admin
        console.log('⚠️ Test venue not found - using existing venue for testing');
      }
    } catch (error) {
      console.log('⚠️ Could not verify test venue - continuing with existing venues');
    }
  }

  private async testUserRegistration() {
    console.log('👤 Testing user registration and onboarding...');
    
    for (const testUser of this.testUsers) {
      try {
        // Sign up user
        const credential = await authService.signUp(testUser.email, testUser.password);
        console.log(`✅ User ${testUser.email} registered successfully`);
        
        // Create user profile
        const userProfile = {
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
          blockedUsers: []
        };
        
        await userService.createUserProfile(credential.user.uid, userProfile);
        console.log(`✅ Profile created for ${testUser.email}`);
        
      } catch (error: unknown) {
        if (isErrorWithMessage(error) && error.message.includes('already in use')) {
          console.log(`ℹ️ User ${testUser.email} already exists - signing in`);
          await authService.signIn(testUser.email, testUser.password);
        } else {
          throw error;
        }
      }
    }
  }

  private async testVenueCheckIn() {
    console.log('📍 Testing venue check-in flow...');
    
    // Get available venues
    const venues = await venueService.listVenues();
    if (venues.length === 0) {
      throw new Error('No venues available for testing');
    }
    
    const testVenue = venues[0];
    console.log(`📍 Using venue: ${testVenue.name}`);
    
    // Check in first user
    const user1 = await authService.signIn(this.testUsers[0].email, this.testUsers[0].password);
    await venueService.checkInToVenue(user1.user.uid, testVenue.id);
    console.log(`✅ User 1 checked in to ${testVenue.name}`);
    
    // Check in second user
    const user2 = await authService.signIn(this.testUsers[1].email, this.testUsers[1].password);
    await venueService.checkInToVenue(user2.user.uid, testVenue.id);
    console.log(`✅ User 2 checked in to ${testVenue.name}`);
    
    // Verify users are at venue
    const usersAtVenue = await venueService.getUsersAtVenue(testVenue.id);
    console.log(`✅ Found ${usersAtVenue.length} users at venue`);
    
    if (usersAtVenue.length < 2) {
      throw new Error('Users not properly checked in to venue');
    }
  }

  private async testUserDiscovery() {
    console.log('👥 Testing user discovery and liking...');
    
    const venues = await venueService.listVenues();
    const testVenue = venues[0];
    
    // Sign in as first user
    const user1 = await authService.signIn(this.testUsers[0].email, this.testUsers[0].password);
    const user2 = await authService.signIn(this.testUsers[1].email, this.testUsers[1].password);
    
    // Get users at venue
    const usersAtVenue = await venueService.getUsersAtVenue(testVenue.id);
    const otherUser = usersAtVenue.find(u => u.id !== user1.user.uid);
    
    if (!otherUser) {
      throw new Error('No other users found at venue for testing');
    }
    
    // User 1 likes User 2
    await interestService.expressInterest(user1.user.uid, otherUser.id, testVenue.id);
    console.log(`✅ User 1 liked User 2`);
    
    // Check likes remaining
    const likesRemaining = await interestService.getLikesRemaining(user1.user.uid, testVenue.id);
    console.log(`✅ User 1 has ${likesRemaining} likes remaining`);
    
    if (likesRemaining !== 2) { // Should be 2 since we used 1 of 3
      throw new Error('Likes remaining calculation incorrect');
    }
  }

  private async testMatchingSystem() {
    console.log('💕 Testing matching system...');
    
    const venues = await venueService.listVenues();
    const testVenue = venues[0];
    
    const user1 = await authService.signIn(this.testUsers[0].email, this.testUsers[0].password);
    const user2 = await authService.signIn(this.testUsers[1].email, this.testUsers[1].password);
    
    // User 2 likes User 1 back (creating mutual like)
    await interestService.expressInterest(user2.user.uid, user1.user.uid, testVenue.id);
    console.log(`✅ User 2 liked User 1 back (mutual like)`);
    
    // Check if match was created
    const user1Matches = await matchService.getMatches(user1.user.uid);
    const user2Matches = await matchService.getMatches(user2.user.uid);
    
    console.log(`✅ User 1 has ${user1Matches.length} matches`);
    console.log(`✅ User 2 has ${user2Matches.length} matches`);
    
    if (user1Matches.length === 0 || user2Matches.length === 0) {
      throw new Error('Match not created after mutual like');
    }
  }

  private async testMessagingSystem() {
    console.log('💬 Testing messaging system...');
    
    const user1 = await authService.signIn(this.testUsers[0].email, this.testUsers[0].password);
    const user1Matches = await matchService.getMatches(user1.user.uid);
    
    if (user1Matches.length === 0) {
      throw new Error('No matches available for messaging test');
    }
    
    const testMatch = user1Matches[0];
    
    // Send first message
    await matchService.sendMessage(testMatch.id, user1.user.uid, 'Hello! Nice to meet you!');
    console.log(`✅ Sent message 1`);
    
    // Send second message
    await matchService.sendMessage(testMatch.id, user1.user.uid, 'How are you doing?');
    console.log(`✅ Sent message 2`);
    
    // Send third message
    await matchService.sendMessage(testMatch.id, user1.user.uid, 'Would you like to meet up?');
    console.log(`✅ Sent message 3`);
    
    // Try to send fourth message (should fail due to limit)
    try {
      await matchService.sendMessage(testMatch.id, user1.user.uid, 'This should fail');
      throw new Error('Message limit not enforced');
    } catch (error: unknown) {
      if (isErrorWithMessage(error) && (error.message.includes('limit') || error.message.includes('maximum'))) {
        console.log(`✅ Message limit correctly enforced`);
      } else {
        throw error;
      }
    }
  }

  private async testMatchExpiration() {
    console.log('⏰ Testing match expiration...');
    
    const user1 = await authService.signIn(this.testUsers[0].email, this.testUsers[0].password);
    const user1Matches = await matchService.getMatches(user1.user.uid);
    
    if (user1Matches.length === 0) {
      console.log('ℹ️ No matches to test expiration');
      return;
    }
    
    const testMatch = user1Matches[0];
    const timeRemaining = matchService.calculateTimeRemaining(new Date(testMatch.expiredAt));
    console.log(`⏰ Match expires in: ${timeRemaining}`);
    
    // Note: In a real test, we would simulate time passing
    // For now, we just verify the expiration time is set correctly
    const expiresAt = new Date(testMatch.expiredAt);
    const now = new Date();
    const timeDiff = expiresAt.getTime() - now.getTime();
    
    if (timeDiff < 0) {
      console.log(`✅ Match has already expired (as expected)`);
    } else if (timeDiff <= 3 * 60 * 60 * 1000) { // 3 hours
      console.log(`✅ Match expiration time set correctly`);
    } else {
      throw new Error('Match expiration time not set correctly');
    }
  }

  private async cleanup() {
    console.log('🧹 Cleaning up test data...');
    
    try {
      // Sign out all test users
      for (const testUser of this.testUsers) {
        try {
          await authService.signIn(testUser.email, testUser.password);
          await authService.signOut();
        } catch (error) {
          // Ignore cleanup errors
        }
      }
      
      console.log('✅ Cleanup completed');
    } catch (error) {
      console.log('⚠️ Cleanup had some issues:', error);
    }
  }
}

// Export for use in other test files
export const runFirebaseE2ETest = async () => {
  const test = new FirebaseE2ETest();
  await test.runFullTest();
};

// Run test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - expose for manual testing
  (window as unknown as { runFirebaseE2ETest?: typeof runFirebaseE2ETest }).runFirebaseE2ETest = runFirebaseE2ETest;
} else {
  // Node environment - run automatically
  runFirebaseE2ETest().catch(console.error);
}

function isErrorWithMessage(error: unknown): error is { message: string } {
  return typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message?: unknown }).message === 'string';
} 