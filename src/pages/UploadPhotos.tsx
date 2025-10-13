/**
 * Purpose: Onboarding step to optionally upload a profile photo.
 * Uploading or skipping will move the user to the next onboarding step.
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import userService from '@/services/firebase/userService';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

const UploadPhotos: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { setStepComplete, completeOnboarding } = useOnboarding();

  // Check if user was redirected from venue access
  const isPhotoRequired = location.state?.message?.includes('Photo required');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !currentUser) {
      setError('Please select a photo.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      await userService.uploadProfilePhoto(currentUser.uid, file);
      setStepComplete(1); // Photos step complete

      // Mark onboarding complete now that photo uploaded
      await completeOnboarding();

      // Navigate to venues regardless of requirement state
      navigate('/venues');
    } catch (err) {
      setError('Failed to upload photo. Please try again.');
      console.error('Photo upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = async () => {
    if (!currentUser) return;
    
    try {
      await userService.updateUserProfile(currentUser.uid, {
        skippedPhotoUpload: true
      });
      setStepComplete(1); // Photos step complete
      await completeOnboarding();
      navigate('/venues');
    } catch (err) {
      setError('Failed to save preference. Please try again.');
      console.error('Photo skip error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-mingle-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Camera className="w-10 h-10 text-blue-400 mx-auto mb-2" />
          <h1 className="text-3xl font-bold text-mingle-text mb-2">Add a Profile Photo</h1>
          {isPhotoRequired ? (
            <p className="text-mingle-muted">Photo required to access venues and check in.</p>
          ) : (
            <p className="text-mingle-muted">This helps people recognize you, but you can skip for now.</p>
          )}
        </div>

        {isPhotoRequired && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              {location.state?.message || "Photo required to continue"}
            </p>
          </div>
        )}

        <div className="space-y-6">
          {/* File Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="photo-upload"
            />
            <label htmlFor="photo-upload" className="cursor-pointer">
              {preview ? (
                <div className="space-y-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <p className="text-sm text-mingle-muted">Click to change photo</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="text-sm text-mingle-muted">Click to select a photo</p>
                </div>
              )}
            </label>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleUpload}
              className="w-full"
              loading={uploading}
              disabled={uploading || !file}
            >
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </Button>
            
            {!isPhotoRequired && (
              <Button
                onClick={handleSkip}
                variant="outline"
                className="w-full"
                disabled={uploading}
              >
                Skip for Now
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPhotos;
