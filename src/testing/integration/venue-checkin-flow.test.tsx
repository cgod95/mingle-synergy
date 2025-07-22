import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ActiveVenue from '@/pages/ActiveVenue';
import VenueList from '@/pages/VenueList';
import logger from '@/utils/Logger';
import * as services from '@/services';

// Mock the logger
vi.mock('@/utils/Logger', () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Firebase services
vi.mock('@/services', () => ({
  venueService: {
    getVenues: vi.fn(),
    getVenueById: vi.fn(),
    checkInToVenue: vi.fn(),
    checkOutFromVenue: vi.fn(),
    getUsersAtVenue: vi.fn(),
  },
  userService: {
    getCurrentUser: vi.fn(),
    updateUser: vi.fn(),
  },
  matchService: {
    getMatches: vi.fn(),
    createMatch: vi.fn(),
  },
}));

// Mock location services
vi.mock('@/utils/locationUtils', () => ({
  getCurrentLocation: vi.fn(),
  calculateDistance: vi.fn(),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Venue Check-in Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Venue Discovery', () => {
    it('should display nearby venues and allow check-in', async () => {
      const mockVenues = [
        {
          id: '1',
          name: 'The Local Bar',
          type: 'bar',
          address: '123 Main St',
          city: 'Melbourne',
          checkInCount: 42,
          expiryTime: 120,
        },
        {
          id: '2',
          name: 'Club Nightlife',
          type: 'club',
          address: '456 Party Ave',
          city: 'Melbourne',
          checkInCount: 88,
          expiryTime: 120,
        },
      ];

      vi.mocked(services.venueService.getVenues).mockResolvedValue(mockVenues);

      renderWithProviders(<VenueList />);

      await waitFor(() => {
        expect(screen.getByText('The Local Bar')).toBeInTheDocument();
        expect(screen.getByText('Club Nightlife')).toBeInTheDocument();
      });

      const checkInButtons = screen.getAllByRole('button', { name: /check in/i });
      expect(checkInButtons).toHaveLength(2);
    });

    it('should handle venue loading errors gracefully', async () => {
      vi.mocked(services.venueService.getVenues).mockRejectedValue(
        new Error('Failed to load venues')
      );

      renderWithProviders(<VenueList />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load venues/i)).toBeInTheDocument();
      });
    });
  });

  describe('Check-in Process', () => {
    it('should successfully check in to a venue', async () => {
      const mockVenue = {
        id: '1',
        name: 'The Local Bar',
        type: 'bar',
        address: '123 Main St',
        city: 'Melbourne',
        checkInCount: 42,
        expiryTime: 120,
      };

      vi.mocked(services.venueService.getVenueById).mockResolvedValue(mockVenue);
      vi.mocked(services.venueService.checkInToVenue).mockResolvedValue();

      renderWithProviders(<ActiveVenue venueId="1" />);

      await waitFor(() => {
        expect(screen.getByText('The Local Bar')).toBeInTheDocument();
      });

      const checkInButton = screen.getByRole('button', { name: /check in/i });
      fireEvent.click(checkInButton);

      await waitFor(() => {
        expect(services.venueService.checkInToVenue).toHaveBeenCalledWith(
          expect.any(String),
          '1'
        );
        expect(logger.info).toHaveBeenCalledWith('User checked in to venue', expect.any(Object));
      });
    });

    it('should handle check-in errors and show user feedback', async () => {
      vi.mocked(services.venueService.checkInToVenue).mockRejectedValue(
        new Error('Already checked in')
      );

      renderWithProviders(<ActiveVenue venueId="1" />);

      const checkInButton = screen.getByRole('button', { name: /check in/i });
      fireEvent.click(checkInButton);

      await waitFor(() => {
        expect(screen.getByText(/already checked in/i)).toBeInTheDocument();
      });
    });

    it('should prevent check-in when user is already at another venue', async () => {
      const mockUser = {
        id: 'user1',
        isCheckedIn: true,
        currentVenue: 'other-venue',
      };

      vi.mocked(services.userService.getCurrentUser).mockResolvedValue(mockUser);

      renderWithProviders(<ActiveVenue venueId="1" />);

      const checkInButton = screen.getByRole('button', { name: /check in/i });
      fireEvent.click(checkInButton);

      await waitFor(() => {
        expect(screen.getByText(/you are already checked in at another venue/i)).toBeInTheDocument();
      });
    });
  });

  describe('Active Venue Experience', () => {
    it('should display venue details and user count', async () => {
      const mockVenue = {
        id: '1',
        name: 'The Local Bar',
        type: 'bar',
        address: '123 Main St',
        city: 'Melbourne',
        checkInCount: 42,
        expiryTime: 120,
        specials: [
          { title: 'Happy Hour', description: '5-7pm' },
        ],
      };

      const mockUsers = [
        { id: 'user1', name: 'John', age: 25 },
        { id: 'user2', name: 'Sarah', age: 28 },
      ];

      vi.mocked(services.venueService.getVenueById).mockResolvedValue(mockVenue);
      vi.mocked(services.venueService.getUsersAtVenue).mockResolvedValue(mockUsers);

      renderWithProviders(<ActiveVenue venueId="1" />);

      await waitFor(() => {
        expect(screen.getByText('The Local Bar')).toBeInTheDocument();
        expect(screen.getByText('42 people checked in')).toBeInTheDocument();
        expect(screen.getByText('Happy Hour')).toBeInTheDocument();
        expect(screen.getByText('John')).toBeInTheDocument();
        expect(screen.getByText('Sarah')).toBeInTheDocument();
      });
    });

    it('should show countdown timer for venue expiry', async () => {
      const mockVenue = {
        id: '1',
        name: 'The Local Bar',
        checkInCount: 42,
        expiryTime: 120, // 2 hours
      };

      vi.mocked(services.venueService.getVenueById).mockResolvedValue(mockVenue);

      renderWithProviders(<ActiveVenue venueId="1" />);

      await waitFor(() => {
        expect(screen.getByText(/time remaining/i)).toBeInTheDocument();
      });
    });
  });

  describe('Check-out Process', () => {
    it('should allow user to check out from venue', async () => {
      const mockVenue = {
        id: '1',
        name: 'The Local Bar',
        checkInCount: 42,
      };

      vi.mocked(services.venueService.getVenueById).mockResolvedValue(mockVenue);
      vi.mocked(services.venueService.checkOutFromVenue).mockResolvedValue();

      renderWithProviders(<ActiveVenue venueId="1" />);

      await waitFor(() => {
        expect(screen.getByText('The Local Bar')).toBeInTheDocument();
      });

      const checkOutButton = screen.getByRole('button', { name: /check out/i });
      fireEvent.click(checkOutButton);

      await waitFor(() => {
        expect(services.venueService.checkOutFromVenue).toHaveBeenCalledWith(
          expect.any(String)
        );
        expect(logger.info).toHaveBeenCalledWith('User checked out from venue', expect.any(Object));
      });
    });

    it('should handle check-out errors gracefully', async () => {
      vi.mocked(services.venueService.checkOutFromVenue).mockRejectedValue(
        new Error('Failed to check out')
      );

      renderWithProviders(<ActiveVenue venueId="1" />);

      const checkOutButton = screen.getByRole('button', { name: /check out/i });
      fireEvent.click(checkOutButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to check out/i)).toBeInTheDocument();
      });
    });
  });

  describe('Venue Unlock Logic', () => {
    it('should unlock venue features after successful check-in', async () => {
      const mockVenue = {
        id: '1',
        name: 'The Local Bar',
        checkInCount: 42,
        zones: ['front', 'back', 'outdoor'],
      };

      vi.mocked(services.venueService.getVenueById).mockResolvedValue(mockVenue);

      renderWithProviders(<ActiveVenue venueId="1" />);

      await waitFor(() => {
        expect(screen.getByText('The Local Bar')).toBeInTheDocument();
      });

      // After check-in, venue features should be unlocked
      const checkInButton = screen.getByRole('button', { name: /check in/i });
      fireEvent.click(checkInButton);

      await waitFor(() => {
        expect(screen.getByText(/venue unlocked/i)).toBeInTheDocument();
        expect(screen.getByText('front')).toBeInTheDocument();
        expect(screen.getByText('back')).toBeInTheDocument();
        expect(screen.getByText('outdoor')).toBeInTheDocument();
      });
    });
  });
}); 