import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import PrivateRoute from '@/components/auth/PrivateRoute';
import Venues from '@/pages/Venues';
import UploadPhotos from '@/pages/UploadPhotos';
import { AuthProvider } from '@/context/AuthContext';
import { OnboardingProvider } from '@/context/OnboardingContext';
import userService from '@/services/firebase/userService';
import venueService from '@/services/firebase/venueService';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { UserProfile } from '@/types/services';
import { Venue } from '@/types/services';

// Mock the services
vi.mock('@/services/firebase/userService');
vi.mock('@/services/firebase/venueService');
vi.mock('@/hooks/useUserProfile');
vi.mock('@/context/AuthContext');
vi.mock('@/context/OnboardingContext');

const mockUserService = vi.mocked(userService);
const mockVenueService = vi.mocked(venueService);
const mockUseUserProfile = vi.mocked(useUserProfile);
const mockUseAuth = vi.mocked(useAuth);
const mockUseOnboarding = vi.mocked(useOnboarding);

// Mock Firebase Auth
const mockFirebaseUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  emailVerified: true
};

// Mock user profiles
const mockUserWithPhoto: UserProfile = {
  id: 'test-user-id',
  name: 'Test User',
  age: 25,
  gender: 'male',
  photos: ['https://example.com/photo.jpg'],
  bio: 'Test bio',
  isCheckedIn: false,
  isVisible: true,
  interests: [],
  interestedIn: ['female'],
  ageRangePreference: { min: 18, max: 35 },
  matches: [],
  likedUsers: [],
  blockedUsers: [],
  skippedPhotoUpload: false
};

const mockUserWithoutPhoto: UserProfile = {
  ...mockUserWithPhoto,
  photos: [],
  skippedPhotoUpload: true
};

const mockUserSkippedPhoto: UserProfile = {
  ...mockUserWithPhoto,
  photos: [],
  skippedPhotoUpload: true
};

// Test wrapper component
interface TestWrapperProps {
  children: React.ReactNode;
  userProfile?: UserProfile;
  needsPhotoUpload?: boolean;
}

const TestWrapper: React.FC<TestWrapperProps> = ({ 
  children, 
  userProfile = mockUserWithPhoto, 
  needsPhotoUpload = false 
}) => {
  mockUseUserProfile.mockReturnValue({
    userProfile,
    loading: false,
    error: null,
    hasValidPhoto: !needsPhotoUpload,
    needsPhotoUpload
  });

  return (
    <BrowserRouter>
      <AuthProvider>
        <OnboardingProvider>
          {children}
        </OnboardingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Photo Validation Blocking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock AuthContext
    mockUseAuth.mockReturnValue({
      currentUser: mockFirebaseUser,
      isLoading: false,
      hasPhoto: false
    });

    // Mock OnboardingContext
    mockUseOnboarding.mockReturnValue({
      isOnboardingComplete: true,
      setStepComplete: vi.fn()
    });
  });

  describe('PrivateRoute Photo Validation', () => {
    it('should block access to /venues when user skipped photo upload', async () => {
      mockUseUserProfile.mockReturnValue({
        userProfile: mockUserSkippedPhoto,
        loading: false,
        error: null,
        hasValidPhoto: false,
        needsPhotoUpload: true
      });

      render(
        <TestWrapper userProfile={mockUserSkippedPhoto} needsPhotoUpload={true}>
          <PrivateRoute>
            <div>Venues Page</div>
          </PrivateRoute>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(window.location.pathname).toBe('/upload-photos');
      });
    });

    it('should block access to /venue/:id when user skipped photo upload', async () => {
      mockUseUserProfile.mockReturnValue({
        userProfile: mockUserSkippedPhoto,
        loading: false,
        error: null,
        hasValidPhoto: false,
        needsPhotoUpload: true
      });

      // Mock location to simulate venue route
      Object.defineProperty(window, 'location', {
        value: { pathname: '/venue/test-venue-id' },
        writable: true
      });

      render(
        <TestWrapper userProfile={mockUserSkippedPhoto} needsPhotoUpload={true}>
          <PrivateRoute>
            <div>Venue Page</div>
          </PrivateRoute>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(window.location.pathname).toBe('/upload-photos');
      });
    });

    it('should allow access to /venues when user has photo', async () => {
      mockUseUserProfile.mockReturnValue({
        userProfile: mockUserWithPhoto,
        loading: false,
        error: null,
        hasValidPhoto: true,
        needsPhotoUpload: false
      });

      render(
        <TestWrapper userProfile={mockUserWithPhoto} needsPhotoUpload={false}>
          <PrivateRoute>
            <div>Venues Page</div>
          </PrivateRoute>
        </TestWrapper>
      );

      expect(screen.getByText('Venues Page')).toBeInTheDocument();
    });

    it('should allow access to non-venue routes even without photo', async () => {
      mockUseUserProfile.mockReturnValue({
        userProfile: mockUserWithoutPhoto,
        loading: false,
        error: null,
        hasValidPhoto: false,
        needsPhotoUpload: true
      });

      // Mock location to simulate non-venue route
      Object.defineProperty(window, 'location', {
        value: { pathname: '/profile' },
        writable: true
      });

      render(
        <TestWrapper userProfile={mockUserWithoutPhoto} needsPhotoUpload={true}>
          <PrivateRoute>
            <div>Profile Page</div>
          </PrivateRoute>
        </TestWrapper>
      );

      expect(screen.getByText('Profile Page')).toBeInTheDocument();
    });
  });

  describe('Venues Page Check-in Validation', () => {
    beforeEach(() => {
      const mockVenue: Venue = {
        id: 'venue-1',
        name: 'Test Venue',
        city: 'Test City',
        address: 'Test Address',
        latitude: 0,
        longitude: 0,
        type: 'bar',
        expiryTime: 3600,
        zones: [],
        image: 'test-image.jpg',
        checkInCount: 0,
        checkedInUsers: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockVenueService.getVenues.mockResolvedValue([mockVenue]);
      mockUserService.getUserProfile.mockResolvedValue(mockUserWithPhoto);
    });

    it('should block check-in when user needs photo upload', async () => {
      mockUseUserProfile.mockReturnValue({
        userProfile: mockUserSkippedPhoto,
        loading: false,
        error: null,
        hasValidPhoto: false,
        needsPhotoUpload: true
      });

      const mockNavigate = vi.fn();
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useNavigate: () => mockNavigate
        };
      });

      render(
        <TestWrapper userProfile={mockUserSkippedPhoto} needsPhotoUpload={true}>
          <Venues />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Check In')).toBeInTheDocument();
      });

      const checkInButton = screen.getByText('Check In');
      expect(checkInButton).toBeDisabled();
    });

    it('should show error message when attempting to check in without photo', async () => {
      mockUseUserProfile.mockReturnValue({
        userProfile: mockUserSkippedPhoto,
        loading: false,
        error: null,
        hasValidPhoto: false,
        needsPhotoUpload: true
      });

      const mockNavigate = vi.fn();
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useNavigate: () => mockNavigate
        };
      });

      render(
        <TestWrapper userProfile={mockUserSkippedPhoto} needsPhotoUpload={true}>
          <Venues />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Check In')).toBeInTheDocument();
      });

      // Simulate check-in attempt
      fireEvent.click(screen.getByText('Check In'));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/upload-photos', {
          state: { message: 'Photo required to check in' }
        });
      });
    });

    it('should allow check-in when user has photo', async () => {
      mockUseUserProfile.mockReturnValue({
        userProfile: mockUserWithPhoto,
        loading: false,
        error: null,
        hasValidPhoto: true,
        needsPhotoUpload: false
      });

      const mockNavigate = vi.fn();
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useNavigate: () => mockNavigate
        };
      });

      render(
        <TestWrapper userProfile={mockUserWithPhoto} needsPhotoUpload={false}>
          <Venues />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Check In')).toBeInTheDocument();
      });

      const checkInButton = screen.getByText('Check In');
      expect(checkInButton).not.toBeDisabled();
    });
  });

  describe('UploadPhotos Page Redirect Handling', () => {
    it('should show required photo message when redirected from venue access', () => {
      const mockLocation = {
        pathname: '/upload-photos',
        state: { message: 'Photo required to access venues and check in' }
      };

      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useLocation: () => mockLocation
        };
      });

      render(
        <TestWrapper>
          <UploadPhotos />
        </TestWrapper>
      );

      expect(screen.getByText('Photo required to access venues and check in.')).toBeInTheDocument();
      expect(screen.getByText('Photo required to access venues and check in')).toBeInTheDocument();
    });

    it('should hide skip button when photo is required', () => {
      const mockLocation = {
        pathname: '/upload-photos',
        state: { message: 'Photo required to access venues and check in' }
      };

      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useLocation: () => mockLocation
        };
      });

      render(
        <TestWrapper>
          <UploadPhotos />
        </TestWrapper>
      );

      expect(screen.queryByText('Skip for Now')).not.toBeInTheDocument();
    });

    it('should show skip button when photo is not required', () => {
      const mockLocation = {
        pathname: '/upload-photos',
        state: null
      };

      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useLocation: () => mockLocation
        };
      });

      render(
        <TestWrapper>
          <UploadPhotos />
        </TestWrapper>
      );

      expect(screen.getByText('Skip for Now')).toBeInTheDocument();
    });

    it('should navigate back to venues after uploading photo when required', async () => {
      const mockLocation = {
        pathname: '/upload-photos',
        state: { message: 'Photo required to access venues and check in' }
      };

      const mockNavigate = vi.fn();
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useLocation: () => mockLocation,
          useNavigate: () => mockNavigate
        };
      });

      mockUserService.uploadProfilePhoto.mockResolvedValue(undefined);

      render(
        <TestWrapper>
          <UploadPhotos />
        </TestWrapper>
      );

      // Simulate file selection
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/click to select a photo/i);
      fireEvent.change(input, { target: { files: [file] } });

      // Upload photo
      fireEvent.click(screen.getByText('Upload Photo'));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/venues');
      });
    });
  });
}); 