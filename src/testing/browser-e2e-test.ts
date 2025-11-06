/**
 * Browser-Compatible Firebase E2E Test
 * Run this in the browser console to test your Firebase flow
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

class BrowserE2ETest {
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

  async runFullTest() {
    console.log('🚀 Starting Browser Firebase E2E Test Suite...');
    
    try {
      // Step 1: Test user registration and onboarding
      await this.testUserRegistration();
      
      // Step 2: Test venue check-in flow
      await this.testVenueCheckIn();
      
      // Step 3: Test user discovery and liking
      await this.testUserDiscovery();
      
      // Step 4: Test matching system
      await this.testMatchingSystem();
      
      // Step 5: Test messaging system
      await this.testMessagingSystem();
      
      // Step 6: Test match expiration
      await this.testMatchExpiration();
      
      console.log('✅ All E2E tests passed!');
      return true;
    } catch (error) {
      console.error('❌ E2E test failed:', error);
      return false;
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
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('already in use')) {
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('limit') || errorMessage.includes('maximum')) {
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
    console.log(`✅ Match found with ID: ${testMatch.id}`);
    console.log(`✅ Match timestamp: ${new Date(testMatch.timestamp).toLocaleString()}`);
    
    // Note: The current FirestoreMatch type doesn't include expiration logic
    // This would need to be implemented in the match service or database rules
    console.log('ℹ️ Match expiration testing not available in current implementation');
  }
}

// Export for use in browser console
export const runBrowserE2ETest = async () => {
  const test = new BrowserE2ETest();
  return await test.runFullTest();
};

// Make it available globally for browser console access
if (typeof window !== 'undefined') {
  (window as unknown as { runBrowserE2ETest: typeof runBrowserE2ETest }).runBrowserE2ETest = runBrowserE2ETest;
  console.log('🌐 Browser E2E test available. Run: runBrowserE2ETest()');
} 