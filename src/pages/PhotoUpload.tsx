import React, { useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, Upload, X, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import analytics from '@/services/appAnalytics';
import { logError } from '@/utils/errorHandler';

export default function PhotoUpload() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromProfile = location.state?.from === 'profile';
  const { currentUser } = useAuth();
  const { setOnboardingStepComplete } = useOnboarding();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);

  // Memoized back handler to prevent stuck state
  const handleBack = useCallback(() => {
    if (uploading) return; // Don't navigate while uploading
    
    // Use replace to prevent back button loops
    if (fromProfile) {
      navigate('/profile', { replace: true });
    } else {
      navigate('/create-profile', { replace: true });
    }
  }, [navigate, fromProfile, uploading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file.',
          variant: 'destructive',
        });
        return;
      }
      
      if (selected.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 5MB.',
          variant: 'destructive',
        });
        return;
      }

      setFile(selected);
      const previewUrl = URL.createObjectURL(selected);
      setPreview(previewUrl);
      setUploaded(false);
    }
  };

  const handleRemovePhoto = () => {
    setFile(null);
    setPreview(null);
    setUploaded(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'No photo selected',
        description: 'Please select a photo to upload.',
        variant: 'destructive',
      });
      return;
    }

    if (!currentUser || !currentUser.uid) {
      toast({
        title: 'Authentication error',
        description: 'Please sign in again.',
        variant: 'destructive',
      });
      navigate('/signin', { replace: true });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    let progressInterval: NodeJS.Timeout | null = null;

    try {
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => prev >= 90 ? 90 : prev + 10);
      }, 200);

      const uploadPromise = (async () => {
        const { userService } = await import('@/services');
        return await userService.uploadProfilePhoto(currentUser.uid, file);
      })();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Upload timeout. Please try again.')), 30000);
      });

      await Promise.race([uploadPromise, timeoutPromise]);
      
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      setUploadProgress(100);
      setUploaded(true);
      
      setOnboardingStepComplete('photo');
      
      analytics.track('onboarding_step_completed', {
        step: 'photo',
        step_number: 2,
        has_photo: true,
      });
      
      toast({
        title: 'Photo uploaded!',
        description: 'Your profile photo has been uploaded successfully.',
      });

      // Navigate with replace to prevent back button issues
      setTimeout(() => {
        navigate(fromProfile ? '/profile' : '/checkin', { replace: true });
      }, 800);
    } catch (error: any) {
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      
      logError(error as Error, { 
        context: 'PhotoUpload.handleUpload', 
        userId: currentUser?.uid || 'unknown',
        fileName: file.name,
        fileSize: file.size 
      });
      
      let errorMessage = 'Failed to upload photo. Please try again.';
      
      if (error?.message?.includes('timeout')) {
        errorMessage = 'Upload took too long. Please check your connection and try again.';
      } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error?.message?.includes('quota') || error?.message?.includes('storage')) {
        errorMessage = 'Storage quota exceeded. Please contact support.';
      } else if (error?.message?.includes('permission') || error?.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check your account settings.';
      }
      
      toast({
        title: 'Upload failed',
        description: errorMessage,
        variant: 'destructive',
      });
      setUploadProgress(0);
      setUploaded(false);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout showBottomNav={false}>
      <div className="min-h-screen min-h-[100dvh] bg-neutral-900 flex flex-col justify-center p-4 safe-y">
        <Card className="w-full max-w-md mx-auto bg-neutral-800 shadow-xl">
          <CardHeader className="text-center space-y-2 border-b border-neutral-700 pb-4">
            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm font-semibold">1</div>
                <div className="w-12 h-1 bg-violet-600 rounded"></div>
                <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm font-semibold">2</div>
              </div>
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-violet-400 via-violet-500 to-pink-500 bg-clip-text text-transparent font-bold">
              Upload Your Photo
            </CardTitle>
            <p className="text-sm text-neutral-300">
              Step 2 of 2: Photos help others recognize you
            </p>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Photo Preview/Upload Area */}
            <div className="flex justify-center">
              <div className="relative">
                <label className="relative w-48 h-48 rounded-2xl border-2 border-dashed border-violet-500/30 flex items-center justify-center cursor-pointer overflow-hidden bg-gradient-to-br from-violet-500/5 to-violet-500/10 hover:border-violet-500/50 hover:bg-gradient-to-br hover:from-violet-500/10 hover:to-violet-500/15 transition-all duration-200 group active:scale-98">
                  <AnimatePresence mode="wait">
                    {preview ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative w-full h-full"
                      >
                        <img 
                          src={preview} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                        {uploaded && (
                          <div className="absolute inset-0 bg-violet-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-16 h-16 text-violet-400" />
                          </div>
                        )}
                        {file && !uploaded && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRemovePhoto();
                            }}
                            className="absolute top-2 right-2 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 active:scale-95 transition-all shadow-lg touch-target"
                            type="button"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center space-y-3 text-neutral-400 group-hover:text-violet-400 transition-colors p-4"
                      >
                        <Camera className="w-14 h-14" />
                        <span className="text-sm font-medium text-center">Tap to take a photo</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading || uploaded}
                  />
                </label>
              </div>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="w-full bg-neutral-700 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-violet-500 to-violet-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-sm text-center text-neutral-300">
                  Uploading... {uploadProgress}%
                </p>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Back button - fixed to not get stuck */}
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={uploading || uploaded}
                className="w-full hover:bg-neutral-700 text-neutral-300 hover:text-white min-h-[48px] touch-target"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>

              {preview && !uploaded && (
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleRemovePhoto}
                    disabled={uploading}
                    className="flex-1 hover:bg-neutral-700 text-neutral-300 hover:text-white min-h-[48px] touch-target"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Retake
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="flex-1 bg-gradient-to-r from-violet-600 to-violet-600 hover:from-violet-500 hover:to-violet-500 text-white font-semibold shadow-lg min-h-[48px] touch-target active:scale-98"
                  >
                    {uploading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full"
                        />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mr-2" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>
              )}

              {uploaded && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-4"
                >
                  <p className="text-base text-green-400 font-medium mb-1">
                    ✓ Photo uploaded!
                  </p>
                  <p className="text-sm text-neutral-400">
                    Redirecting...
                  </p>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
