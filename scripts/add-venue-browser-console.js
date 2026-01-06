/**
 * Browser Console Script - Add Scarlet Weasel Venue
 * 
 * INSTRUCTIONS:
 * 1. Open your Mingle app in the browser (logged in)
 * 2. Open browser console (F12 or Cmd+Option+I)
 * 3. Paste this entire script and press Enter
 * 4. The venue will be added to Firestore
 */

(async function() {
  try {
    // Import Firebase functions (they should already be available in the app)
    const { getFirestore, doc, setDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    // Get the db instance from the app (assuming it's available globally or we can access it)
    // Actually, let's use the app's Firebase instance
    const db = window.__MINGLE_FIRESTORE__ || (await import('/src/firebase/config.js')).firestore;
    
    if (!db) {
      throw new Error('Firestore not initialized. Make sure you are logged into the app.');
    }

    const venue = {
      id: 'scarlet-weasel-redfern',
      name: 'Scarlet Weasel',
      type: 'bar',
      address: '169 Regent St',
      city: 'Redfern',
      state: 'NSW',
      postcode: '2016',
      country: 'Australia',
      latitude: -33.8925,
      longitude: 151.2044,
      image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&h=800&fit=crop&q=80',
      checkInCount: 0,
      expiryTime: 120,
      zones: ['main', 'outdoor', 'back'],
      checkedInUsers: [],
      specials: [
        { title: 'Happy Hour', description: '5-7pm Daily' },
        { title: 'Live Music', description: 'Fridays & Saturdays' }
      ],
      description: 'A cozy bar in the heart of Redfern',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    console.log('🍺 Adding Scarlet Weasel to Firestore...');
    const venueRef = doc(db, 'venues', venue.id);
    await setDoc(venueRef, venue, { merge: true });
    
    console.log('✅ Successfully added!');
    console.log('   Venue:', venue.name);
    console.log('   Address:', venue.address, venue.city);
    console.log('   The venue should now appear in your app.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('💡 Make sure you are logged into the app and have write permissions.');
  }
})();

