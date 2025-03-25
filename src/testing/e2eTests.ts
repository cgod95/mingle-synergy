
import services from '@/services';
import { logUserAction } from '@/utils/errorHandler';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  details?: string;
  error?: Error;
}

export class E2ETester {
  private results: TestResult[] = [];
  private testUser = {
    email: 'test@example.com',
    password: 'Test123!',
    name: 'Test User',
    photos: ['https://images.unsplash.com/photo-1503097581674-a2bfb450dbda?w=600&q=60&auto=format'],
    bio: 'This is a test user for e2e testing',
  };
  private userId?: string;
  private testVenueId?: string;
  
  constructor() {}
  
  private logResult(result: TestResult) {
    this.results.push(result);
    console.log(`${result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⚠️'} ${result.name}: ${result.status}`);
    if (result.details) {
      console.log(`   ${result.details}`);
    }
    if (result.error) {
      console.error('   Error:', result.error);
    }
  }
  
  async runTests() {
    console.log("🧪 Starting end-to-end tests...");
    
    // Run tests in sequence
    await this.testAuthentication();
    await this.testUserProfile();
    await this.testVenueDiscovery();
    await this.testCheckIn();
    await this.testMatching();
    await this.testContactSharing();
    
    // Print summary
    this.printSummary();
  }
  
  private printSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;
    
    console.log("\n===== E2E TEST SUMMARY =====");
    console.log(`Total tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Skipped: ${skipped}`);
    console.log("============================");
    
    if (failed > 0) {
      console.log("\n❌ FAILED TESTS:");
      this.results
        .filter(r => r.status === 'failed')
        .forEach(result => {
          console.log(`- ${result.name}: ${result.details || 'No details'}`);
        });
    }
  }
  
  async testAuthentication() {
    try {
      logUserAction('Starting authentication test');
      
      // Test sign-up
      try {
        // Clean up any existing test user first
        await services.auth.signInWithEmailAndPassword(this.testUser.email, this.testUser.password)
          .then(async user => {
            this.userId = user.uid;
            await services.user.deleteUser(this.userId!);
          })
          .catch(() => {
            // Ignore errors if user doesn't exist
          });
      } catch (e) {
        // Ignore cleanup errors
      }
      
      // Create new test user
      const newUser = await services.auth.signUpWithEmailAndPassword(
        this.testUser.email, 
        this.testUser.password
      );
      
      this.userId = newUser.uid;
      this.logResult({
        name: 'User registration',
        status: 'passed',
        details: `Created test user with ID: ${this.userId}`
      });
      
      // Test sign-out
      await services.auth.signOut();
      this.logResult({
        name: 'User sign-out',
        status: 'passed'
      });
      
      // Test sign-in
      const user = await services.auth.signInWithEmailAndPassword(
        this.testUser.email,
        this.testUser.password
      );
      
      if (user.uid === this.userId) {
        this.logResult({
          name: 'User sign-in',
          status: 'passed',
          details: `Signed in as: ${user.email}`
        });
      } else {
        throw new Error('User ID mismatch after sign-in');
      }
    } catch (error) {
      this.logResult({
        name: 'Authentication',
        status: 'failed',
        details: 'Authentication flow failed',
        error: error as Error
      });
    }
  }
  
  async testUserProfile() {
    if (!this.userId) {
      this.logResult({
        name: 'User profile',
        status: 'skipped',
        details: 'Skipped because authentication failed'
      });
      return;
    }
    
    try {
      logUserAction('Starting user profile test');
      
      // Create user profile
      await services.user.updateUser(this.userId, {
        name: this.testUser.name,
        photos: this.testUser.photos,
        bio: this.testUser.bio,
        isCheckedIn: false,
        isVisible: true,
        interests: ['coffee', 'conversation', 'hiking'],
        gender: 'non-binary',
        interestedIn: ['male', 'female', 'non-binary'],
        age: 30,
        ageRangePreference: { min: 25, max: 45 }
      });
      
      // Fetch user profile to verify
      const profile = await services.user.getUserById(this.userId);
      
      if (profile && profile.name === this.testUser.name) {
        this.logResult({
          name: 'User profile',
          status: 'passed',
          details: `Profile created for: ${profile.name}`
        });
      } else {
        throw new Error('User profile data mismatch');
      }
    } catch (error) {
      this.logResult({
        name: 'User profile',
        status: 'failed',
        details: 'Failed to create or verify user profile',
        error: error as Error
      });
    }
  }
  
  async testVenueDiscovery() {
    try {
      logUserAction('Starting venue discovery test');
      
      // Get venues
      const venues = await services.venue.getAllVenues();
      
      if (venues && venues.length > 0) {
        this.testVenueId = venues[0].id;
        this.logResult({
          name: 'Venue discovery',
          status: 'passed',
          details: `Found ${venues.length} venues`
        });
      } else {
        throw new Error('No venues found');
      }
    } catch (error) {
      this.logResult({
        name: 'Venue discovery',
        status: 'failed',
        details: 'Failed to retrieve venues',
        error: error as Error
      });
    }
  }
  
  async testCheckIn() {
    if (!this.userId || !this.testVenueId) {
      this.logResult({
        name: 'Venue check-in',
        status: 'skipped',
        details: 'Skipped because user or venue is not available'
      });
      return;
    }
    
    try {
      logUserAction('Starting check-in test');
      
      // Check in to venue
      await services.venue.checkInToVenue(this.userId, this.testVenueId);
      
      // Verify check-in
      const userAfterCheckIn = await services.user.getUserById(this.userId);
      
      if (userAfterCheckIn && userAfterCheckIn.isCheckedIn && userAfterCheckIn.currentVenue === this.testVenueId) {
        this.logResult({
          name: 'Venue check-in',
          status: 'passed',
          details: `Checked in to venue: ${this.testVenueId}`
        });
      } else {
        throw new Error('Check-in verification failed');
      }
      
      // Test check-out
      await services.venue.checkOutFromVenue(this.userId);
      
      // Verify check-out
      const userAfterCheckOut = await services.user.getUserById(this.userId);
      
      if (userAfterCheckOut && !userAfterCheckOut.isCheckedIn && !userAfterCheckOut.currentVenue) {
        this.logResult({
          name: 'Venue check-out',
          status: 'passed',
          details: 'Successfully checked out from venue'
        });
      } else {
        throw new Error('Check-out verification failed');
      }
    } catch (error) {
      this.logResult({
        name: 'Venue check-in/out',
        status: 'failed',
        details: 'Failed to check in or check out',
        error: error as Error
      });
    }
  }
  
  async testMatching() {
    // This is a more complex test that would require two users
    // For e2e testing purposes, we'll use a simplified approach
    this.logResult({
      name: 'Matching system',
      status: 'skipped',
      details: 'Requires multiple test users - run manual test'
    });
  }
  
  async testContactSharing() {
    // This is also dependent on matching
    this.logResult({
      name: 'Contact sharing',
      status: 'skipped',
      details: 'Dependent on matching system - run manual test'
    });
  }
}

export const startE2ETests = async () => {
  const tester = new E2ETester();
  await tester.runTests();
};

export default {
  E2ETester,
  startE2ETests
};
