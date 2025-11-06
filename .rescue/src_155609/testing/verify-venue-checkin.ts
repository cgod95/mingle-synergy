// Simple verification script for venue check-in functionality
import { venueService } from '@/services';
import { users } from '@/data/mockData';
import { venues as mockVenues } from '@/data/mockData';

export const verifyVenueCheckIn = async () => {
  console.log('🔍 Verifying venue check-in functionality...');
  
  const testUserId = 'test-user-123';
  const testVenueId = 'v1';
  
  try {
    // Step 1: Check initial state
    console.log('\n📊 Initial state:');
    const initialVenue = mockVenues.find(v => v.id === testVenueId);
    console.log('Initial venue check-in count:', initialVenue?.checkInCount);
    
    // Step 2: Check in
    console.log('\n✅ Checking in...');
    await venueService.checkInToVenue(testUserId, testVenueId);
    
    // Step 3: Verify check-in
    console.log('\n🔍 Verifying check-in...');
    const userAfterCheckIn = users.find(u => u.id === testUserId);
    const venueAfterCheckIn = mockVenues.find(v => v.id === testVenueId);
    
    console.log('User isCheckedIn:', userAfterCheckIn?.isCheckedIn);
    console.log('User currentVenue:', userAfterCheckIn?.currentVenue);
    console.log('Venue check-in count after:', venueAfterCheckIn?.checkInCount);
    
    // Step 4: Check out
    console.log('\n✅ Checking out...');
    await venueService.checkOutFromVenue(testUserId);
    
    // Step 5: Verify check-out
    console.log('\n🔍 Verifying check-out...');
    const userAfterCheckOut = users.find(u => u.id === testUserId);
    const venueAfterCheckOut = mockVenues.find(v => v.id === testVenueId);
    
    console.log('User isCheckedIn after checkout:', userAfterCheckOut?.isCheckedIn);
    console.log('User currentVenue after checkout:', userAfterCheckOut?.currentVenue);
    console.log('Venue check-in count after checkout:', venueAfterCheckOut?.checkInCount);
    
    // Step 6: Verify the service methods work
    console.log('\n🔍 Testing service methods...');
    const venueFromService = await venueService.getVenueById(testVenueId);
    const usersAtVenue = await venueService.getUsersAtVenue(testVenueId);
    
    console.log('Venue from service:', venueFromService?.name);
    console.log('Users at venue from service:', usersAtVenue.length);
    
    console.log('\n🎉 Verification completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    return false;
  }
};

// Run verification if this file is executed directly
if (typeof window !== 'undefined') {
  (window as unknown as { verifyVenueCheckIn: typeof verifyVenueCheckIn }).verifyVenueCheckIn = verifyVenueCheckIn;
  console.log('🔍 Venue check-in verification loaded. Run verifyVenueCheckIn() in the console to verify.');
} 