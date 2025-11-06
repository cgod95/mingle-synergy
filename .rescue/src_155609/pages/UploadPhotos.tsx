/**
 * Purpose: Onboarding step to optionally upload a profile photo.
 * Uploading or skipping will move the user to the next onboarding step.
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import userService from '@/services/firebase/userService';
import { useAuth } from '@/context/AuthContext';
import { getNextStepPath } from '@/utils/onboardingUtils';
import { useOnboarding } from '@/context/OnboardingContext';

const UploadPhotos: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { setStepComplete } = useOnboarding();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file || !currentUser) {
      setError('Please select a photo.');
      return;
    }

    setUploading(true);
    try {
      await userService.uploadProfilePhoto(currentUser.uid, file);
      await setStepComplete('photos');
      navigate(getNextStepPath(location.pathname));
    } catch (err) {
      setError('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = async () => {
    await setStepComplete('photos');
    navigate(getNextStepPath(location.pathname));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold mb-4">Add a Profile Photo</h1>
      <p className="text-gray-600 mb-6 text-center">
        This helps people recognize you, but you can skip for now.
      </p>

      <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4" />

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <div className="flex gap-4">
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        <button
          onClick={handleSkip}
          className="text-gray-500 underline"
        >
          Skip
        </button>
      </div>
    </div>
  );
};

export default UploadPhotos;
