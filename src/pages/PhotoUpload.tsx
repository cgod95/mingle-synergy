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
      <div className="flex flex-col justify-center min-h-[80vh]">
        <Card className="w-full max-w-sm mx-auto">
          <CardHeader className="text-center space-y-2">
            <CardTitle>Upload a photo</CardTitle>
            <p className="text-sm text-neutral-600">
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
                className="w-full"
              >
                {uploading ? 'Uploading...' : 'Continue'}
              </Button>
              <Button
                variant="outline"
                onClick={handleSkip}
                className="w-full"
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