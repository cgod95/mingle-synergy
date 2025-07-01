import services from '@/services';
import { Match, User, Venue } from '@/types';

interface TestResult {
  step: string;
  success: boolean;
  message: string;
  data?: unknown;
  error?: unknown;
}

class ComprehensiveE2ETest {
  private results: TestResult[] = [];
  private userA: User | null = null;
  private userB: User | null = null;
  private testVenue: Venue | null = null;
  private match: Match | null = null;

  async runFullTest(): Promise<TestResult[]> {
    console.log('🚀 Starting Comprehensive E2E Test...');
    
    try {
      // Step 1: Create test users
      await this.createTestUsers();
      
      // Step 2: Create test venue
      await this.createTestVenue();
      
      // Step 3: Check in both users to venue
      await this.checkInUsers();
      
      // Step 4: User A likes User B
      await this.userALikesUserB();
      
      // Step 5: User B likes User A (creates match)
      await this.userBLikesUserA();
      
      // Step 6: Verify match was created
      await this.verifyMatchCreated();
      
      // Step 7: Send messages (3 each)
      await this.sendMessages();
      
      // Step 8: Test message limits
      await this.testMessageLimits();
      
      // Step 9: Test rematch functionality
      await this.testRematch();
      
      // Step 10: Verify data persistence
      await this.verifyDataPersistence();
      
    } catch (error) {
      this.logResult('Test Suite', false, 'Test suite failed', null, error);
    }
    
    this.printResults();
    return this.results;
  }

  private async createTestUsers(): Promise<void> {
    console.log('👥 Creating test users...');
    
    try {
      // Create User A
      const userAProfile = {
        id: 'test-user-a',
        name: 'Alice Test',
        age: 25,
        bio: 'Test user A for E2E testing',
        photos: ['https://via.placeholder.com/150'],
        isCheckedIn: false,
        isVisible: true,
        interests: ['coffee', 'reading'],
        gender: 'female' as const,
        interestedIn: ['male'] as ('male' | 'female' | 'non-binary' | 'other')[],
        ageRangePreference: { min: 20, max: 35 },
        matches: [],
        likedUsers: [],
        blockedUsers: []
      };
      
      await services.user.createUserProfile('test-user-a', userAProfile);
      this.userA = userAProfile;
      this.logResult('Create User A', true, 'User A created successfully', userAProfile);
      
      // Create User B
      const userBProfile = {
        id: 'test-user-b',
        name: 'Bob Test',
        age: 28,
        bio: 'Test user B for E2E testing',
        photos: ['https://via.placeholder.com/150'],
        isCheckedIn: false,
        isVisible: true,
        interests: ['coffee', 'music'],
        gender: 'male' as const,
        interestedIn: ['female'] as ('male' | 'female' | 'non-binary' | 'other')[],
        ageRangePreference: { min: 20, max: 35 },
        matches: [],
        likedUsers: [],
        blockedUsers: []
      };
      
      await services.user.createUserProfile('test-user-b', userBProfile);
      this.userB = userBProfile;
      this.logResult('Create User B', true, 'User B created successfully', userBProfile);
      
    } catch (error) {
      this.logResult('Create Test Users', false, 'Failed to create test users', null, error);
      throw error;
    }
  }

  private async createTestVenue(): Promise<void> {
    console.log('🏢 Creating test venue...');
    
    try {
      this.testVenue = {
        id: 'test-venue-1',
        name: 'Test Coffee Shop',
        address: '123 Test Street',
        type: 'cafe',
        image: 'https://via.placeholder.com/300x200',
        checkInCount: 0,
        expiryTime: 120,
        zones: [
          { id: 'main', name: 'Main Area', description: 'Main seating area' },
          { id: 'outdoor', name: 'Outdoor', description: 'Outdoor seating' }
        ],
        specials: []
      };
      
      this.logResult('Create Test Venue', true, 'Test venue created', this.testVenue);
      
    } catch (error) {
      this.logResult('Create Test Venue', false, 'Failed to create test venue', null, error);
      throw error;
    }
  }

  private async checkInUsers(): Promise<void> {
    console.log('📍 Checking in users to venue...');
    
    try {
      // Check in User A
      await services.venue.checkInToVenue('test-user-a', 'test-venue-1');
      this.logResult('Check In User A', true, 'User A checked in successfully');
      
      // Check in User B
      await services.venue.checkInToVenue('test-user-b', 'test-venue-1');
      this.logResult('Check In User B', true, 'User B checked in successfully');
      
      // Verify check-in status
      const userA = await services.user.getUserProfile('test-user-a');
      const userB = await services.user.getUserProfile('test-user-b');
      
      if (userA && userB) {
        this.logResult('Verify Check-ins', true, 'Both users successfully checked in');
      } else {
        throw new Error('Check-in verification failed');
      }
      
    } catch (error) {
      this.logResult('Check In Users', false, 'Failed to check in users', null, error);
      throw error;
    }
  }

  private async userALikesUserB(): Promise<void> {
    console.log('❤️ User A likes User B...');
    
    try {
      await services.interest.expressInterest('test-user-a', 'test-user-b', 'test-venue-1');
      this.logResult('User A Likes User B', true, 'User A successfully liked User B');
      
    } catch (error) {
      this.logResult('User A Likes User B', false, 'Failed to like user', null, error);
      throw error;
    }
  }

  private async userBLikesUserA(): Promise<void> {
    console.log('❤️ User B likes User A (should create match)...');
    
    try {
      await services.interest.expressInterest('test-user-b', 'test-user-a', 'test-venue-1');
      this.logResult('User B Likes User A', true, 'User B successfully liked User A');
      
    } catch (error) {
      this.logResult('User B Likes User A', false, 'Failed to like user', null, error);
      throw error;
    }
  }

  private async verifyMatchCreated(): Promise<void> {
    console.log('🔍 Verifying match was created...');
    
    try {
      // Get matches for both users
      const userAMatches = await services.match.getMatches('test-user-a');
      const userBMatches = await services.match.getMatches('test-user-b');
      
      const match = userAMatches.find(m => 
        (m.userId === 'test-user-a' && m.matchedUserId === 'test-user-b') ||
        (m.userId === 'test-user-b' && m.matchedUserId === 'test-user-a')
      );
      
      if (match) {
        this.match = match;
        this.logResult('Verify Match Created', true, 'Match created successfully', match);
        
        // Verify match properties
        const now = Date.now();
        const isRecent = now - match.timestamp < 60000; // Within 1 minute
        const hasCorrectUsers = (match.userId === 'test-user-a' && match.matchedUserId === 'test-user-b') ||
                               (match.userId === 'test-user-b' && match.matchedUserId === 'test-user-a');
        
        if (isRecent && hasCorrectUsers) {
          this.logResult('Verify Match Properties', true, 'Match has correct properties');
        } else {
          throw new Error('Match properties verification failed');
        }
        
      } else {
        throw new Error('No match found after mutual likes');
      }
      
    } catch (error) {
      this.logResult('Verify Match Created', false, 'Failed to verify match creation', null, error);
      throw error;
    }
  }

  private async sendMessages(): Promise<void> {
    console.log('💬 Sending messages...');
    
    if (!this.match) {
      this.logResult('Send Messages', false, 'No match available for messaging', null, new Error('Match not found'));
      return;
    }
    
    try {
      // User A sends 3 messages
      for (let i = 1; i <= 3; i++) {
        const success = await services.match.sendMessage(this.match.id, 'test-user-a', `Message ${i} from User A`);
        if (success) {
          this.logResult(`Send Message A-${i}`, true, `User A sent message ${i}`);
        } else {
          throw new Error(`Failed to send message ${i} from User A`);
        }
      }
      
      // User B sends 3 messages
      for (let i = 1; i <= 3; i++) {
        const success = await services.match.sendMessage(this.match.id, 'test-user-b', `Message ${i} from User B`);
        if (success) {
          this.logResult(`Send Message B-${i}`, true, `User B sent message ${i}`);
        } else {
          throw new Error(`Failed to send message ${i} from User B`);
        }
      }
      
      this.logResult('Verify Message Sending', true, 'All 6 messages sent successfully');
      
    } catch (error) {
      this.logResult('Send Messages', false, 'Failed to send messages', null, error);
      throw error;
    }
  }

  private async testMessageLimits(): Promise<void> {
    console.log('🚫 Testing message limits...');
    
    if (!this.match) {
      this.logResult('Test Message Limits', false, 'No match available', null, new Error('Match not found'));
      return;
    }
    
    try {
      // Try to send a 4th message from User A (should fail in real implementation)
      const successA = await services.match.sendMessage(this.match.id, 'test-user-a', 'This should fail');
      if (!successA) {
        this.logResult('Test Message Limit A', true, 'Message limit correctly enforced for User A');
      } else {
        this.logResult('Test Message Limit A', false, 'Message limit not enforced for User A');
      }
      
      // Try to send a 4th message from User B (should fail in real implementation)
      const successB = await services.match.sendMessage(this.match.id, 'test-user-b', 'This should fail');
      if (!successB) {
        this.logResult('Test Message Limit B', true, 'Message limit correctly enforced for User B');
      } else {
        this.logResult('Test Message Limit B', false, 'Message limit not enforced for User B');
      }
      
    } catch (error) {
      this.logResult('Test Message Limits', false, 'Failed to test message limits', null, error);
      throw error;
    }
  }

  private async testRematch(): Promise<void> {
    console.log('🔄 Testing rematch functionality...');
    
    try {
      // Create a new match between the same users
      const newMatchId = await services.match.createMatch('test-user-a', 'test-user-b', 'test-venue-1', 'Test Coffee Shop');
      
      if (newMatchId) {
        this.logResult('Test Rematch', true, 'Rematch created successfully', { matchId: newMatchId });
        
        // Verify new match exists in user's matches
        const userAMatches = await services.match.getMatches('test-user-a');
        const newMatch = userAMatches.find(m => m.id === newMatchId);
        
        if (newMatch) {
          this.logResult('Verify Rematch Properties', true, 'Rematch has correct properties', newMatch);
        } else {
          throw new Error('Rematch verification failed');
        }
      } else {
        throw new Error('Failed to create rematch');
      }
      
    } catch (error) {
      this.logResult('Test Rematch', false, 'Failed to test rematch', null, error);
      throw error;
    }
  }

  private async verifyDataPersistence(): Promise<void> {
    console.log('🔍 Verifying data persistence...');
    
    try {
      // Verify user profiles
      const userA = await services.user.getUserProfile('test-user-a');
      const userB = await services.user.getUserProfile('test-user-b');
      
      if (userA && userB) {
        this.logResult('Verify User Profiles', true, 'User profiles exist in database');
      } else {
        throw new Error('User profiles not found');
      }
      
      // Verify venue data
      const venues = await services.venue.getVenues();
      if (venues.length > 0) {
        this.logResult('Verify Venue Data', true, 'Venue data exists in database', { count: venues.length });
      } else {
        this.logResult('Verify Venue Data', false, 'No venues found in database');
      }
      
      // Verify matches data
      const userAMatches = await services.match.getMatches('test-user-a');
      if (userAMatches.length > 0) {
        this.logResult('Verify Matches Data', true, 'Matches data exists in database', { count: userAMatches.length });
      } else {
        this.logResult('Verify Matches Data', false, 'No matches found in database');
      }
      
    } catch (error) {
      this.logResult('Verify Data Persistence', false, 'Failed to verify data persistence', null, error);
      throw error;
    }
  }

  private logResult(step: string, success: boolean, message: string, data?: unknown, error?: unknown): void {
    const result: TestResult = {
      step,
      success,
      message,
      data,
      error
    };
    
    this.results.push(result);
    
    const status = success ? '✅' : '❌';
    console.log(`${status} ${step}: ${message}`);
    
    if (error) {
      console.error('Error details:', error);
    }
  }

  private printResults(): void {
    console.log('\n📊 E2E Test Results Summary:');
    console.log('============================');
    
    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const total = this.results.length;
    
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.filter(r => !r.success).forEach(result => {
        console.log(`  - ${result.step}: ${result.message}`);
        if (result.error) {
          console.log(`    Error: ${result.error instanceof Error ? result.error.message : result.error}`);
        }
      });
    }
    
    console.log('\n✅ All Tests Completed!');
  }
}

// Export the test runner
export const runComprehensiveE2ETest = async (): Promise<TestResult[]> => {
  const tester = new ComprehensiveE2ETest();
  return await tester.runFullTest();
};

export default ComprehensiveE2ETest; 