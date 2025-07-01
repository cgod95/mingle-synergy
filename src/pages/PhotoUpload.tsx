import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import userService from '@/services/firebase/userService';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';

export default function PhotoUpload() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { setOnboardingStepComplete } = useOnboarding();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const getReturnTo = () => {
    const params = new URLSearchParams(location.search);
    return params.get('returnTo') || '/preferences';
  };

  const handleUpload = async () => {
    if (!file || !currentUser) return;
    setUploading(true);
    try {
      await userService.uploadProfilePhoto(currentUser.uid, file);
      setOnboardingStepComplete('photo');
      navigate(getReturnTo());
    } catch (error) {
      console.error('Upload failed:', error);
      // You might want to show a toast notification here
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = () => {
    setOnboardingStepComplete('photo');
    navigate(getReturnTo());
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white">
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-center text-gray-900">Upload a photo</h1>
        <p className="text-center text-gray-600">
          You'll need one to check in, but you can skip this step for now.
        </p>

        <div className="flex justify-center">
          <label className="w-40 h-40 rounded-full border border-dashed border-gray-400 flex items-center justify-center cursor-pointer overflow-hidden">
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400">Tap to select</span>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`w-full py-3 rounded-xl font-semibold text-white ${
            file ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'
          }`}
        >
          {uploading ? 'Uploading...' : 'Continue'}
        </button>
        <button
          onClick={handleSkip}
          className="w-full py-3 rounded-xl border border-gray-300 text-gray-600 font-semibold bg-white"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
} 