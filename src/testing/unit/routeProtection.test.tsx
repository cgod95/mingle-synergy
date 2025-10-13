import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PrivateRoute from '@/components/auth/PrivateRoute';

// Mock the AppStateContext
vi.mock('@/context/AppStateContext', () => ({
  useAppState: vi.fn(() => ({
    currentUser: { id: 'test-user', name: 'Test User' },
    setCurrentUser: vi.fn(),
    interests: [],
    setInterests: vi.fn(),
    matches: [],
    setMatches: vi.fn(),
    likedUsers: [],
    setLikedUsers: vi.fn(),
    matchedUser: null,
    setMatchedUser: vi.fn(),
    showMatchModal: false,
    setShowMatchModal: vi.fn(),
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    expressInterest: vi.fn(),
    shareContact: vi.fn(),
  }))
}));

// Mock components
vi.mock('@/components/PrivateLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="private-layout">{children}</div>
}));

vi.mock('@/components/BottomNav', () => ({
  default: () => <div data-testid="bottom-nav">Bottom Nav</div>
}));

describe('Route Protection', () => {
  it('should render children when component is loaded', () => {
    render(
      <BrowserRouter>
        <PrivateRoute>
          <div>Protected Content</div>
        </PrivateRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should handle function children', () => {
    render(
      <BrowserRouter>
        <PrivateRoute>
          {() => <div>Function Content</div>}
        </PrivateRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Function Content')).toBeInTheDocument();
  });

  it('should render without crashing', () => {
    expect(() => {
      render(
        <BrowserRouter>
          <PrivateRoute>
            <div>Test Content</div>
          </PrivateRoute>
        </BrowserRouter>
      );
    }).not.toThrow();
  });
}); 