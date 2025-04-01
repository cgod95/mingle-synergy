// ✅ /types/Venue.ts
export interface Venue {
    id: string;
    name: string;
    description: string;
    location: string;
    type?: string;
    image: string;
    address: string;
    checkInCount: number;
    expiryTime?: number; // ✅ Fix for VenueHeader.ts and mockData
    isVisible?: boolean; // already used in some places
    interests?: string[]; // optional, remove if you're not using
  }