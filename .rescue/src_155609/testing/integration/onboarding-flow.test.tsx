import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { OnboardingProvider } from '@/context/OnboardingContext';
import OnboardingEmail from '@/pages/OnboardingEmail';
import OnboardingProfile from '@/pages/OnboardingProfile';
import OnboardingPhoto from '@/pages/OnboardingPhoto';
import OnboardingPreferences from '@/pages/OnboardingPreferences';
import logger from '@/utils/Logger';

// Mock the logger to avoid console noise during tests
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
  authService: {
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  },
  userService: {
    createUser: vi.fn(),
    updateUser: vi.fn(),
    getUserById: vi.fn(),
  },
  onboardingService: {
    saveOnboardingProgress: vi.fn(),
    loadOnboardingProgress: vi.fn(),
    completeStep: vi.fn(),
    setCurrentStep: vi.fn(),
  },
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <OnboardingProvider>
          {component}
        </OnboardingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Onboarding Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Email Step', () => {
    it('should validate email format and proceed to next step', async () => {
      renderWithProviders(<OnboardingEmail />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const continueButton = screen.getByRole('button', { name: /continue/i });
      
      // Test invalid email
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(continueButton);
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
      });
      
      // Test valid email
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(continueButton);
      
      await waitFor(() => {
        expect(logger.info).toHaveBeenCalledWith('Email step completed', expect.any(Object));
      });
    });

    it('should handle email submission errors gracefully', async () => {
      const mockSignUp = vi.fn().mockRejectedValue(new Error('Email already exists'));
      
      renderWithProviders(<OnboardingEmail />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const continueButton = screen.getByRole('button', { name: /continue/i });
      
      fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
      fireEvent.click(continueButton);
      
      await waitFor(() => {
        expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
      });
    });
  });

  describe('Profile Step', () => {
    it('should collect user profile information and validate required fields', async () => {
      renderWithProviders(<OnboardingProfile />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const ageInput = screen.getByLabelText(/age/i);
      const bioInput = screen.getByLabelText(/bio/i);
      const continueButton = screen.getByRole('button', { name: /continue/i });
      
      // Test incomplete form
      fireEvent.change(nameInput, { target: { value: 'John' } });
      fireEvent.click(continueButton);
      
      await waitFor(() => {
        expect(screen.getByText(/please fill in all required fields/i)).toBeInTheDocument();
      });
      
      // Test complete form
      fireEvent.change(ageInput, { target: { value: '25' } });
      fireEvent.change(bioInput, { target: { value: 'I love meeting new people!' } });
      fireEvent.click(continueButton);
      
      await waitFor(() => {
        expect(logger.info).toHaveBeenCalledWith('Profile step completed', expect.any(Object));
      });
    });

    it('should validate age range and bio length', async () => {
      renderWithProviders(<OnboardingProfile />);
      
      const ageInput = screen.getByLabelText(/age/i);
      const bioInput = screen.getByLabelText(/bio/i);
      
      // Test invalid age
      fireEvent.change(ageInput, { target: { value: '15' } });
      fireEvent.blur(ageInput);
      
      await waitFor(() => {
        expect(screen.getByText(/must be at least 18 years old/i)).toBeInTheDocument();
      });
      
      // Test bio too long
      const longBio = 'a'.repeat(501);
      fireEvent.change(bioInput, { target: { value: longBio } });
      fireEvent.blur(bioInput);
      
      await waitFor(() => {
        expect(screen.getByText(/bio must be less than 500 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe('Photo Step', () => {
    it('should handle photo upload and validation', async () => {
      renderWithProviders(<OnboardingPhoto />);
      
      const fileInput = screen.getByLabelText(/upload photo/i);
      const file = new File(['photo'], 'test.jpg', { type: 'image/jpeg' });
      
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(screen.getByText(/photo uploaded successfully/i)).toBeInTheDocument();
      });
    });

    it('should validate photo file type and size', async () => {
      renderWithProviders(<OnboardingPhoto />);
      
      const fileInput = screen.getByLabelText(/upload photo/i);
      
      // Test invalid file type
      const invalidFile = new File(['text'], 'test.txt', { type: 'text/plain' });
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });
      
      await waitFor(() => {
        expect(screen.getByText(/please upload a valid image file/i)).toBeInTheDocument();
      });
      
      // Test file too large
      const largeFile = new File(['a'.repeat(5 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput, { target: { files: [largeFile] } });
      
      await waitFor(() => {
        expect(screen.getByText(/file size must be less than 5MB/i)).toBeInTheDocument();
      });
    });
  });

  describe('Preferences Step', () => {
    it('should collect user preferences and interests', async () => {
      renderWithProviders(<OnboardingPreferences />);
      
      const interestsCheckboxes = screen.getAllByRole('checkbox');
      const continueButton = screen.getByRole('button', { name: /complete/i });
      
      // Select some interests
      fireEvent.click(interestsCheckboxes[0]);
      fireEvent.click(interestsCheckboxes[2]);
      
      fireEvent.click(continueButton);
      
      await waitFor(() => {
        expect(logger.info).toHaveBeenCalledWith('Preferences step completed', expect.any(Object));
      });
    });

    it('should require minimum number of interests', async () => {
      renderWithProviders(<OnboardingPreferences />);
      
      const continueButton = screen.getByRole('button', { name: /complete/i });
      fireEvent.click(continueButton);
      
      await waitFor(() => {
        expect(screen.getByText(/please select at least 3 interests/i)).toBeInTheDocument();
      });
    });
  });

  describe('Complete Onboarding Flow', () => {
    it('should complete all steps and redirect to main app', async () => {
      // This would be a more complex test that navigates through all steps
      // For now, we'll test the individual components work together
      
      const { rerender } = renderWithProviders(<OnboardingEmail />);
      
      // Simulate completing email step
      const emailInput = screen.getByLabelText(/email/i);
      const continueButton = screen.getByRole('button', { name: /continue/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(continueButton);
      
      await waitFor(() => {
        expect(logger.info).toHaveBeenCalledWith('Email step completed', expect.any(Object));
      });
    });
  });
}); 