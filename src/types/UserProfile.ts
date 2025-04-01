export interface UserProfile {
  id: string;
  name: string;
  photos: string[];
  bio?: string;
  isCheckedIn: boolean;
  currentVenue?: string;
  currentZone?: string;
  zone?: string;
  isVisible?: boolean;
  interests?: string[];
  gender?: 'male' | 'female' | 'non-binary' | 'other';
  age?: number;
}