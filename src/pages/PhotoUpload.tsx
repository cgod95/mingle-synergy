import React, { useState, useRef } from 'react';
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      // Validate file type
      if (!selected.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file.',
          variant: 'destructive',
        });
        return;
      }
      
      // Validate file size (max 5MB)
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
    if (!file || !currentUser) {
      toast({
        title: 'No photo selected',
        description: 'Please select a photo to upload.',
        variant: 'destructive',
      });
      return;
    }

    // Re-check currentUser.uid before async operations (could become null during operation)
    if (!currentUser?.uid) {
      toast({
        title: 'Authentication error',
        description: 'Please sign in again.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress (Firebase doesn't provide progress for uploadProfilePhoto)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const { userService } = await import('@/services');
      await userService.uploadProfilePhoto(currentUser.uid, file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploaded(true);
      
      // Mark photo step as complete
      setOnboardingStepComplete('photo');
      
      // Track onboarding step completion
      analytics.track('onboarding_step_completed', {
        step: 'photo',
        step_number: 2,
        has_photo: true,
      });
      
      toast({
        title: 'Photo uploaded!',
        description: 'Your profile photo has been uploaded successfully.',
      });

      // Navigate to next step after a brief delay
      setTimeout(() => {
        navigate(fromProfile ? '/profile' : '/preferences');
      }, 1500);
    } catch (error: any) {
      logError(error as Error, { 
        context: 'PhotoUpload.handleUpload', 
        userId: currentUser?.uid || 'unknown',
        fileName: file.name,
        fileSize: file.size 
      });
      
      // Enhanced error handling with specific error messages
      let errorMessage = 'Failed to upload photo. Please try again.';
      
      if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
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

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <Layout showBottomNav={false}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 via-pink-50 to-white flex flex-col justify-center p-4">
        <Card className="w-full max-w-md mx-auto border-2 border-primary/20 bg-gradient-to-br from-white via-primary/5 to-primary/10 shadow-xl">
          <CardHeader className="text-center space-y-2 bg-gradient-to-r from-primary/10 via-primary/10 to-primary/10 border-b border-primary/20">
            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">1</div>
                <div className="w-12 h-1 bg-primary rounded"></div>
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">2</div>
                <div className="w-12 h-1 bg-primary/20 rounded"></div>
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold">3</div>
              </div>
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
              Take Your Selfie
            </CardTitle>
            <p className="text-sm text-neutral-700">
              Step 2 of 3: Take a selfie with your camera. This is required to use Mingle.
            </p>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Photo Preview/Upload Area */}
            <div className="flex justify-center">
              <div className="relative">
                <label className="relative w-48 h-48 rounded-2xl border-2 border-dashed border-primary/30 flex items-center justify-center cursor-pointer overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 hover:border-primary/50 hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/15 transition-all duration-200 group">
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
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <CheckCircle2 className="w-16 h-16 text-primary" />
                          </div>
                        )}
                        {file && !uploaded && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRemovePhoto();
                            }}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg"
                            type="button"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center space-y-3 text-neutral-500 group-hover:text-primary transition-colors"
                      >
                        <Camera className="w-12 h-12" />
                        <span className="text-sm font-medium">Tap to take a selfie</span>
                        <span className="text-xs">Use your camera</span>
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
                <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs text-center text-neutral-600">
                  Uploading... {uploadProgress}%
                </p>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/create-profile')}
                  disabled={uploading || uploaded}
                  className="flex-1 border-2 border-primary/20 hover:bg-primary/5"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                {!preview && (
                  <Button
                    onClick={handleClickUpload}
                    disabled={uploading}
                    className="flex-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Take Selfie
                  </Button>
                )}
              </div>

              {preview && !uploaded && (
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleRemovePhoto}
                    disabled={uploading}
                    className="flex-1 border-2 border-primary/20 hover:bg-primary/5"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Retake
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="flex-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg"
                  >
                  {uploading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"
                      />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </>
                  )}
                  </Button>
                </div>
              )}

              {uploaded && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <p className="text-sm text-green-600 font-medium mb-2">
                    ✓ Photo uploaded successfully!
                  </p>
                  <p className="text-xs text-neutral-500">
                    Redirecting to next step...
                  </p>
                </motion.div>
              )}
            </div>

            {/* Help Text */}
            <div className="pt-4 border-t border-primary/20">
              <p className="text-xs text-center text-neutral-500">
                <strong>Take a selfie:</strong> Use your camera to take a clear photo where your face is visible. 
                This helps others recognize you at venues.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
} 