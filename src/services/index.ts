
import { AuthService } from '@/types/services';

// Import services
import firebaseAuthService from './firebase/authService';
import mockAuthService from './mock/mockAuthService';

// Determine which implementation to use
// Setting default to use Firebase unless explicitly set to use mocks
const USE_MOCK = import.meta.env.VITE_USE_MOCK_SERVICES === 'true';

// Export services
const services = {
  auth: USE_MOCK ? mockAuthService : firebaseAuthService,
};

export default services;
