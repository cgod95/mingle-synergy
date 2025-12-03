// Enhanced demo people with Unsplash photos, realistic bios, and activity states
// Emphasizes serendipity and meeting up

export type Person = { 
  id: string; 
  name: string; 
  photo: string; 
  bio?: string; 
  age?: number;
  currentVenue?: string;
  zone?: string;
  lastActive?: number; // timestamp
  checkedInAt?: number;
};

// Using Unsplash Source API for diverse, realistic profile photos
// Format: https://source.unsplash.com/400x600/?portrait,person&sig={id}
const UNSplash_PHOTOS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop',
];

const DEMO_BIOS = [
  "Always up for spontaneous adventures and meeting new people",
  "Looking for genuine connections in real places",
  "Love meeting new people at venues - let's connect!",
  "Here for the vibes and the people",
  "Spontaneous soul looking for meaningful encounters",
  "Love exploring new spots and meeting interesting people",
  "Here to connect authentically - no games",
  "Always down for a good conversation and new friends",
  "Looking for real connections, not just swipes",
  "Love the serendipity of meeting people where you are",
  "Here for genuine moments and real connections",
  "Spontaneous adventures and meaningful conversations",
  "Love meeting people organically at great spots",
  "Here to connect authentically with cool people",
  "Looking for genuine connections and good vibes",
  "Love the magic of meeting people in real places",
  "Here for real connections and spontaneous moments",
  "Always up for meeting new people and exploring",
  "Looking for authentic connections and good times",
  "Love the serendipity of real-world meetings",
  "Here to connect genuinely with interesting people",
  "Spontaneous and always up for new adventures",
  "Looking for meaningful connections in real places",
  "Love meeting people where the magic happens",
  "Here for authentic moments and real connections",
];

const DEMO_NAMES = [
  "Ava", "Jay", "Lucas", "Sophia", "Mila", "Ethan", "Zoe", "Liam", "Noah", "Mia",
  "Oliver", "Isla", "Emma", "James", "Charlotte", "Benjamin", "Amelia", "William",
  "Harper", "Alexander", "Evelyn", "Michael", "Abigail", "Daniel", "Emily", "Matthew",
];

export const DEMO_PEOPLE: Person[] = DEMO_NAMES.map((name, index) => {
  const now = Date.now();
  const venues = ['1', '2', '3', '4', '5', '6'];
  const zones = ['front', 'back', 'outdoor', 'main-floor', 'vip', 'rooftop', 'indoor'];
  
  // Varied activity states
  const activityStates = [
    { lastActive: now - Math.random() * 300000, checkedInAt: now - Math.random() * 1800000 }, // Active now (0-5 min)
    { lastActive: now - (Math.random() * 900000 + 900000), checkedInAt: now - (Math.random() * 1800000 + 1800000) }, // Recently active (15-30 min)
    { lastActive: now - (Math.random() * 3600000 + 3600000), checkedInAt: now - (Math.random() * 7200000 + 3600000) }, // Earlier (1-2 hours)
  ];
  
  const activity = activityStates[index % activityStates.length];
  const hasVenue = Math.random() > 0.4; // 60% checked in
  
  return {
    id: name.toLowerCase(),
    name,
    photo: UNSplash_PHOTOS[index % UNSplash_PHOTOS.length],
    bio: DEMO_BIOS[index % DEMO_BIOS.length],
    age: 22 + (index % 15), // Ages 22-36
    currentVenue: hasVenue ? venues[index % venues.length] : undefined,
    zone: hasVenue ? zones[index % zones.length] : undefined,
    lastActive: activity.lastActive,
    checkedInAt: hasVenue ? activity.checkedInAt : undefined,
  };
});

export function getPerson(id: string): Person | undefined {
  return DEMO_PEOPLE.find(p => p.id === id);
}

export function getPeopleAtVenue(venueId: string): Person[] {
  return DEMO_PEOPLE.filter(p => p.currentVenue === venueId);
}

// Alias for compatibility
export const demoPeopleForVenue = getPeopleAtVenue;

export function getActivePeople(): Person[] {
  const now = Date.now();
  const fiveMinutesAgo = now - 300000;
  return DEMO_PEOPLE.filter(p => p.lastActive && p.lastActive > fiveMinutesAgo);
}
