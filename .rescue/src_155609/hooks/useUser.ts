import { UserProfile } from '@/types/UserProfile';

// Fake user for testing until auth is ready
const fakeUser: UserProfile = {
  id: 'test-user-id',
  name: 'Test User',
  age: 25,
  gender: 'female',
  photos: ['https://via.placeholder.com/300'],
  bio: 'Hi, I’m a fake test user!',
  likedUsers: [],
  matches: [],
};

export const useUser = () => {
  return { currentUser: fakeUser };
};