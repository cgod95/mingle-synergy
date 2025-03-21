
import React, { useEffect, useState } from 'react';
import services from '../services';
import { Skeleton } from '@/components/ui/skeleton';

const TestBackend = () => {
  const [testResults, setTestResults] = useState<Record<string, {success: boolean, message: string}>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTest, setCurrentTest] = useState<string>('Initializing');

  // Add a test result
  const addResult = (test: string, success: boolean, message: string) => {
    console.log(`Test: ${test} - ${success ? 'SUCCESS' : 'FAILURE'}: ${message}`);
    setTestResults(prev => ({
      ...prev,
      [test]: { success, message }
    }));
  };

  // Test user service
  const testUserService = async () => {
    try {
      setCurrentTest('UserService - Init');
      addResult('UserService Init', true, 'Service initialized');
      
      setCurrentTest('UserService - Creating test user');
      // Use a fixed ID for testing
      const testUserId = 'test-user-1';
      
      // Create test user data if needed
      try {
        const testUser = {
          id: testUserId,
          name: 'Test User',
          email: 'test@example.com',
          photos: ['https://randomuser.me/api/portraits/men/1.jpg'],
          isCheckedIn: false,
          currentVenue: null,
          createdAt: Date.now()
        };
        
        // Try to get user first
        const existingUser = await services.user.getUserProfile(testUserId);
        
        if (!existingUser) {
          // Only create if doesn't exist
          await firebase.firestore().collection('users').doc(testUserId).set(testUser);
          addResult('Create Test User', true, 'Test user created');
        } else {
          addResult('Test User Check', true, 'Test user already exists');
        }
      } catch (e) {
        console.error('Error creating test user:', e);
        addResult('Create Test User', false, `Error: ${e.message}`);
      }
      
      setCurrentTest('UserService - getUserProfile');
      // Test getUserProfile
      try {
        const user = await services.user.getUserProfile(testUserId);
        addResult('getUserProfile', !!user, user ? `Retrieved user: ${user.name}` : 'Failed to get user');
      } catch (e) {
        console.error('getUserProfile error:', e);
        addResult('getUserProfile', false, `Error: ${e.message}`);
      }
      
      setCurrentTest('UserService - updateUserProfile');
      // Test updateUserProfile
      try {
        await services.user.updateUserProfile(testUserId, { lastActive: Date.now() });
        addResult('updateUserProfile', true, 'User updated');
      } catch (e) {
        console.error('updateUserProfile error:', e);
        addResult('updateUserProfile', false, `Error: ${e.message}`);
      }
      
    } catch (error) {
      console.error('User service test error:', error);
      addResult('UserService', false, `Error: ${error.message}`);
    }
  };

  // Test venue service 
  const testVenueService = async () => {
    try {
      setCurrentTest('VenueService - Init');
      addResult('VenueService Init', true, 'Service initialized');
      
      // Create test venue if needed
      setCurrentTest('VenueService - Creating test venue');
      const testVenueId = 'test-venue-1';
      try {
        const testVenue = {
          id: testVenueId,
          name: 'Test Cafe',
          address: '123 Test St, Sydney',
          city: 'Sydney',
          latitude: -33.8688,
          longitude: 151.2093,
          type: 'cafe',
          checkedInUsers: []
        };
        
        // Try to get venue first
        const existingVenue = await services.venue.getVenueById(testVenueId);
        
        if (!existingVenue) {
          // Only create if doesn't exist
          await firebase.firestore().collection('venues').doc(testVenueId).set(testVenue);
          addResult('Create Test Venue', true, 'Test venue created');
        } else {
          addResult('Test Venue Check', true, 'Test venue already exists');
        }
      } catch (e) {
        console.error('Error creating test venue:', e);
        addResult('Create Test Venue', false, `Error: ${e.message}`);
      }
      
      setCurrentTest('VenueService - getVenueById');
      // Test getVenueById
      try {
        const venue = await services.venue.getVenueById(testVenueId);
        addResult('getVenueById', !!venue, venue ? `Retrieved venue: ${venue.name}` : 'Failed to get venue');
      } catch (e) {
        console.error('getVenueById error:', e);
        addResult('getVenueById', false, `Error: ${e.message}`);
      }
      
      setCurrentTest('VenueService - getNearbyVenues');
      // Test getNearbyVenues
      try {
        // Use Sydney coordinates
        const lat = -33.8688;
        const lng = 151.2093;
        
        const venues = await services.venue.getNearbyVenues(lat, lng, 10);
        addResult('getNearbyVenues', venues.length > 0, 
          venues.length > 0 ? `Found ${venues.length} venues` : 'No venues found');
      } catch (e) {
        console.error('getNearbyVenues error:', e);
        addResult('getNearbyVenues', false, `Error: ${e.message}`);
      }
      
      setCurrentTest('VenueService - checkInToVenue');
      // Test check-in
      try {
        const userId = 'test-user-1';
        await services.venue.checkInToVenue(userId, testVenueId);
        addResult('checkInToVenue', true, 'Checked in to venue');
      } catch (e) {
        console.error('checkInToVenue error:', e);
        addResult('checkInToVenue', false, `Error: ${e.message}`);
      }
      
      setCurrentTest('VenueService - checkOutFromVenue');
      // Test check-out
      try {
        const userId = 'test-user-1';
        await services.venue.checkOutFromVenue(userId);
        addResult('checkOutFromVenue', true, 'Checked out of venue');
      } catch (e) {
        console.error('checkOutFromVenue error:', e);
        addResult('checkOutFromVenue', false, `Error: ${e.message}`);
      }
      
    } catch (error) {
      console.error('Venue service test error:', error);
      addResult('VenueService', false, `Error: ${error.message}`);
    }
  };

  // Test match service
  const testMatchService = async () => {
    try {
      setCurrentTest('MatchService - Init');
      addResult('MatchService Init', true, 'Service initialized');
      
      const userId = 'test-user-1';
      const matchedUserId = 'test-user-2';
      
      // Create second test user if needed
      setCurrentTest('MatchService - Creating second test user');
      try {
        const testUser = {
          id: matchedUserId,
          name: 'Test User 2',
          email: 'test2@example.com',
          photos: ['https://randomuser.me/api/portraits/men/2.jpg'],
          isCheckedIn: false,
          currentVenue: null,
          createdAt: Date.now()
        };
        
        // Try to get user first
        const existingUser = await services.user.getUserProfile(matchedUserId);
        
        if (!existingUser) {
          // Only create if doesn't exist
          await firebase.firestore().collection('users').doc(matchedUserId).set(testUser);
          addResult('Create Second Test User', true, 'Second test user created');
        } else {
          addResult('Second Test User Check', true, 'Second test user already exists');
        }
      } catch (e) {
        console.error('Error creating second test user:', e);
        addResult('Create Second Test User', false, `Error: ${e.message}`);
      }
      
      setCurrentTest('MatchService - createMatch');
      // Test createMatch
      let newMatchId = '';
      try {
        const newMatch = await services.match.createMatch({
          userId,
          matchedUserId,
          venueId: 'test-venue-1',
          timestamp: Date.now(),
          isActive: true,
          expiresAt: Date.now() + (3 * 60 * 60 * 1000), // 3 hours
          contactShared: false
        });
        
        newMatchId = newMatch?.id || '';
        addResult('createMatch', !!newMatch, newMatch ? `Match created with ID: ${newMatch.id}` : 'Failed to create match');
      } catch (e) {
        console.error('createMatch error:', e);
        addResult('createMatch', false, `Error: ${e.message}`);
      }
      
      if (newMatchId) {
        setCurrentTest('MatchService - getMatches');
        // Test getMatches instead of getMatchById since it's available
        try {
          const matches = await services.match.getMatches(userId);
          addResult('getMatches', matches.length > 0, 'Matches retrieved');
        } catch (e) {
          console.error('getMatches error:', e);
          addResult('getMatches', false, `Error: ${e.message}`);
        }
        
        setCurrentTest('MatchService - updateMatch');
        // Test updateMatch
        try {
          await services.match.updateMatch(newMatchId, { contactShared: true });
          addResult('updateMatch', true, 'Match updated');
        } catch (e) {
          console.error('updateMatch error:', e);
          addResult('updateMatch', false, `Error: ${e.message}`);
        }
      }
      
      setCurrentTest('MatchService - getMatches again');
      // Test getMatches
      try {
        const userMatches = await services.match.getMatches(userId);
        addResult('getMatches again', true, `Found ${userMatches.length} matches for user`);
      } catch (e) {
        console.error('getMatches error:', e);
        addResult('getMatches again', false, `Error: ${e.message}`);
      }
      
    } catch (error) {
      console.error('Match service test error:', error);
      addResult('MatchService', false, `Error: ${error.message}`);
    }
  };

  // Run all tests
  useEffect(() => {
    const runTests = async () => {
      try {
        setIsLoading(true);
        console.log('Starting Firebase backend tests...');
        
        // Import Firebase
        setCurrentTest('Importing Firebase');
        const firebase = await import('../services/firebase').then(module => module.default);
        console.log('Firebase imported:', firebase);
        
        // Make firebase available globally for test functions
        window.firebase = firebase;
        
        // Test services one by one
        await testUserService();
        await testVenueService();
        await testMatchService();
        
      } catch (err) {
        console.error('Test error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
        setCurrentTest('Tests completed');
      }
    };

    runTests();
  }, []);

  // Run individual tests
  const runSingleTest = async (testFn: () => Promise<void>) => {
    setIsLoading(true);
    setError(null);
    try {
      await testFn();
    } catch (err) {
      console.error('Test error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 container mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Firebase Backend Tests</h1>
      
      {isLoading ? (
        <div className="p-4 bg-blue-50 rounded-lg mb-4">
          <div className="text-blue-500 font-medium">{currentTest}...</div>
          <div className="mt-2 h-1 w-full bg-blue-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{width: '100%'}}></div>
          </div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 rounded-lg mb-4">
          <div className="text-red-500 font-medium">Error occurred during tests:</div>
          <div className="mt-1 text-red-800">{error}</div>
        </div>
      ) : null}
      
      <div className="space-y-2 mb-6">
        <button 
          onClick={() => runSingleTest(testUserService)} 
          className="mr-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
          disabled={isLoading}
        >
          Test User Service
        </button>
        <button 
          onClick={() => runSingleTest(testVenueService)} 
          className="mr-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
          disabled={isLoading}
        >
          Test Venue Service
        </button>
        <button 
          onClick={() => runSingleTest(testMatchService)} 
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          disabled={isLoading}
        >
          Test Match Service
        </button>
      </div>
      
      <div className="space-y-4">
        {Object.entries(testResults).map(([test, result]) => (
          <div key={test} className={`p-3 rounded-lg ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
            <div className="font-medium">{test}</div>
            <div className={result.success ? 'text-green-700' : 'text-red-700'}>
              {result.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestBackend;
