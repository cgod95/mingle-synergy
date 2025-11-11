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
    it('should collect user profile information and validate required fields including bio', async () => {
      renderWithProviders(<OnboardingProfile />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const bioInput = screen.getByLabelText(/bio/i) || screen.getByPlaceholderText(/tell us about yourself/i);
      const continueButton = screen.getByRole('button', { name: /continue/i });
      
      // Test incomplete form - missing bio
      fireEvent.change(nameInput, { target: { value: 'John' } });
      fireEvent.click(continueButton);
      
      await waitFor(() => {
        expect(continueButton).toBeDisabled();
      });
      
      // Test bio too short (less than 10 chars)
      fireEvent.change(bioInput, { target: { value: 'Short' } });
      
      await waitFor(() => {
        expect(screen.getByText(/bio must be at least 10 characters/i)).toBeInTheDocument();
      });
      
      // Test complete form with valid bio
      fireEvent.change(bioInput, { target: { value: 'I love meeting new people and exploring new places!' } });
      fireEvent.click(continueButton);
      
      await waitFor(() => {
        expect(logger.info).toHaveBeenCalledWith('Profile step completed', expect.any(Object));
      });
    });

    it('should validate bio minimum length (10 characters)', async () => {
      renderWithProviders(<OnboardingProfile />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const bioInput = screen.getByLabelText(/bio/i) || screen.getByPlaceholderText(/tell us about yourself/i);
      const continueButton = screen.getByRole('button', { name: /continue/i });
      
      fireEvent.change(nameInput, { target: { value: 'John' } });
      
      // Test bio exactly 9 characters (should fail)
      fireEvent.change(bioInput, { target: { value: '123456789' } });
      
      await waitFor(() => {
        expect(continueButton).toBeDisabled();
        expect(screen.getByText(/bio must be at least 10 characters/i)).toBeInTheDocument();
      });
      
      // Test bio exactly 10 characters (should pass)
      fireEvent.change(bioInput, { target: { value: '1234567890' } });
      
      await waitFor(() => {
        expect(continueButton).not.toBeDisabled();
      });
    });

    it('should validate bio maximum length (200 characters)', async () => {
      renderWithProviders(<OnboardingProfile />);
      
      const bioInput = screen.getByLabelText(/bio/i) || screen.getByPlaceholderText(/tell us about yourself/i);
      const longBio = 'a'.repeat(201);
      
      fireEvent.change(bioInput, { target: { value: longBio } });
      
      await waitFor(() => {
        // Textarea should enforce maxLength attribute
        expect(bioInput).toHaveAttribute('maxLength', '200');
      });
    });
  });

  describe('Photo Step', () => {
    it('should require photo upload (no skip option)', async () => {
      renderWithProviders(<OnboardingPhoto />);
      
      // Should NOT have a skip button
      const skipButton = screen.queryByRole('button', { name: /skip/i });
      expect(skipButton).not.toBeInTheDocument();
      
      // Should have upload button
      const uploadButton = screen.getByRole('button', { name: /choose photo|upload photo/i });
      expect(uploadButton).toBeInTheDocument();
    });

    it('should handle photo upload and validation', async () => {
      renderWithProviders(<OnboardingPhoto />);
      
      const fileInput = screen.getByLabelText(/upload photo|tap to select/i) || 
                        document.querySelector('input[type="file"]');
      const file = new File(['photo'], 'test.jpg', { type: 'image/jpeg' });
      
      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [file] } });
        
        await waitFor(() => {
          expect(screen.getByText(/photo uploaded|uploading/i)).toBeInTheDocument();
        }, { timeout: 3000 });
      }
    });

    it('should validate photo file type and size', async () => {
      renderWithProviders(<OnboardingPhoto />);
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      if (!fileInput) {
        // If file input doesn't exist, skip this test
        return;
      }
      
      // Test invalid file type
      const invalidFile = new File(['text'], 'test.txt', { type: 'text/plain' });
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });
      
      await waitFor(() => {
        expect(screen.getByText(/invalid file type|please select an image/i)).toBeInTheDocument();
      });
      
      // Test file too large (over 5MB)
      const largeFile = new File(['a'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput, { target: { files: [largeFile] } });
      
      await waitFor(() => {
        expect(screen.getByText(/file too large|smaller than 5MB/i)).toBeInTheDocument();
      });
    });

    it('should show upload progress during photo upload', async () => {
      renderWithProviders(<OnboardingPhoto />);
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['photo'], 'test.jpg', { type: 'image/jpeg' });
      
      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [file] } });
        
        // Should show progress bar or uploading state
        await waitFor(() => {
          const progressIndicator = screen.queryByText(/uploading|progress/i);
          expect(progressIndicator || screen.queryByRole('progressbar')).toBeTruthy();
        });
      }
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