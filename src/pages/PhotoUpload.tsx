import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import userService from '@/services/firebase/userService';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';

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
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 via-pink-50 to-white flex flex-col justify-center p-4">
        <Card className="w-full max-w-md mx-auto border-2 border-indigo-100 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 shadow-xl">
          <CardHeader className="text-center space-y-2 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-indigo-100">
            <CardTitle className="text-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
              Upload a photo
            </CardTitle>
            <p className="text-sm text-neutral-700">
              You'll need one to check in, but you can skip this step for now.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <label className="w-40 h-40 rounded-2xl border-2 border-dashed border-neutral-300 flex items-center justify-center cursor-pointer overflow-hidden hover:border-neutral-400 transition-colors">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-neutral-400">Tap to select</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg"
              >
                {uploading ? 'Uploading...' : 'Continue'}
              </Button>
              <Button
                variant="outline"
                onClick={handleSkip}
                className="w-full border-2 border-indigo-200 hover:bg-indigo-50"
              >
                Skip for now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
} 