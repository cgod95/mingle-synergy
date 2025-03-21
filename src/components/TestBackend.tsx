
import React, { useEffect, useState } from 'react';
import services from '../services';
import { Skeleton } from '@/components/ui/skeleton';

const TestBackend = () => {
  const [testResults, setTestResults] = useState<{[key: string]: {success: boolean, message: string}}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add a test result
  const addResult = (test: string, success: boolean, message: string) => {
    console.log(`Test: ${test} - ${success ? 'SUCCESS' : 'FAILURE'}: ${message}`);
    setTestResults(prev => ({
      ...prev,
      [test]: { success, message }
    }));
  };

  // Run all tests
  useEffect(() => {
    const runTests = async () => {
      try {
        setIsLoading(true);
        
        // Test user service
        try {
          addResult('UserService Init', true, 'Service initialized');
          
          // Get current user (assuming one exists in auth)
          const currentUser = await services.auth.getCurrentUser();
          const userId = currentUser?.uid || 'test-user-1';
          addResult('Current User', !!currentUser, currentUser ? `User found: ${userId}` : 'No user found, using test ID');
          
          // Test getUserProfile
          const user = await services.user.getUserProfile(userId);
          addResult('getUserProfile', !!user, user ? `Retrieved user: ${user.name}` : 'Failed to get user');
          
          // Test updateUserProfile
          try {
            await services.user.updateUserProfile(userId, { 
              isVisible: true,
              bio: `Updated at ${new Date().toISOString()}`
            });
            addResult('updateUserProfile', true, 'User updated successfully');
          } catch (error) {
            console.error('Update user error:', error);
            addResult('updateUserProfile', false, `Error: ${error instanceof Error ? error.message : String(error)}`);
          }
        } catch (error) {
          console.error('User service test error:', error);
          addResult('UserService', false, `Error: ${error instanceof Error ? error.message : String(error)}`);
        }
        
        // Test venue service
        try {
          addResult('VenueService Init', true, 'Service initialized');
          
          // Use Sydney coordinates for testing
          const lat = -33.8688;
          const lng = 151.2093;
          
          // Test getVenues
          const allVenues = await services.venue.getVenues();
          addResult('getVenues', allVenues.length > 0, 
            allVenues.length > 0 ? `Found ${allVenues.length} venues` : 'No venues found');
          
          // Test getNearbyVenues
          const venues = await services.venue.getNearbyVenues!(lat, lng, 10);
          addResult('getNearbyVenues', venues.length > 0, 
            venues.length > 0 ? `Found ${venues.length} nearby venues` : 'No nearby venues found');
          
          if (allVenues.length > 0) {
            const testVenue = allVenues[0];
            
            // Test getVenueById
            const venue = await services.venue.getVenueById(testVenue.id);
            addResult('getVenueById', !!venue, venue ? `Retrieved venue: ${venue.name}` : 'Failed to get venue');
            
            // Test check-in
            const userId = 'test-user-1';
            try {
              await services.venue.checkInToVenue(userId, testVenue.id);
              addResult('checkInToVenue', true, 'Checked in to venue');
            } catch (error) {
              console.error('Check-in error:', error);
              addResult('checkInToVenue', false, `Error: ${error instanceof Error ? error.message : String(error)}`);
            }
            
            // Test check-out
            try {
              await services.venue.checkOutFromVenue(userId);
              addResult('checkOutFromVenue', true, 'Checked out of venue');
            } catch (error) {
              console.error('Check-out error:', error);
              addResult('checkOutFromVenue', false, `Error: ${error instanceof Error ? error.message : String(error)}`);
            }
          }
        } catch (error) {
          console.error('Venue service test error:', error);
          addResult('VenueService', false, `Error: ${error instanceof Error ? error.message : String(error)}`);
        }
        
        // Test match service
        try {
          addResult('MatchService Init', true, 'Service initialized');
          
          const userId = 'test-user-1';
          const matchedUserId = 'test-user-2';
          
          // Test createMatch
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
            
            addResult('createMatch', !!newMatch, newMatch ? 'Match created' : 'Failed to create match');
            
            if (newMatch) {
              // Test getMatches (assuming it retrieves all matches for a user)
              const userMatches = await services.match.getMatches(userId);
              addResult('getMatches', userMatches.length > 0, 
                `Found ${userMatches.length} matches for user`);
              
              // Test updateMatch
              try {
                await services.match.updateMatch(newMatch.id, { contactShared: true });
                addResult('updateMatch', true, 'Match updated successfully');
              } catch (error) {
                console.error('Update match error:', error);
                addResult('updateMatch', false, `Error: ${error instanceof Error ? error.message : String(error)}`);
              }
            }
          } catch (error) {
            console.error('Create match error:', error);
            addResult('createMatch', false, `Error: ${error instanceof Error ? error.message : String(error)}`);
          }
        } catch (error) {
          console.error('Match service test error:', error);
          addResult('MatchService', false, `Error: ${error instanceof Error ? error.message : String(error)}`);
        }
        
      } catch (err) {
        console.error('Test error:', err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };

    runTests();
  }, []);

  return (
    <div className="p-4 container mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Firebase Backend Tests</h1>
      
      {isLoading && (
        <div className="space-y-3">
          <div className="text-blue-500 mb-4">Running tests...</div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}
      
      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
          <p className="font-bold">Error occurred during tests:</p>
          <p>{error}</p>
        </div>
      )}
      
      {!isLoading && (
        <div className="space-y-4">
          {Object.entries(testResults).length === 0 ? (
            <div className="text-amber-700 bg-amber-100 p-4 rounded-lg">
              No test results available. Check the console for errors.
            </div>
          ) : (
            Object.entries(testResults).map(([test, result]) => (
              <div key={test} className={`p-4 rounded-lg border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="font-medium flex items-center gap-2">
                  <span className={`inline-block w-3 h-3 rounded-full ${result.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  {test}
                </div>
                <div className={result.success ? 'text-green-700 mt-1' : 'text-red-700 mt-1'}>
                  {result.message}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TestBackend;
