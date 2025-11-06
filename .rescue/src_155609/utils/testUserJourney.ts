
import services from '../services';
import { saveToStorage } from './localStorageUtils';

/**
 * Utility for testing the complete user journey in the app.
 * This helps verify all key paths before deployment.
 */
export const testCompleteUserJourney = async () => {
  console.log('Starting complete user journey test...');
  const results: Record<string, { success: boolean; message?: string; error?: Error | string | null }> = {};

  try {
    // Create test credentials
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'Test123!';
    
    // Step 1: Sign up
    console.log('Testing signup...');
    try {
      await services.auth.signUp(testEmail, testPassword);
      results.signup = { success: true, message: 'Successfully created test account' };
    } catch (error) {
      results.signup = { success: false, error, message: 'Failed to create test account' };
      throw error;
    }
    
    // Step 2: Complete onboarding
    console.log('Testing onboarding completion...');
    try {
      saveToStorage('onboardingComplete', true);
      results.onboarding = { success: true, message: 'Successfully marked onboarding as complete' };
    } catch (error) {
      results.onboarding = { success: false, error, message: 'Failed to complete onboarding' };
      throw error;
    }
    
    // Step 3: Create profile
    console.log('Testing profile creation...');
    try {
      const currentUser = await services.auth.getCurrentUser();
      if (!currentUser) throw new Error('No authenticated user found');
      
      await services.user.updateUserProfile(currentUser.uid, {
        id: currentUser.uid,
        name: 'Test User',
        age: 25,
        gender: 'male',
        interestedIn: ['female', 'non-binary'],
        interests: ['coffee', 'music', 'movies'],
        photos: ['/placeholder.svg'],
        bio: 'This is a test profile for journey testing',
        isCheckedIn: false,
        isVisible: true,
        ageRangePreference: { min: 21, max: 35 }
      });
      saveToStorage('profileComplete', true);
      results.profile = { success: true, message: 'Successfully created test profile' };
    } catch (error) {
      results.profile = { success: false, error, message: 'Failed to create profile' };
      throw error;
    }
    
    // Step 4: Discover venues
    console.log('Testing venue discovery...');
    try {
      const venues = await services.venue.getVenues();
      if (venues.length === 0) {
        throw new Error('No venues found');
      }
      results.venueDiscovery = { 
        success: true, 
        message: `Successfully found ${venues.length} venues` 
      };
      
      // Step 5: Check in to venue
      console.log('Testing venue check-in...');
      const currentUser = await services.auth.getCurrentUser();
      if (!currentUser) throw new Error('No authenticated user found');
      
      const testVenue = venues[0];
      await services.venue.checkInToVenue(currentUser.uid, testVenue.id);
      results.venueCheckIn = { 
        success: true, 
        message: `Successfully checked in to venue: ${testVenue.name}` 
      };
      
      // Step 6: Find and express interest in users at venue
      try {
        console.log('Testing expressing interest...');
        // Use optional chaining and fallback for getUsersAtVenue
        const usersAtVenue = await services.user.getUsersAtVenue?.(testVenue.id) || [];
        
        if (usersAtVenue.length > 0) {
          const targetUser = usersAtVenue[0];
          await services.interest.recordInterest(currentUser.uid, targetUser.id, testVenue.id);
          results.expressInterest = { 
            success: true, 
            message: `Successfully expressed interest in a user at venue` 
          };
        } else {
          results.expressInterest = { 
            success: true, 
            message: `No users found at venue to express interest in` 
          };
        }
      } catch (error) {
        results.expressInterest = { success: false, error, message: 'Failed to express interest' };
      }
      
      // Step 7: Check matches
      try {
        console.log('Testing matches...');
        const matches = await services.match.getMatches(currentUser.uid);
        results.matches = { 
          success: true, 
          message: `Found ${matches.length} matches` 
        };
        
        // Step 8: Test match interaction (if matches exist)
        if (matches.length > 0) {
          console.log('Testing match interaction...');
          const testMatch = matches[0];
          
          // Simulate reconnect if match is active
          if (testMatch.isActive) {
            await services.match.requestReconnect(testMatch.id, currentUser.uid);
            results.matchInteraction = { 
              success: true, 
              message: `Successfully requested reconnect for match` 
            };
          } else {
            results.matchInteraction = { 
              success: true, 
              message: `Match is not active, skipping reconnect test` 
            };
          }
        } else {
          results.matchInteraction = { 
            success: true, 
            message: `No matches found to test interaction` 
          };
        }
      } catch (error) {
        results.matches = { success: false, error, message: 'Failed to check matches' };
      }
      
      // Step 9: Check out from venue
      console.log('Testing venue check-out...');
      await services.venue.checkOutFromVenue(currentUser.uid);
      results.venueCheckOut = { 
        success: true, 
        message: 'Successfully checked out from venue' 
      };
    } catch (error) {
      results.venueDiscovery = { success: false, error, message: 'Failed to discover venues' };
    }
    
    // Step 10: Log out
    console.log('Testing logout...');
    try {
      await services.auth.signOut();
      results.logout = { success: true, message: 'Successfully logged out' };
    } catch (error) {
      results.logout = { success: false, error, message: 'Failed to log out' };
    }
    
    // Overall result
    const allSuccessful = Object.values(results).every(result => result.success);
    console.log(allSuccessful ? 
      'User journey test completed successfully! ✅' : 
      'User journey test completed with some failures ❌'
    );
    
    return { 
      success: allSuccessful,
      results
    };
  } catch (error) {
    console.error('User journey test failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      results
    };
  }
};

// Create a helper to run individual steps
export const testIndividualStep = async (
  stepName: string, 
  stepFn: () => Promise<unknown>
): Promise<{ success: boolean; result?: unknown; error?: string | null }> => {
  console.log(`Testing step: ${stepName}...`);
  try {
    const result = await stepFn();
    console.log(`Step '${stepName}' completed successfully`);
    return { success: true, result };
  } catch (error) {
    console.error(`Step '${stepName}' failed:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Helper to run the test from a component or page
export const runUserJourneyTest = async () => {
  const results = await testCompleteUserJourney();
  
  // Format results for display
  return {
    ...results,
    summary: Object.entries(results.results || {}).map(([step, result]) => ({
      step,
      success: result.success,
      message: result.message || (result.success ? 'Success' : 'Failed'),
    }))
  };
};
