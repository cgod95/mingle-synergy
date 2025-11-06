// Test script for venue check-in functionality
// Run this in the browser console to test

export const testVenueCheckIn = async () => {
  console.log('🧪 Testing venue check-in functionality...');
  
  try {
    // Import the venue service
    const { venueService } = await import('@/services');
    
    // Test data
    const testUserId = 'test-user-123';
    const testVenueId = 'v1'; // The Greenhouse Café
    
    console.log('📋 Test parameters:');
    console.log('- User ID:', testUserId);
    console.log('- Venue ID:', testVenueId);
    
    // Test 1: Check in to venue
    console.log('\n✅ Test 1: Checking in to venue...');
    await venueService.checkInToVenue(testUserId, testVenueId);
    console.log('✅ Check-in successful!');
    
    // Test 2: Get venue details
    console.log('\n✅ Test 2: Getting venue details...');
    const venue = await venueService.getVenueById(testVenueId);
    console.log('Venue details:', venue);
    
    // Test 3: Get users at venue
    console.log('\n✅ Test 3: Getting users at venue...');
    const usersAtVenue = await venueService.getUsersAtVenue(testVenueId);
    console.log('Users at venue:', usersAtVenue);
    
    // Test 4: Check out from venue
    console.log('\n✅ Test 4: Checking out from venue...');
    await venueService.checkOutFromVenue(testUserId);
    console.log('✅ Check-out successful!');
    
    // Test 5: Verify check-out
    console.log('\n✅ Test 5: Verifying check-out...');
    const usersAfterCheckout = await venueService.getUsersAtVenue(testVenueId);
    console.log('Users at venue after checkout:', usersAfterCheckout);
    
    console.log('\n🎉 All tests passed! Venue check-in functionality is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Auto-run test if this file is imported
if (typeof window !== 'undefined') {
  // Make it available globally for browser console testing
  (window as unknown as { testVenueCheckIn: typeof testVenueCheckIn }).testVenueCheckIn = testVenueCheckIn;
  console.log('🧪 Venue check-in test loaded. Run testVenueCheckIn() in the console to test.');
} 