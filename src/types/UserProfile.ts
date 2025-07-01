import { FieldValue } from 'firebase/firestore';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  bio?: string;
  photos?: string[];
  likedUsers: string[] | FieldValue; // for Firestore arrayUnion updates
  matches: string[] | FieldValue;    // same here
  contactShared?: string[] | FieldValue;
  reconnectRequests?: string[] | FieldValue; // for storing reconnect requests
}